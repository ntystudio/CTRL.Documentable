import React, {FC, useState, useEffect, useCallback} from 'react';
import { NodeConfig } from '../../types/types';
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

type NodeSearchFields = {
    fullTitle: boolean;
    description: boolean;
};

export const NodeList: FC<NodeListProps> = ({ nodes }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNodes, setFilteredNodes] = useState(nodes);
    const [searchFields, setSearchFields] = useState<NodeSearchFields>({
        fullTitle: true,
        description: true
    });

    const { setSelectedNode, selectedClass } = useSelectedClass();
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

    const selectNodeHandler = useCallback((node: NodeConfig) => {
        setSelectedNode(node);
        navigate(`/class/${node.className}/node/${node.fullTitle}`);
    }, [setSelectedNode, navigate]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

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
                                    <img src="/node-img-placeholder.png" alt="Node icon" className="w-full max-w-[200px] mx-auto rounded-lg" />
                                </div>
                            </div>
                            <div className="col-span-8 flex flex-col">
                                <div className="col-span-8 flex flex-col">
                                    <h2 className="text-3xl font-mono pb-4">
                                        <button onClick={() => selectNodeHandler(node)}
                                                className="font-mono nty-text-link-std flex flex-row items-center hover:underline">
                                            <LinkIcon className="text-current" />
                                            <span className="ml-2 text-left">{node.fullTitle}</span>
                                        </button>
                                    </h2>
                                    <p className="text-muted-foreground text-xl">{node.description === ''
                                        ? <span className="nty-zero-state-text">No description provided</span>
                                        : node.description
                                    }</p>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                ))
            )}
        </>
    );
};

type NodeListProps = {
    nodes: NodeConfig[]
};
