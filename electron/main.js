const { app, BrowserWindow, protocol, nativeTheme, ipcMain, dialog, net } = require("electron");
const { spawn, exec } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const APP_SCHEME = "app";
const APP_ID = "prompt-archive";
const BACKEND_HOST = "127.0.0.1";
const BACKEND_PORT = 8000;
const HEALTH_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}/health`;
const THEME_STATE_FILE = "theme.json";
const HEALTH_CHECK_INTERVAL_MS = 500;
const HEALTH_CHECK_TIMEOUT_MS = 30_000;
const DYNAMIC_ROUTE_PLACEHOLDER = "__placeholder__";
const DYNAMIC_ROUTE_BASES = ["prompts"];

const isDev = !app.isPackaged;
const repoRoot = path.join(__dirname, "..");

// Production resources live at:
//   resources/prompt-archive/           (static frontend export)
//   resources/prompt-archive-backend/   (FastAPI package)
//   resources/prompt-archive-venv/      (Python runtime)
const rendererRoot = isDev ? path.join(repoRoot, "frontend", "out") : path.join(process.resourcesPath, APP_ID);
const backendRoot = isDev ? repoRoot : path.join(process.resourcesPath, `${APP_ID}-backend`);
const pythonExe = isDev
  ? path.join(repoRoot, "venv", "Scripts", "python.exe")
  : path.join(process.resourcesPath, `${APP_ID}-venv`, "Scripts", "python.exe");

let backendProcess = null;
let mainWindow = null;

// Must be called BEFORE app is ready — marks app:// as a secure, standard scheme
protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

function log(message) {
  console.log(`[main] ${message}`);
}

// ── Backend lifecycle (mirrors Studio Suite PythonBackend) ──────────────────

// Data location resolution:
//   1. %APPDATA%\studio-suite\data\prompt-archive — existing Studio Suite data
//      (database.sqlite or images/ with files). Optional but preferred when
//      present so previously archived prompts and media are picked up.
//   2. %APPDATA%\prompt-archive — canonical data dir for this app; created on
//      first use and used whenever the Studio Suite path does not exist.
function resolveDataDir() {
  const primary = path.join(app.getPath("appData"), "prompt-archive");
  const studioSuite = path.join(app.getPath("appData"), "studio-suite", "data", "prompt-archive");

  const hasSuiteDatabase = fs.existsSync(path.join(studioSuite, "database.sqlite"));
  let hasSuiteImages = false;
  try {
    hasSuiteImages = fs.readdirSync(path.join(studioSuite, "images")).length > 0;
  } catch {}

  if (hasSuiteDatabase || hasSuiteImages) {
    log(`[backend] Data dir: using existing Studio Suite data at ${studioSuite}`);
    return studioSuite;
  }

  log(`[backend] Data dir: using ${primary}`);
  return primary;
}

function startBackend() {
  const dataDir = resolveDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  log(`[backend] Starting uvicorn...`);
  log(`[backend]   Python: ${pythonExe}`);
  log(`[backend]   CWD: ${backendRoot}`);
  log(`[backend]   Data dir: ${dataDir}`);

  backendProcess = spawn(
    pythonExe,
    ["-m", "uvicorn", "backend.main:app", "--host", BACKEND_HOST, "--port", String(BACKEND_PORT), "--no-access-log"],
    {
      cwd: backendRoot,
      env: { ...process.env, PROMPT_ARCHIVE_DATA_DIR: dataDir, PYTHONUNBUFFERED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    },
  );
  backendProcess.stdout?.on("data", (chunk) => log(`[backend] ${String(chunk).trim()}`));
  backendProcess.stderr?.on("data", (chunk) => log(`[backend] ${String(chunk).trim()}`));
  backendProcess.on("error", (error) => {
    log(`[backend] Failed to start: ${error.message}`);
    backendProcess = null;
  });
  backendProcess.on("close", (code) => {
    log(`[backend] Process exited with code ${code}`);
    backendProcess = null;
  });
}

function stopBackend() {
  if (!backendProcess || !backendProcess.pid) return;
  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(backendProcess.pid), "/f", "/t"], { windowsHide: true });
  } else {
    backendProcess.kill("SIGTERM");
  }
  backendProcess = null;
}

function waitForBackend() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const poll = () => {
      if (Date.now() - startTime > HEALTH_CHECK_TIMEOUT_MS) {
        resolve(false);
        return;
      }
      const req = require("node:http").get(HEALTH_URL, (res) => {
        if (res.statusCode === 200) {
          res.resume();
          resolve(true);
        } else {
          res.resume();
          setTimeout(poll, HEALTH_CHECK_INTERVAL_MS);
        }
      });
      req.on("error", () => setTimeout(poll, HEALTH_CHECK_INTERVAL_MS));
      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(poll, HEALTH_CHECK_INTERVAL_MS);
      });
    };
    poll();
  });
}

// ── app:// protocol handler (mirrors Studio Suite multi-app handler) ─────────

function safeDecodePathname(pathname) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function isPathInsideRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function fetchLocalFile(filePath) {
  try {
    const response = await net.fetch(pathToFileURL(filePath).href);
    return response.ok ? response : null;
  } catch {
    return null;
  }
}

// Next static export flattens dynamic-route metadata as __next.prompts.$d$id/…
// into a single file name; normalize it back to a directory path.
function normalizeNextMetadataPath(pathname) {
  const rawSegments = pathname.split("/").filter(Boolean);
  if (rawSegments.length === 0) return pathname;

  const normalized = [];
  for (const segment of rawSegments) {
    if (segment.startsWith("__next.") && segment.endsWith(".txt")) {
      const parts = segment.split(".");
      if (parts.length >= 4 && parts[0] === "__next") {
        normalized.push(`${parts[0]}.${parts[1]}`);
        const tail = parts.slice(2, -1);
        for (let i = 0; i < tail.length; i += 1) {
          const token = tail[i];
          const isLast = i === tail.length - 1;
          normalized.push(isLast ? `${token}.txt` : token);
        }
        continue;
      }
    }
    normalized.push(segment);
  }

  return `/${normalized.join("/")}`;
}

function resolveDynamicPlaceholderAssetPath(pathname, safeRoot) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  const [base, dynamicSegment, ...rest] = segments;
  if (!DYNAMIC_ROUTE_BASES.includes(base)) return null;

  const dynamicExt = path.extname(dynamicSegment);
  if (rest.length === 0 && dynamicExt === "") return null;

  if (dynamicSegment === DYNAMIC_ROUTE_PLACEHOLDER) return null;
  if (dynamicSegment.startsWith(`${DYNAMIC_ROUTE_PLACEHOLDER}.`)) return null;

  const placeholderSegment =
    rest.length === 0 ? `${DYNAMIC_ROUTE_PLACEHOLDER}${dynamicExt || ".txt"}` : DYNAMIC_ROUTE_PLACEHOLDER;

  const placeholderPath = path.resolve(safeRoot, `./${[base, placeholderSegment, ...rest].join("/")}`);
  if (!isPathInsideRoot(safeRoot, placeholderPath)) return null;
  if (!fs.existsSync(placeholderPath)) return null;
  return placeholderPath;
}

function registerAppProtocol() {
  protocol.handle(APP_SCHEME, async (request) => {
    const url = new URL(request.url);

    const appId = url.hostname;
    if (!appId || !/^[a-z0-9-]+$/.test(appId)) {
      log(`Invalid app ID in URL: ${request.url}`);
      return new Response("Invalid app ID", { status: 400 });
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const decodedPathname = safeDecodePathname(pathname);
    const normalizedPathname = normalizeNextMetadataPath(decodedPathname);

    // Production: app://{appId}/{pathname} → resources/{appId}/{pathname}
    const safeRoot = path.resolve(rendererRoot);
    const filePath = path.resolve(safeRoot, `.${decodedPathname}`);

    if (!isPathInsideRoot(safeRoot, filePath)) {
      log(`Forbidden: ${request.url}`);
      return new Response("Forbidden", { status: 403 });
    }

    log(`app://${appId}${pathname} → ${filePath}`);
    const directResponse = await fetchLocalFile(filePath);
    if (directResponse) return directResponse;

    if (normalizedPathname !== decodedPathname) {
      const normalizedFilePath = path.resolve(safeRoot, `.${normalizedPathname}`);
      if (isPathInsideRoot(safeRoot, normalizedFilePath)) {
        const normalizedResponse = await fetchLocalFile(normalizedFilePath);
        if (normalizedResponse) return normalizedResponse;
      }
    }

    // Map runtime IDs to the static-export placeholder segment
    // (e.g. /prompts/131.txt → /prompts/__placeholder__.txt).
    const placeholderCandidates =
      normalizedPathname === decodedPathname ? [decodedPathname] : [decodedPathname, normalizedPathname];

    for (const candidatePathname of placeholderCandidates) {
      const placeholderPath = resolveDynamicPlaceholderAssetPath(candidatePathname, safeRoot);
      if (!placeholderPath) continue;
      const placeholderResponse = await fetchLocalFile(placeholderPath);
      if (placeholderResponse) return placeholderResponse;
    }

    // SPA fallback: extensionless paths and .html routes serve index.html so
    // the client-side router can take over (e.g. /prompts/131).
    const ext = path.extname(decodedPathname);
    if (ext === "" || ext === ".html") {
      const indexPath = path.join(safeRoot, "index.html");
      const indexResponse = await fetchLocalFile(indexPath);
      if (indexResponse) return indexResponse;
    }

    log(`404: ${filePath}`);
    return new Response(`Not found: ${appId}${pathname}`, { status: 404 });
  });
}

