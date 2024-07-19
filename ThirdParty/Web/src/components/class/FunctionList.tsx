import React, {FC, useState, useEffect, useCallback} from 'react';
import { FunctionConfig } from '../../types/types';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '../ui/alert-dialog';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import {Button} from '../ui/button';
import {Badge} from '../ui/badge';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import nodes from '../../data/nodes.json'; // Import the JSON data
import { useNavigate } from 'react-router-dom';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import { LinkIcon } from '../ui/icons/LinkIcon';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {BookmarkFilledIcon, ExclamationTriangleIcon, Pencil1Icon, TrashIcon} from '@radix-ui/react-icons';
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";
import {Card, CardContent} from "../../components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "../../components/ui/popover";

type FunctionSearchFields = {
    name: boolean;
    returnType: boolean;
    description: boolean;
    flags: boolean;
    parameters: boolean;
};

export const FunctionList: FC<FunctionListProps> = ({ functions }) => {
    const { getNoteContent, addNote, deleteNote, hasNote, isLoading: isNotesLoading } = useNotes();
    const { setSelectedFunction, selectedClass } = useSelectedClass();
    const [noteFunction, setNoteFunction] = useState<FunctionConfig | null>(null);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFunctions, setFilteredFunctions] = useState(functions);
    const [noteToDelete, setNoteToDelete] = useState<FunctionConfig | null>(null);
    const [searchFields, setSearchFields] = useState<FunctionSearchFields>({
        name: true,
        returnType: true,
        description: true,
        flags: true,
        parameters: true
    });

    const navigate = useNavigate();
    const { name: className } = selectedClass || {};

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = functions.filter(func => {
            let matches = false;
            if (searchFields.name && func.name.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.returnType && func.returnType.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.description && func.description?.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.flags && func.flags?.some(flag => flag.toLowerCase().includes(lowercasedQuery))) {
                matches = true;
            }
            if (searchFields.parameters && func.parameters.some(param => param.type.toLowerCase().includes(lowercasedQuery) || param.name.toLowerCase().includes(lowercasedQuery))) {
                matches = true;
            }
            return matches;
        });
        setFilteredFunctions(filtered);
    }, [searchQuery, functions, searchFields]);

    const handleCheckboxChange = (field: keyof FunctionSearchFields) => {
        setSearchFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleAddOrEditNote = (func: FunctionConfig) => {
        setNoteFunction(func);
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = (content: string) => {
        if (noteFunction && selectedClass) {
            addNote(selectedClass.name, noteFunction.name, content);
        }
        setIsNoteDialogOpen(false);
    };

    const handleDeleteNote = (func: FunctionConfig) => {
        if (selectedClass) {
            deleteNote(selectedClass.name, func.name);
            setNoteToDelete(null);
        }
    };

    const selectFunctionHandler = useCallback((func: FunctionConfig) => {
        setSelectedFunction(func);
        navigate(`/class/${selectedClass?.name}/function/${func.name}`);
    }, [setSelectedFunction, navigate, selectedClass]);

    if (isNotesLoading || !selectedClass) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="flex flex-row w-full max-w-[700px] mb-12">
                <div className="relative flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search functions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 pr-8 border rounded"
                    />
                    {searchQuery && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            aria-label="Clear search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20"
                                 fill="currentColor">
                                <path fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"/>
                            </svg>
                        </button>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button>Filter</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.name}
                            onCheckedChange={() => handleCheckboxChange('name')}
                        >
                            Name
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.returnType}
                            onCheckedChange={() => handleCheckboxChange('returnType')}
                        >
                            Return Type
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.description}
                            onCheckedChange={() => handleCheckboxChange('description')}
                        >
                            Description
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.flags}
                            onCheckedChange={() => handleCheckboxChange('flags')}
                        >
                            Flags
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.parameters}
                            onCheckedChange={() => handleCheckboxChange('parameters')}
                        >
                            Parameters
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {filteredFunctions.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no functions for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                filteredFunctions.map((func, index) => (
                    <React.Fragment key={index}>
                        <Separator className="my-8"/>
                        <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                            <div className="col-span-4 flex flex-col">
                                <Card>
                                    <CardContent>
                                        <div className="text-lg font-bold text-informational mt-4">{func.returnType}</div>
                                        {func.flags && func.flags.length > 0 && (
                                            <>
                                                <Separator className="my-2"/>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="mt-2 w-full">Metadata</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto" align="start">
                                                        <div className="flex flex-col items-start">
                                                            {[
                                                                ...func.flags
                                                                    ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('ToolTip') && !flag.startsWith('Comment')),
                                                                ...func.flags
                                                                    ?.filter(flag => flag.startsWith('ModuleRelativePath')),
                                                            ].map((flag, index, array) => (
                                                                <div key={index} className="font-mono text-sm">
                                                                    {flag}
                                                                    {index !== array.length - 1 && <Separator className="my-2"/>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="col-span-8 flex flex-col">
                                <h2 className="text-2xl font-bold pb-3">
                                    <button onClick={() => selectFunctionHandler(func)}
                                            className="flex flex-row items-center hover:underline">
                                        <LinkIcon />
                                        <span className="ml-2">{func.name}</span>
                                    </button>
                                </h2>

                                <div className=" ml-[26px]">

                                    {func.description && (
                                        <p className="text-muted-foreground text-lg mb-4">{func.description}</p>
                                    )}

                                    {hasNote(selectedClass.name, func.name) ? (
                                        <div
                                            className="p-4 rounded-md mb-4 relative group border-2 bg-[#e8ebff] border-[#1fa2fd] dark:border-[#ffc229] dark:bg-[#1b1614]">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-2">
                                                    <BookmarkFilledIcon className="w-5 h-5 text-[#1fa2fd] dark:text-[#ffc229]"/>
                                                </div>
                                                <p className="flex-grow">{getNoteContent(selectedClass.name, func.name)}</p>
                                            </div>
                                            <div
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                    onClick={() => handleAddOrEditNote(func)}
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
                                                                the note for {func.name}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteNote(func)}
                                                                               variant="destructive">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            <Button size={'sm'} onClick={() => handleAddOrEditNote(func)}>
                                                Add Note
                                            </Button>
                                        </div>
                                    )}

                                    <Separator className="my-6 max-w-xl"/>

                                    <div>
                                        <p className="uppercase text-sm font-semibold mb-3">Parameters</p>
                                        {func.parameters?.length === 0
                                            ? <p className="text-muted-foreground">No parameters provided</p>
                                            : func.parameters?.map((param, index) => (
                                                <div key={index} className="flex mb-2">
                                                    <Badge className="rounded-lg border border-border bg-card dark:border-border dark:bg-card py-0.5 px-1.5 text-black dark:text-white font-mono text-base">{param.name}:</Badge>
                                                    <span className="font-bold ml-2 text-informational text-lg">{param.type}</span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                            </div>
                    </div>
                </React.Fragment>
            )))}
            <NoteDialog
                isOpen={isNoteDialogOpen}
                onClose={() => setIsNoteDialogOpen(false)}
                onSave={handleSaveNote}
                initialContent={noteFunction && selectedClass ? (getNoteContent(selectedClass.name, noteFunction.name) || '') : ''}
                title={`${noteFunction ? (hasNote(selectedClass.name, noteFunction.name) ? 'Edit' : 'Add') : ''} Note for ${noteFunction?.name || ''}`}
            />
        </>
    );
};

type FunctionListProps = {
    functions: FunctionConfig[]
};

// Usage example
const functions = nodes.nodes.flatMap(node => node.functions); // Flatten functions from nodes
<FunctionList functions={functions} />
