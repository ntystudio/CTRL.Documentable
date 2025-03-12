import {dataService} from '../services/DataService';
import {ObjectConfig, ITreeData, TreeItemConfig, ClassConfig} from '../types/types';

// Helper function to create a new tree item
const createTreeItem = (id: string, name: string, path: string): TreeItemConfig => ({
    id,
    name,
    path,
    children: [],
    functions: [],
    properties: [],
    nodes: [],
});

// Function to process each class config item
const processItem = (item: ObjectConfig, topLevelRoutes: Map<string, TreeItemConfig>) => {
    const pathSegments = item.path.split('/');
    const firstSegment = pathSegments[0];

    if (!topLevelRoutes.has(firstSegment)) {
        topLevelRoutes.set(firstSegment, createTreeItem(firstSegment, firstSegment, firstSegment));
    }

    const topLevelNode = topLevelRoutes.get(firstSegment);
    if (topLevelNode && pathSegments.length > 1) {
        const secondSegmentPath = pathSegments.slice(0, 2).join('/');
        let secondLevelNode = topLevelNode.children.find(n => n.path === secondSegmentPath);

        if (!secondLevelNode) {
            secondLevelNode = createTreeItem(secondSegmentPath, pathSegments[1], secondSegmentPath);
            topLevelNode.children.push(secondLevelNode);
        }

        secondLevelNode.children.push({
            id: item.className,
            name: item.className,
            path: item.path,
            children: [],
            functions: item.functions,
            properties: item.properties,
            nodes: item.nodes,
        });
    }
};

export const makeTreeData = (data: ClassConfig): ITreeData => {
    const topLevelRoutes = new Map<string, TreeItemConfig>();

    // data.nodes.forEach(item => {
    //     processItem(item, topLevelRoutes);
    // });

    data.forEach(item => {
        processItem(item, topLevelRoutes);
    });

    return Array.from(topLevelRoutes.values());
};

export const generateTreeData = async (): Promise<ITreeData> => {
    try {
        const data = await dataService.loadData();
        return makeTreeData(data);
    } catch (error) {
        console.error('Error loading or processing data:', error);
        throw error;  // Rethrow or handle as necessary
    }
};
