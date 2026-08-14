from __future__ import annotations

from io import BytesIO
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend import auth, models
from backend.deps import get_db
from backend.migrations import check_and_migrate_db
from backend.routers import categories, folders, media, prompts, settings


@pytest.fixture()
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with engine.connect() as connection:
        connection.execute(text("PRAGMA foreign_keys=ON"))
    models.Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    app = FastAPI()
    app.include_router(prompts.router)
    app.include_router(folders.router)
    app.include_router(categories.router)
    app.include_router(settings.router)
    app.include_router(media.router)

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    image_dir = tmp_path / "images"
    image_dir.mkdir()
    monkeypatch.setattr(prompts, "IMAGES_DIR", str(image_dir))
    monkeypatch.setattr(media, "IMAGES_DIR", str(image_dir))
    auth.revoke_all_private_sessions()

    with TestClient(app) as test_client:
        yield test_client, session_factory, image_dir

    auth.revoke_all_private_sessions()
    engine.dispose()


def prompt_payload(**overrides):
    payload = {
        "title": "A safe title",
        "description": "Description",
        "negative_prompt": "",
        "positive_prompts": ["A prompt"],
        "categories": [],
        "tags": [],
        "is_nsfw": False,
        "prompt_type": "structured",
    }
    payload.update(overrides)
    return payload


def authenticate(client: TestClient) -> dict[str, str]:
    assert client.post("/settings/pin-set", json={"pin": "1234"}).status_code == 200
    response = client.post("/settings/pin-verify", json={"pin": "1234"})
    assert response.status_code == 200
    token = response.json()["session_token"]
    assert token
    return {"X-Prompt-Archive-Session": token}


def test_private_reads_require_backend_session_and_do_not_leak_titles(client):
    test_client, _, _ = client
    headers = authenticate(test_client)
    created = test_client.post(
        "/prompts/",
        json=prompt_payload(title="Private title", is_nsfw=True),
        headers=headers,
    )
    assert created.status_code == 200
    prompt_id = created.json()["id"]

    assert test_client.get("/prompts/?nsfw=true").status_code == 401
    assert test_client.get("/prompts/?show_hidden=true").status_code == 401
    public_detail = test_client.get(f"/prompts/{prompt_id}")
    assert public_detail.status_code == 404
    assert "Private title" not in public_detail.text

    private_list = test_client.get("/prompts/?nsfw=true", headers=headers)
    assert private_list.status_code == 200
    assert private_list.json()["items"][0]["title"] == "Private title"


def test_private_categories_are_not_exposed_to_public_scope(client):
    test_client, _, _ = client
    headers = authenticate(test_client)
    created = test_client.post(
        "/prompts/",
        json=prompt_payload(
            title="Private category prompt",
            is_nsfw=True,
            categories=["Private-only category"],
        ),
        headers=headers,
    )
    assert created.status_code == 200

    public_categories = test_client.get("/categories/")
    assert public_categories.status_code == 200
    assert "Private-only category" not in {
        category["name"] for category in public_categories.json()
    }

    assert test_client.get("/categories/?nsfw=true").status_code == 401
    private_categories = test_client.get("/categories/?nsfw=true", headers=headers)
    assert private_categories.status_code == 200
    assert "Private-only category" in {
        category["name"] for category in private_categories.json()
    }


def test_pin_reset_requires_the_backend_session(client):
    test_client, _, _ = client
    headers = authenticate(test_client)

    assert test_client.delete("/settings/pin-reset").status_code == 401
    reset = test_client.delete("/settings/pin-reset", headers=headers)
    assert reset.status_code == 200
    assert test_client.get("/settings/pin-status").json() == {"is_set": False}


def test_lock_revokes_only_the_callers_backend_session(client):
    test_client, _, _ = client
    first_headers = authenticate(test_client)
    second_response = test_client.post(
        "/settings/pin-verify",
        json={"pin": "1234"},
    )
    second_headers = {
        "X-Prompt-Archive-Session": second_response.json()["session_token"]
    }

    assert test_client.delete(
        "/settings/session",
        headers=first_headers,
    ).status_code == 200
    assert test_client.delete(
        "/settings/session",
        headers=first_headers,
    ).status_code == 401
    assert test_client.post(
        "/prompts/",
        json=prompt_payload(title="Still private", is_nsfw=True),
        headers=second_headers,
    ).status_code == 200


