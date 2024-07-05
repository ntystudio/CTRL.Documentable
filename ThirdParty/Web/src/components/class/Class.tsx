import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {TreeItemConfig} from '../../types/types';
import {FunctionList} from './FunctionList';
import {NodeList} from './NodeList';
import {PropertyList} from './PropertyList';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '../ui/tabs';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../ui/breadcrumb";
import NodeBreadcrumb from '../ui/NodeBreadcrumbs';

export const Class = () => {
    const params = useParams();
    const path = params['*'];
    const [currentTab, setCurrentTab] = useState('properties');

    const {selectedClass, setSelectedClass, objectData, setObjectData} = useSelectedClass();

    // Recursive function to find the item by path
    const findItemByPath = (
        items: TreeItemConfig[],
        pathArray: string[],
    ): TreeItemConfig | null => {
        for (const item of items) {
            if (item.path === pathArray.join('/')) {
                return item;
            }
            if (item.children && item.children.length > 0) {
                const found = findItemByPath(item.children, pathArray);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    useEffect(() => {
        const pathArray = path?.split('/');

        // Find the data with the path in the params
        if (objectData && pathArray) {
            const foundData = findItemByPath(objectData, pathArray);

            if (foundData) {
                setSelectedClass(foundData);
            }
        }

    }, [findItemByPath, objectData, path, setSelectedClass]);

    if (!selectedClass) {
        return <div>Not Found</div>;
    }

    return (
        <div className="relative p-2">
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Classes</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href={`/class/${selectedClass.name}`}>{selectedClass.name}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <div>
                <p className="mb-6 text-4xl text-dark-color-base-00 dark:text-light-color-base-00">
                    Class - {selectedClass?.name}
                </p>
                <Tabs defaultValue="properties" onValueChange={(value) => setCurrentTab(value)}>
                    <TabsList className="grid w-full grid-cols-3 max-w-[700px] mb-4">
                        <TabsTrigger value="properties">Properties ({selectedClass?.properties.length})</TabsTrigger>
                        <TabsTrigger value="functions">Functions ({selectedClass?.functions.length})</TabsTrigger>
                        <TabsTrigger value="nodes">Nodes ({selectedClass?.nodes?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="properties">
                        <PropertyList properties={selectedClass?.properties} />
                    </TabsContent>
                    <TabsContent value="functions">
                        <FunctionList functions={selectedClass?.functions} />
                    </TabsContent>
                    <TabsContent value="nodes">
                        <NodeList nodes={selectedClass?.nodes || []} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};
