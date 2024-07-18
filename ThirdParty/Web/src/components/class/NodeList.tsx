import React, {FC, useState, useEffect, useCallback} from 'react';
import {NodeConfig, NodePinConfig} from '../../types/types';
import { Separator } from '../ui/separator';
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
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
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
                <Input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="p-2 border rounded mb-4 mr-4"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button className="mb-4">Filter</Button>
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
                <Button onClick={handleClearSearch} className="mb-4 ml-2">Clear</Button>
            </div>
            {filteredNodes.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no nodes for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                filteredNodes.map((node, index) => (
                    <React.Fragment key={index}>
                        <Separator className="my-8" />
                        <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                            <div className="col-span-4 flex flex-col">
                                <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                                    <img src={node.imgPath?.replace('..', '')}  alt={`Visualization of node: ${node.description}`} className="w-full max-w-[300px] mx-auto rounded-lg" />
                                </div>
                            </div>
                            <div className="col-span-8">
                                <h2 className="text-3xl font-mono pb-4">
                                    <button onClick={() => selectNodeHandler(node)}
                                            className="font-mono nty-text-link-std flex flex-row items-center hover:underline">
                                        <LinkIcon className="text-current"/>
                                        <span className="ml-2 text-left">{node.fullTitle}</span>
                                    </button>
                                </h2>

                                {node.description && (
                                    <p className="text-muted-foreground text-xl mb-4">{node.description}</p>
                                )}

                                {hasNote(selectedClass.name, node.fullTitle) ? (
                                    <div className="bg-gray-100 p-4 rounded-md mb-4">
                                        <p className="text-gray-800 mb-4">{getNoteContent(selectedClass.name, node.fullTitle)}</p>
                                        <div className="flex">
                                            <Button size={'sm'} onClick={() => handleAddOrEditNote(node)} className="mr-2">
                                                Edit Note
                                            </Button>
                                            <Button size={'sm'} onClick={() => handleDeleteNote(node)} variant="destructive">
                                                Delete Note
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <Button size={'sm'} onClick={() => handleAddOrEditNote(node)}>
                                            Add Note
                                        </Button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 w-full">
                                    <div> {/* Inputs container */}
                                        {node.inputs &&
                                            <NodePins<NodePinConfig> items={node.inputs} title="Inputs"
                                                                     ItemComponent={PinInput}/>}
                                    </div>
                                    <div> {/* Outputs container */}
                                        {node.outputs &&
                                            <NodePins<NodePinConfig> items={node.outputs} title="Outputs"
                                                                     ItemComponent={PinOutput}/>}
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