// ── Theme bridge (nativeTheme ↔ renderer) ────────────────────────────────────

function themeStateFile() {
  return path.join(app.getPath("userData"), THEME_STATE_FILE);
}

function loadThemeState() {
  try {
    const state = JSON.parse(fs.readFileSync(themeStateFile(), "utf8"));
    if (state.theme === "dark" || state.theme === "light") {
      nativeTheme.themeSource = state.theme;
    }
  } catch {}
}

function saveThemeState(theme) {
  try {
    fs.writeFileSync(themeStateFile(), JSON.stringify({ theme }));
  } catch {}
}

function broadcastTheme() {
  const theme = nativeTheme.shouldUseDarkColors ? "dark" : "light";
  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send("theme-changed", theme);
  }
}

function registerThemeBridge() {
  nativeTheme.on("updated", broadcastTheme);
  ipcMain.handle("theme:set", (_event, theme) => {
    if (theme === "dark" || theme === "light") {
      nativeTheme.themeSource = theme;
      saveThemeState(theme);
    }
  });
}

// ── Window ──────────────────────────────────────────────────────────────────

function isAllowedNavigation(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === `${APP_SCHEME}:`) return true;
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    return false;
  } catch {
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: "Prompt Archive",
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#0b142b" : "#f7f3ec",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!isAllowedNavigation(url)) {
      event.preventDefault();
    }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedNavigation(url)) {
      return { action: "allow" };
    }
    return { action: "deny" };
  });

  const smokeTest = process.env.PA_SMOKE_TEST === "1";
  mainWindow.webContents.on("did-finish-load", async () => {
    if (!smokeTest) return;
    try {
      const title = await mainWindow.webContents.executeJavaScript("document.title");
      const bodyText = await mainWindow.webContents.executeJavaScript(
        "document.body ? document.body.innerText.slice(0, 200) : ''",
      );
      const backendReady = await waitForBackend();
      let promptCount = -1;
      try {
        const response = await fetch(`${HEALTH_URL.replace("/health", "")}/prompts/?limit=1`);
        const payload = await response.json();
        promptCount = typeof payload.total === "number" ? payload.total : -1;
      } catch {}
      console.log(`PA_SMOKE_PROMPTS=${promptCount}`);
      const ok = backendReady && title.includes("Prompt Archive") && !bodyText.includes("Not found") && promptCount >= 0;
      console.log(ok ? "PA_SMOKE_OK" : `PA_SMOKE_FAIL title=${JSON.stringify(title)} body=${JSON.stringify(bodyText)}`);
    } catch (error) {
      console.log(`PA_SMOKE_FAIL ${error.message}`);
    } finally {
      setTimeout(() => app.quit(), 500);
    }
  });

  mainWindow.loadURL(`app://${APP_ID}/index.html`);
}

// ── App lifecycle ────────────────────────────────────────────────────────────

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  log("Another instance is running — quitting.");
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    loadThemeState();
    registerThemeBridge();
    registerAppProtocol();
    startBackend();

    const backendReady = await waitForBackend();
    if (!backendReady) {
      dialog.showErrorBox(
        "Prompt Archive",
        "No se pudo iniciar el servidor local de Prompt Archive. El puerto 8000 puede estar en uso o falta el entorno de Python.",
      );
      app.quit();
      return;
    }

    createWindow();
  });

  app.on("will-quit", stopBackend);
  app.on("window-all-closed", () => {
    app.quit();
  });
}
