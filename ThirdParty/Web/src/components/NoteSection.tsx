// src/components/NoteSection.tsx

import React from 'react';
import { useNotes } from '../providers/NotesContextProvider';
import { Button } from './ui/button';
import { NoteDialog } from './NoteDialog';

interface NoteSectionProps {
    classId: string;
    itemId: string;
    itemName: string;
}

export const NoteSection: React.FC<NoteSectionProps> = ({ classId, itemId, itemName }) => {
    const { getNoteContent, addNote, deleteNote, hasNote } = useNotes();
    const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);

    const handleAddOrEditNote = () => {
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = (content: string) => {
        addNote(classId, itemId, content);
        setIsNoteDialogOpen(false);
    };

    const handleDeleteNote = () => {
        deleteNote(classId, itemId);
    };

    return (
        <div className="mt-4">
            {hasNote(classId, itemId) ? (
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                    <p className="text-muted-foreground">{getNoteContent(classId, itemId)}</p>
                    <div className="flex">
                        <Button size={'sm'} onClick={handleAddOrEditNote} className="mr-2">
                            Edit Note
                        </Button>
                        <Button size={'sm'} onClick={handleDeleteNote} variant="destructive">
                            Delete Note
                        </Button>
                    </div>
                </div>
            ) : (
                <Button size={'sm'} onClick={handleAddOrEditNote}>
                    Add Note
                </Button>
            )}
            <NoteDialog
                isOpen={isNoteDialogOpen}
                onClose={() => setIsNoteDialogOpen(false)}
                onSave={handleSaveNote}
                initialContent={getNoteContent(classId, itemId) || ''}
                title={`${hasNote(classId, itemId) ? 'Edit' : 'Add'} Note for ${itemName}`}
            />
        </div>
    );
};
