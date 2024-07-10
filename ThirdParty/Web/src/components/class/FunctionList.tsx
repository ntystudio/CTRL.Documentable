import React, { FC, useState, useEffect } from 'react';
import { FunctionConfig } from '../../types/types';
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
import {ExclamationTriangleIcon} from '@radix-ui/react-icons';

type FunctionSearchFields = {
    name: boolean;
    returnType: boolean;
    description: boolean;
    flags: boolean;
    parameters: boolean;
};

export const FunctionList: FC<FunctionListProps> = ({ functions }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFunctions, setFilteredFunctions] = useState(functions);
    const [searchFields, setSearchFields] = useState<FunctionSearchFields>({
        name: true,
        returnType: true,
        description: true,
        flags: true,
        parameters: true
    });

    const { setSelectedFunction, selectedClass } = useSelectedClass();
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

    const selectFunctionHandler = (func: FunctionConfig) => {
        setSelectedFunction(func);
        navigate(`/class/${className}/function/${func.name}`);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    return (
        <>
            <div className="flex flex-row w-full max-w-[700px] mb-12">
                <Input
                    type="text"
                    placeholder="Search functions..."
                    value={searchQuery}
                    onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded mb-4 mr-4"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Button className="mb-4">Filter</Button>
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
                <Button onClick={handleClearSearch} className="mb-4 ml-2">Clear</Button>
            </div>
            {filteredFunctions.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no functions for this class.
                    </AlertDescription>
                </Alert>
            ) : (
            filteredFunctions.map((func, index) => (
                <React.Fragment key={index}>
                    <Separator className="my-8" />
                    <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                        <div className="col-span-4 flex flex-col">
                            <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                                <p className="uppercase text-sm font-semibold mb-1 text-muted-foreground">Return Type</p>
                                <h2 className="text-lg font-mono text-orange-700 dark:text-orange-400">{func.returnType}</h2>
                            </div>
                            <div className="rounded-lg p-2 bg-muted border-2">
                                <p className="uppercase text-sm font-semibold mb-2 text-muted-foreground">Metadata</p>
                                <h2 className="text-base font-mono text-blue-700">
                                    {func.flags && func.flags?.length !== 0 && (
                                        <div className="flex flex-col items-start">
                                            {[
                                                ...func.flags
                                                    ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('Comment') && !flag.startsWith('ToolTip')),
                                                ...func.flags
                                                    ?.filter(flag => flag.startsWith('Comment') || flag.startsWith('ToolTip')),
                                            ].map((flag, index) => (
                                                <Badge key={index} variant="informational" className="mr-1 mb-1">
                                                    {flag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </h2>
                            </div>
                        </div>
                        <div className="col-span-8 flex flex-col">
                            <h2 className="text-3xl font-mono pb-4">
                                <button onClick={() => selectFunctionHandler(func)}
                                        className="font-mono nty-text-link-std flex flex-row items-center hover:underline">
                                    <LinkIcon className="text-current" />
                                    <span className="ml-2 text-left">{func.name}</span>
                                </button>
                            </h2>
                            <p className="text-muted-foreground text-xl">{func.description === ''
                                ? <span className="nty-zero-state-text">No description provided</span>
                                : func.description
                            }</p>
                            <div className="mt-2">
                                <p className="uppercase text-sm font-semibold mt-4 mb-1 text-muted-foreground">Parameters</p>
                                {func.parameters?.length === 0
                                    ? <p className="text-muted-foreground">No parameters provided</p>
                                    : func.parameters?.map((param, index) => (
                                        <div key={index} className="flex text-lg">
                                            <span className="font-mono text-foreground">{param.name}:</span>
                                            <span className="font-mono ml-2 text-orange-700 dark:text-orange-400">{param.type}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            )))}
        </>
    );
};

type FunctionListProps = {
    functions: FunctionConfig[]
};

// Usage example
const functions = nodes.nodes.flatMap(node => node.functions); // Flatten functions from nodes
<FunctionList functions={functions} />
