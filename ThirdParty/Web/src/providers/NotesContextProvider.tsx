import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { fetchNotes, updateNotesFile } from '../utils/fileUtils';

interface Note {
    classId: string;
    itemId: string;
    content: string;
    orphan?: boolean;
}

interface NotesContextType {
    notes: Note[];
    addNote: (classId: string, itemId: string, content: string) => void;
    updateNote: (classId: string, itemId: string, content: string) => void;
    deleteNote: (classId: string, itemId: string) => void;
    getNoteContent: (classId: string, itemId: string) => string | null;
    hasNote: (classId: string, itemId: string) => boolean;
    isLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadNotes = async () => {
            setIsLoading(true);
            const loadedNotes = await fetchNotes();
            setNotes(loadedNotes);
            setIsLoading(false);
        };

        loadNotes();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            updateNotesFile(notes);
        }
    }, [notes, isLoading]);

    const addNote = (classId: string, itemId: string, content: string) => {
        setNotes(prevNotes => {
            const existingNoteIndex = prevNotes.findIndex(
                n => n.classId === classId && n.itemId === itemId
            );
            if (existingNoteIndex !== -1) {
                // If note exists, update it
                const updatedNotes = [...prevNotes];
                updatedNotes[existingNoteIndex] = { classId, itemId, content };
                return updatedNotes;
            }
            // If note doesn't exist, add it
            return [...prevNotes, { classId, itemId, content }];
        });
    };

    const updateNote = (classId: string, itemId: string, content: string) => {
        setNotes(prevNotes =>
            prevNotes.map(note =>
                note.classId === classId && note.itemId === itemId
                    ? { ...note, content }
                    : note
            )
        );
    };

    const deleteNote = (classId: string, itemId: string) => {
        setNotes(prevNotes =>
            prevNotes.filter(note =>
                !(note.classId === classId && note.itemId === itemId)
            )
        );
    };

    const getNoteContent = (classId: string, itemId: string): string | null => {
        const note = notes.find(note =>
            note.classId === classId && note.itemId === itemId
        );
        return note ? note.content : null;
    };

    const hasNote = (classId: string, itemId: string): boolean => {
        return notes.some(note => note.classId === classId && note.itemId === itemId);
    };

    return (
        <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote, getNoteContent, hasNote, isLoading }}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotes = () => {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NotesProvider');
    }
    return context;
};
