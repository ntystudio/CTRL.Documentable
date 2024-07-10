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

    return (
        <>
            <div className="flex flex-row w-full max-w-[700px] mb-12">
                <Input
                    type="text"
                    placeholder="Search properties..."
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
                <Button onClick={handleClearSearch} className="mb-4 ml-2">Clear</Button>
            </div>
            {filteredProperties.length === 0 ? (
                <Alert className="max-w-[400px]">
                    <ExclamationTriangleIcon className="h-6 w-6" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        There are no properties for this class.
                    </AlertDescription>
                </Alert>
            ) : (
                filteredProperties.map((property, index) => (
                    <div key={index}>
                        <Separator className="my-8" />
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
                                                    <Badge key={index} variant="informational" className="mr-1 mb-1 truncate">
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
                                <p className="text-muted-foreground text-xl">{property.description === ''
                                    ? <span className="nty-zero-state-text">No description provided</span>
                                    : property.description
                                }</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </>
    );
};

type PropertyListProps = {
    properties: PropertyConfig[]
};

// Usage example
const properties = nodes.nodes.flatMap(node => node.properties); // Flatten properties from nodes
<PropertyList properties={properties} />
