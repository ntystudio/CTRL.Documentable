// src/components/NoteSection.tsx

import React from 'react';
import { useNotes } from '../providers/NotesContextProvider';
import { Button } from './ui/button';
import { NoteDialog } from './NoteDialog';
import {BookmarkFilledIcon, Pencil1Icon, TrashIcon} from "@radix-ui/react-icons";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "./ui/alert-dialog";

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
                <div
                    className="p-4 rounded-md mb-4 relative group border-2 bg-[#e8ebff] border-[#1fa2fd] dark:border-[#ffc229] dark:bg-[#1b1614]">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mr-2">
                            <BookmarkFilledIcon className="w-5 h-5 text-[#1fa2fd] dark:text-[#ffc229]"/>
                        </div>
                        <p className="flex-grow">{getNoteContent(classId, itemId)}</p>
                    </div>
                    <div
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            onClick={handleAddOrEditNote}
                            className="py-1 px-1.5 mr-1"
                            size={'sm'}
                            aria-label="Edit note"
                        >
                            <Pencil1Icon className="h-5 w-5"/>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    className="py-1 px-1.5"
                                    size={'sm'}
                                    variant="destructive"
                                    aria-label="Delete note"
                                >
                                    <TrashIcon className="h-5 w-5"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete
                                        the note for {itemName}.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteNote}
                                                       variant="destructive">
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
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
