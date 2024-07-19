import React, { FC, useState, useEffect } from 'react';
import { PropertyConfig } from '../../types/types';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import nodes from '../../data/nodes.json';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
                                <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                                    <p className="uppercase text-sm font-semibold mb-1 text-muted-foreground">type</p>
                                    <h2 className="text-lg font-mono text-orange-700 dark:text-orange-400">{property.type}</h2>
                                </div>
                                <div className="rounded-lg p-2 bg-muted border-2">
                                    <p className="uppercase text-sm font-semibold mb-2 text-muted-foreground">metadata</p>
                                    <h2 className="text-base font-mono text-blue-700">
                                        {property.flags && property.flags.length !== 0 && (
                                            <div className="flex flex-col items-start">
                                                {[
                                                    ...property.flags
                                                        ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('ToolTip') && !flag.startsWith('Comment')),
                                                    ...property.flags
                                                        ?.filter(flag => flag.startsWith('ModuleRelativePath')),
                                                ].map((flag, index) => (
                                                    <Badge key={index} variant="informational"
                                                           className="mr-1 mb-1 truncate">
                                                        {flag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </h2>
                                </div>
                            </div>
                            <div className="col-span-8 flex flex-col">
                                <h2 className="text-3xl font-mono pb-4">{property.name}</h2>

                                {property.description && (
                                    <p className="text-muted-foreground text-xl mb-4">{property.description}</p>
                                )}

                                {hasNote(selectedClass.name, property.name) ? (
                                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                                        <p className="text-gray-800 mb-4">{getNoteContent(selectedClass.name, property.name)}</p>
                                        <div className="flex">
                                            <Button size={'sm'} onClick={() => handleAddOrEditNote(property)} className="mr-2">
                                                Edit Note
                                            </Button>
                                            <Button size={'sm'} onClick={() => handleDeleteNote(property)} variant="destructive">
                                                Delete Note
                                            </Button>
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
