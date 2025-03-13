import {FC, useState, useEffect, useCallback} from 'react';
import {FunctionConfig, NodeConfig, NodePinConfig} from '../../types/types';
import { useNavigate } from 'react-router-dom';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import {Alert, AlertDescription, AlertTitle} from '../ui/alert';
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';
import {PinInput} from "../node/PinInput";
import {PinOutput} from "../node/PinOutput";
import {NodePins} from "../NodePins";
import {useNotes} from "../../providers/NotesContextProvider";
import {NoteDialog} from "../../components/NoteDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";

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
            {/* <div className="flex flex-row w-full max-w-[700px] mb-12">
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
            </div> */}
            {filteredNodes.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6"/>
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no nodes for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                <div className="w-full">
                    <Table className="w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[34%]">Node</TableHead>
                                <TableHead className="w-[33%]">Inputs</TableHead>
                                <TableHead className="w-[33%]">Outputs</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredNodes.map((node, index) => (
                                <TableRow key={index} className="align-top">
                                    <TableCell className="align-top">
                                        <div className="flex flex-col">
                                            <div className="rounded-lg max-w-[275px]">
                                                <img 
                                                    src={node.imgPath?.replace('..', '')}
                                                    alt={`Visualization of node: ${node.description}`}
                                                    className="w-full rounded-lg"
                                                />
                                            </div>
                                            {/* <h3 className="text-lg font-bold">
                                                {node.fullTitle}
                                            </h3> */}
                                            {node.description && (
                                                <p className="text-muted-foreground text-sm mt-1">{node.description}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        {node.inputs && node.inputs.length > 0 ? (
                                            <div>
                                                <NodePins<NodePinConfig> 
                                                    items={node.inputs} 
                                                    title="" 
                                                    ItemComponent={PinInput}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No inputs</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        {node.outputs && node.outputs.length > 0 ? (
                                            <div>
                                                <NodePins<NodePinConfig> 
                                                    items={node.outputs} 
                                                    title="" 
                                                    ItemComponent={PinOutput}
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">No outputs</span>
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
                initialContent={noteNode && selectedClass ? (getNoteContent(selectedClass.name, noteNode.fullTitle) || '') : ''}
                title={`${noteNode ? (hasNote(selectedClass.name, noteNode.fullTitle) ? 'Edit' : 'Add') : ''} Note for ${noteNode?.fullTitle || ''}`}
            />
        </>
    );
};

type NodeListProps = {
    nodes: NodeConfig[]
};
