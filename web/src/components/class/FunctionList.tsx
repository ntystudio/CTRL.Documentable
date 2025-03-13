import {FC, useState, useEffect, useCallback} from 'react';
import { FunctionConfig } from '../../types/types';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import {Button} from '../ui/button';
import {DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import nodes from '../../data/nodes.json';
import { useNavigate } from 'react-router-dom';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {ExclamationTriangleIcon, Pencil1Icon, TrashIcon} from '@radix-ui/react-icons';
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";
import {Card, CardContent} from "../../components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "../../components/ui/popover";
import { X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '../ui/table';

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
            {/* <div className="flex flex-row w-full max-w-[700px] mb-12">
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
            </div> */}
            {filteredFunctions.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no functions for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="w-full">
                    <Table className="w-full max-w-[1100px]">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Function</TableHead>
                                <TableHead className="w-[40%]">Parameters</TableHead>
                                <TableHead className="w-[10%]">Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFunctions.map((func, index) => (
                                <TableRow key={index}>
                                    <TableCell className="align-top">
                                        <div>
                                            <div className="flex items-center gap-2 text-lg">
                                                <span className="text-informational font-medium font-mono">{func.returnType}</span>
                                                <span className="font-medium max-w-[500px] truncate">{func.name}</span>
                                            </div>
                                            {func.description && (
                                                <p className="text-muted-foreground text-sm mt-1">{func.description}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        {func.parameters?.length === 0 ? (
                                            <span className="text-muted-foreground text-sm">No parameters</span>
                                        ) : (
                                            <div className="space-y-1">
                                                {func.parameters?.map((param, idx) => (
                                                    <div key={idx} className="text-sm">
                                                        <span className="text-informational font-mono mr-2">{param.type}</span>
                                                        {' '}
                                                        <span>{param.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-top">
                                        {func.flags && func.flags.length > 0 && (
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
