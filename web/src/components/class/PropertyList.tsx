import { FC, useState, useEffect } from 'react';
import {FunctionConfig, PropertyConfig} from '../../types/types';
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
import {ExclamationTriangleIcon, Pencil1Icon, TrashIcon} from '@radix-ui/react-icons';
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";
import {useSelectedClass} from "../../providers/SelectedClassContextProvider";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../ui/table';
import { X } from 'lucide-react';

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
            {/* <div className="flex flex-row w-full max-w-[700px] mb-12">
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
                            <X className="size-4" />
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
            </div> */}
            {filteredProperties.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no properties for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="w-full">
                    <Table className="w-full max-w-[1100px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Property</TableHead>
                                <TableHead className="w-[40%]">Type</TableHead>
                                <TableHead className="w-[10%]">Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProperties.map((property, index) => (
                                <TableRow key={index} className="h-[49px]">
                                    <TableCell>
                                        <div className="font-medium text-lg max-w-[500px] truncate">{property.name}</div>
                                        {property.description && (
                                            <p className="text-muted-foreground text-sm mt-1">{property.description}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-informational font-mono">{property.type}</div>
                                    </TableCell>
                                    <TableCell>
                                        {property.flags && property.flags.length > 0 ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Metadata
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto" align="end">
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
                                        ) : (
                                            <span className="text-muted-foreground">None</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
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
