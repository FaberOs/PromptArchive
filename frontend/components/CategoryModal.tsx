"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { FieldGroup } from "./ui/FieldGroup";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
  initialData?: { name: string; description?: string } | null;
  title: string;
}

export default function CategoryModal({ isOpen, onClose, onSubmit, initialData, title }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name, description);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <FieldGroup label="Category Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Photography" autoFocus />
        </FieldGroup>
        <FieldGroup label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this category..."
            rows={3}
          />
        </FieldGroup>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
