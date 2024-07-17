import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface NoteDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
    initialContent: string;
    title: string;
}

export const NoteDialog: React.FC<NoteDialogProps> = ({ isOpen, onClose, onSave, initialContent, title }) => {
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleSave = () => {
        onSave(content);
        onClose();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Add or edit your note below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your note here..."
                    className="min-h-[100px]"
                />
                <AlertDialogFooter>
                    <Button onClick={onClose} variant="outline">Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