def test_folder_id_can_be_omitted_or_explicitly_cleared(client):
    test_client, _, _ = client
    folder = test_client.post(
        "/folders/",
        json={"name": "Folder", "color": "#123456", "is_nsfw": False},
    )
    assert folder.status_code == 200
    folder_id = folder.json()["id"]

    created = test_client.post(
        "/prompts/",
        json=prompt_payload(folder_id=folder_id),
    )
    assert created.status_code == 200
    prompt_id = created.json()["id"]

    update_without_folder = prompt_payload(title="Keeps folder")
    retained = test_client.put(f"/prompts/{prompt_id}", json=update_without_folder)
    assert retained.status_code == 200
    assert retained.json()["folder_id"] == folder_id

    cleared = test_client.put(
        f"/prompts/{prompt_id}",
        json={**update_without_folder, "folder_id": None},
    )
    assert cleared.status_code == 200
    assert cleared.json()["folder_id"] is None

    missing_folder = test_client.post(
        "/prompts/",
        json=prompt_payload(folder_id=99999),
    )
    assert missing_folder.status_code == 404


def test_partial_prompt_update_preserves_omitted_fields(client):
    test_client, _, _ = client
    created = test_client.post(
        "/prompts/",
        json=prompt_payload(
            title="Before partial update",
            description="Keep this description",
            negative_prompt="Keep this negative prompt",
            positive_prompts=["Keep this positive prompt"],
            categories=["Keep this category"],
            tags=["Keep this tag"],
        ),
    )
    assert created.status_code == 200
    prompt_id = created.json()["id"]

    updated = test_client.put(
        f"/prompts/{prompt_id}",
        json={"title": "After partial update"},
    )
    assert updated.status_code == 200
    payload = updated.json()
    assert payload["title"] == "After partial update"
    assert payload["description"] == "Keep this description"
    assert payload["negative_prompt"] == "Keep this negative prompt"
    assert [item["content"] for item in payload["positive_prompts"]] == [
        "Keep this positive prompt"
    ]
    assert [item["name"] for item in payload["categories"]] == [
        "Keep this category"
    ]
    assert [item["name"] for item in payload["tags"]] == ["Keep this tag"]
    assert payload["is_nsfw"] is False


def test_upload_validates_real_webp_mime_and_size_and_rolls_back(client, monkeypatch):
    test_client, _, image_dir = client
    created = test_client.post("/prompts/", json=prompt_payload())
    assert created.status_code == 200
    prompt_id = created.json()["id"]

    webp_buffer = BytesIO()
    Image.new("RGB", (2, 2), "red").save(webp_buffer, format="WEBP")
    valid_webp = webp_buffer.getvalue()

    valid = test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("preview.webp", valid_webp, "image/webp")},
    )
    assert valid.status_code == 200
    filename = valid.json()["filename"]
    assert test_client.get(f"/static/{prompt_id}/{filename}").status_code == 200
    assert test_client.get(f"/static/{prompt_id}/../{filename}").status_code != 200

    fake_webp = test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("fake.webp", b"RIFF0000WEBP", "image/webp")},
    )
    assert fake_webp.status_code == 400

    wrong_mime = test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("wrong.webp", valid_webp, "image/png")},
    )
    assert wrong_mime.status_code == 400

    monkeypatch.setattr(prompts, "MAX_IMAGE_BYTES", 8)
    oversized = test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("large.webp", valid_webp, "image/webp")},
    )
    assert oversized.status_code == 413

    original_add_image = prompts.crud.add_image_to_prompt

    def fail_after_file_write(*args, **kwargs):
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(prompts.crud, "add_image_to_prompt", fail_after_file_write)
    monkeypatch.setattr(prompts, "MAX_IMAGE_BYTES", 10 * 1024 * 1024)
    failed = test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("rollback.webp", valid_webp, "image/webp")},
    )
    assert failed.status_code == 500
    assert not any(image_dir.joinpath(str(prompt_id)).glob("rollback*"))
    monkeypatch.setattr(prompts.crud, "add_image_to_prompt", original_add_image)


