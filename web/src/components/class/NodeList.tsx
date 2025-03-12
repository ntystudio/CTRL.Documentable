import React, {FC, useState, useEffect, useCallback} from 'react';
import {FunctionConfig, NodeConfig, NodePinConfig, PropertyConfig} from '../../types/types';
import { Separator } from '../ui/separator';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {Button} from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import { LinkIcon } from '../ui/icons/LinkIcon';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {BookmarkFilledIcon, ExclamationTriangleIcon, Pencil1Icon, TrashIcon} from '@radix-ui/react-icons';
import {PinInput} from "../node/PinInput";
import {PinOutput} from "../node/PinOutput";
import {NodePins} from "../NodePins";
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";

type NodeSearchFields = {
    fullTitle: boolean;
    description: boolean;
};

export const NodeList: FC<NodeListProps> = ({ nodes }) => {
    const { getNoteContent, addNote, deleteNote, hasNote, isLoading: isNotesLoading } = useNotes();
    const { setSelectedNode, selectedClass } = useSelectedClass();
    const [noteNode, setNoteNode] = useState<NodeConfig | null>(null);
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNodes, setFilteredNodes] = useState(nodes);
    const [noteToDelete, setNoteToDelete] = useState<FunctionConfig | null>(null);
    const [searchFields, setSearchFields] = useState<NodeSearchFields>({
        fullTitle: true,
        description: true
    });
    const navigate = useNavigate();

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const filtered = nodes.filter(node => {
            let matches = false;
            if (searchFields.fullTitle && node.fullTitle.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            if (searchFields.description && node.description?.toLowerCase().includes(lowercasedQuery)) {
                matches = true;
            }
            return matches;
        });
        setFilteredNodes(filtered);
    }, [searchQuery, nodes, searchFields]);

    const handleCheckboxChange = (field: keyof NodeSearchFields) => {
        setSearchFields(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleAddOrEditNote = (node: NodeConfig) => {
        setNoteNode(node);
        setIsNoteDialogOpen(true);
    };

    const handleSaveNote = (content: string) => {
        if (noteNode && selectedClass) {
            addNote(selectedClass.name, noteNode.fullTitle, content);
        }
        setIsNoteDialogOpen(false);
    };

    const handleDeleteNote = (node: NodeConfig) => {
        if (selectedClass) {
            deleteNote(selectedClass.name, node.fullTitle);
            setNoteToDelete(null);
        }
    };

    const selectNodeHandler = useCallback((node: NodeConfig) => {
        setSelectedNode(node);
        navigate(`/class/${selectedClass?.name}/node/${node.fullTitle}`);
    }, [setSelectedNode, navigate, selectedClass]);

    if (isNotesLoading || !selectedClass) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="flex flex-row w-full max-w-[700px] mb-12">
                <div className="relative flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search nodes..."
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
                            checked={searchFields.fullTitle}
                            onCheckedChange={() => handleCheckboxChange('fullTitle')}
                        >
                            Full Title
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={searchFields.description}
                            onCheckedChange={() => handleCheckboxChange('description')}
                        >
                            Description
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {filteredNodes.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no nodes for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                filteredNodes.map((node, index) => (
                    <React.Fragment key={index}>
                        <Separator className="my-8"/>
                        <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                            <div className="col-span-4 flex flex-col">
                                <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                                    <img src={node.imgPath?.replace('..', '')}
                                         alt={`Visualization of node: ${node.description}`}
                                         className="w-full max-w-[300px] mx-auto rounded-lg"/>
                                </div>
                            </div>
                            <div className="col-span-8">
                                <h2 className="text-2xl font-bold pb-3">
                                    <button onClick={() => selectNodeHandler(node)}
                                            className="flex flex-row items-center hover:underline">
                                        <LinkIcon className="text-current"/>
                                        <span className="ml-2">{node.fullTitle}</span>
                                    </button>
                                </h2>

                                <div className=" ml-[26px]">
                                    {node.description && (
                                        <p className="text-muted-foreground text-lg mb-4">{node.description}</p>
                                    )}

                                    {hasNote(selectedClass.name, node.fullTitle) ? (
                                        <div
                                            className="p-4 rounded-md mb-4 relative group border-2 bg-[#e8ebff] border-[#1fa2fd] dark:border-[#ffc229] dark:bg-[#1b1614]">
                                            <div className="flex items-start">
                                                <div className="flex-shrink-0 mr-2">
                                                    <BookmarkFilledIcon className="w-5 h-5 text-[#1fa2fd] dark:text-[#ffc229]"/>
                                                </div>
                                                <p className="flex-grow">{getNoteContent(selectedClass.name, node.fullTitle)}</p>
                                            </div>
                                            <div
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Button
                                                    onClick={() => handleAddOrEditNote(node)}
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
                                                            <AlertDialogTitle>Are you absolutely
                                                                sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently
                                                                delete the note for {node.fullTitle}.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteNote(node)}
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
                                            <Button size={'sm'} onClick={() => handleAddOrEditNote(node)}>
                                                Add Note
                                            </Button>
                                        </div>
                                    )}

                                    <Separator className="mt-6 mb-2 max-w-xl"/>

                                    <div className="grid grid-cols-1 gap-4 w-full">
                                        <div> {/* Inputs container */}
                                            {node.inputs &&
                                                <NodePins<NodePinConfig> items={node.inputs} title="Inputs"
                                                                         ItemComponent={PinInput}/>}
                                        </div>
                                        <Separator className="mt-2 mb-0 max-w-xl"/>
                                        <div> {/* Outputs container */}
                                            {node.outputs &&
                                                <NodePins<NodePinConfig> items={node.outputs} title="Outputs"
                                                                         ItemComponent={PinOutput}/>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                ))
            )}
            <NoteDialog
                isOpen={isNoteDialogOpen}
                onClose={() => setIsNoteDialogOpen(false)}
                onSave={handleSaveNote}
                initialContent={noteNode && selectedClass ? (getNoteContent(selectedClass.name, noteNode.fullTitle) || '') : ''}
                title={`${noteNode ? (hasNote(selectedClass.name, noteNode.fullTitle) ? 'Edit' : 'Add') : ''} Note for ${noteNode?.fullTitle || ''}`}
            />
        </>
    );
};

type NodeListProps = {
    nodes: NodeConfig[]
};
