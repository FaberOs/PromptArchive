import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';

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

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || "");
            setDescription(initialData?.description || "");
        }
    }, [isOpen, initialData]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit(name, description);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Category Name</label>
                    <Input 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Photography"
                        autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-slate-200">Description</label>
                    <Textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of this category..."
                        rows={3}
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </div>
            </div>
        </Modal>
    );
}