def test_private_media_requires_backend_session(client):
    test_client, _, _ = client
    headers = authenticate(test_client)
    created = test_client.post(
        "/prompts/",
        json=prompt_payload(title="Private media", is_nsfw=True),
        headers=headers,
    )
    prompt_id = created.json()["id"]
    image_buffer = BytesIO()
    Image.new("RGB", (2, 2), "blue").save(image_buffer, format="PNG")
    upload = test_client.post(
        f"/prompts/{prompt_id}/images",
        headers=headers,
        files={"file": ("private.png", image_buffer.getvalue(), "image/png")},
    )
    assert upload.status_code == 200
    filename = upload.json()["filename"]
    assert test_client.get(f"/static/{prompt_id}/{filename}").status_code == 404
    assert test_client.get(
        f"/static/{prompt_id}/{filename}", headers=headers
    ).status_code == 200
    private_media = test_client.get(
        f"/static/{prompt_id}/{filename}", headers=headers
    )
    assert private_media.headers["cache-control"] == "private, no-store"


def test_hidden_non_nsfw_prompt_is_private_for_updates_and_media(client):
    test_client, _, _ = client
    created = test_client.post(
        "/prompts/",
        json=prompt_payload(title="Hidden but safe"),
    )
    assert created.status_code == 200
    prompt_id = created.json()["id"]

    hidden = test_client.post(
        "/bulk/hide",
        json={"prompt_ids": [prompt_id], "folder_ids": [], "hidden": True},
    )
    assert hidden.status_code == 200

    update_payload = prompt_payload(title="Must stay private", is_nsfw=False)
    assert test_client.put(f"/prompts/{prompt_id}", json=update_payload).status_code == 404

    image_buffer = BytesIO()
    Image.new("RGB", (2, 2), "green").save(image_buffer, format="PNG")
    assert test_client.post(
        f"/prompts/{prompt_id}/images",
        files={"file": ("hidden.png", image_buffer.getvalue(), "image/png")},
    ).status_code == 404

    headers = authenticate(test_client)
    updated = test_client.put(
        f"/prompts/{prompt_id}",
        json=update_payload,
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["is_hidden"] is True

    authenticated_upload = test_client.post(
        f"/prompts/{prompt_id}/images",
        headers=headers,
        files={"file": ("hidden.png", image_buffer.getvalue(), "image/png")},
    )
    assert authenticated_upload.status_code == 200


def test_hidden_non_nsfw_prompt_requires_session_at_create_and_update(client):
    test_client, _, _ = client
    hidden_payload = prompt_payload(title="Hidden at creation", is_hidden=True)
    assert test_client.post("/prompts/", json=hidden_payload).status_code == 401

    headers = authenticate(test_client)
    created_private = test_client.post(
        "/prompts/",
        json=hidden_payload,
        headers=headers,
    )
    assert created_private.status_code == 200
    assert created_private.json()["is_hidden"] is True

    public = test_client.post(
        "/prompts/",
        json=prompt_payload(title="Will become hidden"),
    )
    assert public.status_code == 200
    public_id = public.json()["id"]
    update_payload = prompt_payload(title="Hidden after update", is_hidden=True)

    assert test_client.put(
        f"/prompts/{public_id}",
        json=update_payload,
    ).status_code == 401

    updated = test_client.put(
        f"/prompts/{public_id}",
        json=update_payload,
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["is_hidden"] is True


def test_server_side_filters_keep_pagination_complete(client):
    test_client, _, _ = client
    for index in range(25):
        response = test_client.post(
            "/prompts/",
            json=prompt_payload(
                title=f"JSON {index:02d}",
                prompt_type="json",
            ),
        )
        assert response.status_code == 200

    first_page = test_client.get(
        "/prompts/",
        params={"limit": 20, "prompt_type": "json", "sort": "title_asc"},
    )
    second_page = test_client.get(
        "/prompts/",
        params={
            "skip": 20,
            "limit": 20,
            "prompt_type": "json",
            "sort": "title_asc",
        },
    )
    assert first_page.status_code == second_page.status_code == 200
    assert first_page.json()["total"] == 25
    assert len(first_page.json()["items"]) == 20
    assert len(second_page.json()["items"]) == 5
    assert first_page.json()["items"][0]["title"] == "JSON 00"
    assert second_page.json()["items"][-1]["title"] == "JSON 24"


def test_migration_errors_are_not_swallowed():
    broken_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    with pytest.raises(Exception):
        check_and_migrate_db(broken_engine)
    broken_engine.dispose()
