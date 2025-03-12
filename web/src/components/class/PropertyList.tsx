import React, { FC, useState, useEffect } from 'react';
import {FunctionConfig, PropertyConfig} from '../../types/types';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '../ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import nodes from '../../data/nodes.json';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {ExclamationTriangleIcon, Pencil1Icon, TrashIcon, BookmarkFilledIcon} from '@radix-ui/react-icons';
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";
import {useSelectedClass} from "../../providers/SelectedClassContextProvider";

type SearchFields = {
    name: boolean;
    type: boolean;
    description: boolean;
    flags: boolean;
};

export const PropertyList: FC<PropertyListProps> = ({ properties }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProperties, setFilteredProperties] = useState(properties);
    const [searchFields, setSearchFields] = useState<SearchFields>({
        name: true,
        type: true,
        description: true,
        flags: true
    });
    const { getNoteContent, addNote, deleteNote, hasNote, isLoading } = useNotes();
    const { selectedClass } = useSelectedClass();
    const [noteToDelete, setNoteToDelete] = useState<FunctionConfig | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<PropertyConfig | null>(null);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = properties.filter(property => {
            let matches = false;
            if (searchFields.name && property.name.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.type && property.type.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.description && property.description?.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.flags && property.flags?.some(flag => flag.toLowerCase().includes(lowercasedQuery))) {
                matches = true;
            }
            return matches;
        });
        setFilteredProperties(filtered);
    }, [searchQuery, properties, searchFields]);

    const handleCheckboxChange = (field: keyof SearchFields) => {
        setSearchFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleAddOrEditNote = (property: PropertyConfig) => {
        setSelectedProperty(property);
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = (content: string) => {
        if (selectedProperty && selectedClass) {
            addNote(selectedClass.name, selectedProperty.name, content);
        }
        setIsNoteDialogOpen(false);
    };

    const handleDeleteNote = (property: PropertyConfig) => {
        if (selectedClass) {
            deleteNote(selectedClass.name, property.name);
            setNoteToDelete(null);
        }
    };

    if (isLoading || !selectedClass) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="flex flex-row w-full max-w-[700px] mb-12">
                <div className="relative flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search properties..."
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
                            checked={searchFields.type}
                            onCheckedChange={() => handleCheckboxChange('type')}
                        >
                            Type
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
                            Metadata
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {filteredProperties.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no properties for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                filteredProperties.map((property, index) => (
                    <div key={index}>
                        <Separator className="my-8"/>
                        <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                            <div className="col-span-4 flex flex-col">
                                <Card>
                                    <CardContent>
                                        <div className="text-lg font-bold text-informational mt-4">{property.type}</div>
                                        {property.flags && property.flags.length > 0 && (
                                            <>
                                                <Separator className="my-2"/>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="mt-2 w-full">Metadata</Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto" align="start">
                                                        <div className="flex flex-col items-start">
                                                            {[
                                                                ...property.flags
                                                                    ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('ToolTip') && !flag.startsWith('Comment')),
                                                                ...property.flags
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
                                <h2 className="text-2xl font-bold pb-2">{property.name}</h2>

                                {property.description && (
                                    <p className="text-muted-foreground text-lg mb-4">{property.description}</p>
                                )}

                                {hasNote(selectedClass.name, property.name) ? (
                                    <div className="p-4 rounded-md mb-4 relative group border-2 bg-[#e8ebff] border-[#1fa2fd] dark:border-[#ffc229] dark:bg-[#1b1614]">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mr-2">
                                                <BookmarkFilledIcon className="w-5 h-5 text-[#1fa2fd] dark:text-[#ffc229]"/>
                                            </div>
                                            <p className="flex-grow">{getNoteContent(selectedClass.name, property.name)}</p>
                                        </div>
                                        <div
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button
                                                onClick={() => handleAddOrEditNote(property)}
                                                className="py-1 px-1.5 mr-1"
                                                size={'sm'}
                                                aria-label="Edit note"
                                            >
                                                <Pencil1Icon className="h-5 w-5" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        className="py-1 px-1.5"
                                                        size={'sm'}
                                                        variant="destructive"
                                                        aria-label="Delete note"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the note for {property.name}.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteNote(property)} variant="destructive">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <Button size={'sm'} onClick={() => handleAddOrEditNote(property)}>
                                            Add Note
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
            <NoteDialog
                isOpen={isNoteDialogOpen}
                onClose={() => setIsNoteDialogOpen(false)}
                onSave={handleSaveNote}
                initialContent={selectedProperty && selectedClass
                    ? (getNoteContent(selectedClass.name, selectedProperty.name) || '')
                    : ''}
                title={`${selectedProperty
                    ? (hasNote(selectedClass.name, selectedProperty.name) ? 'Edit' : 'Add')
                    : ''} Note for ${selectedProperty?.name || ''}`}
            />
        </>
    );
};

type PropertyListProps = {
    properties: PropertyConfig[]
};

// Usage example
const properties = nodes.nodes.flatMap(node => node.properties); // Flatten properties from nodes
<PropertyList properties={properties}/>
