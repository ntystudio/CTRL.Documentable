import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import { TreeItemConfig } from '../../types/types';
import { FunctionList } from './FunctionList';
import { NodeList } from './NodeList';
import { PropertyList } from './PropertyList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowRight, Dot } from 'lucide-react';

export const Class = () => {
    const params = useParams();
    const path = params['*'];
    const [currentTab, setCurrentTab] = useState('properties');

    const { selectedClass, setSelectedClass, objectData } = useSelectedClass();

    const tabs = useMemo(() => {
        if (!selectedClass) return [];
        return [
            { id: "properties", label: "Properties", count: selectedClass.properties?.length || 0 },
            { id: "functions", label: "Functions", count: selectedClass.functions?.length || 0 },
            { id: "nodes", label: "Nodes", count: selectedClass.nodes?.length || 0 },
        ].filter(tab => tab.count > 0);
    }, [selectedClass]);

    const defaultTab = useMemo(() => tabs.length > 0 ? tabs[0].id : "properties", [tabs]);

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
    }, [objectData, path, setSelectedClass]);

    useEffect(() => {
        // Reset currentTab when tabs change
        if (tabs.length > 0 && !tabs.some(tab => tab.id === currentTab)) {
            setCurrentTab(tabs[0].id);
        }
    }, [tabs, currentTab]);

    if (!selectedClass) {
        return <div>Not Found</div>;
    }

    return (
        <div className="relative pb-16">
            <div className="p-4 bg-sidebar border-b">
                <span className="text-sm text-muted-foreground uppercase">Class</span>
                <p className="text-2xl -mt-1">
                    {selectedClass?.name}
                </p>
                <div className="flex flex-col mt-2">
                    <div className="mt-1 flex items-center flex-wrap">
                        {selectedClass?.classHierarchy?.map((item, index) => (
                            <div key={item} className="flex items-center text-muted-foreground">
                                <span className="text-sm">{item}</span>
                                {index < (selectedClass.classHierarchy?.length || 0) - 1 && (
                                    <span className="mx-1 text-muted-foreground"><Dot className="size-4" /></span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <Tabs defaultValue={defaultTab} value={currentTab} onValueChange={(value) => setCurrentTab(value)}>
                    <TabsList className="mb-4">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id}>
                                {tab.label} ({tab.count})
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map(tab => (
                        <TabsContent key={tab.id} value={tab.id}>
                            {tab.id === "properties" && <PropertyList properties={selectedClass?.properties} />}
                            {tab.id === "functions" && <FunctionList functions={selectedClass?.functions} />}
                            {tab.id === "nodes" && <NodeList nodes={selectedClass?.nodes || []} />}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
};
