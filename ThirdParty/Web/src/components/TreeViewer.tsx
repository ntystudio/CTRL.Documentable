import * as React from 'react';
import Box from '@mui/material/Box';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Icon } from '@iconify/react';
import { TreeItemConfig } from '../types/types';
import { useSelectedClass } from '../providers/SelectedClassContextProvider';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';

interface TreeViewerItemProps {
    item: TreeItemConfig;
}

const StrippedSquare = () => {
    return (
        <svg
            className="hushur-icon text-blue"
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 95 95"
            fill="none"
        >
            <path d="M0 0V24.6L24.6 0H0Z" fill="#949AA2" />
            <path d="M40.8 0L0 40.7V66.2L66.2 0H40.8Z" fill="#949AA2" />
            <path d="M82.3 0L0 82.3V95H12.7L95 12.7V0H82.3Z" fill="#949AA2" />
            <path d="M54.2001 95L95 54.2001V28.8L28.8 95H54.2001Z" fill="#949AA2" />
            <path d="M95 95V70.4L70.3 95H95Z" fill="#949AA2" />
        </svg>
    );
};

export const TreeViewer: React.FC = () => {
    const { objectData } = useSelectedClass();
    const [darkMode, setDarkMode] = React.useState(true);
    const [expanded, setExpanded] = React.useState<string[]>([]);
    const [searchQuery, setSearchQuery] = React.useState('');

    React.useEffect(() => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDarkMode);

        // Initially expand all nodes
        setExpanded(getFirstLevelNodeIds(objectData));
    }, [objectData]);

    // Function to get the first level of node IDs
    const getFirstLevelNodeIds = (items: TreeItemConfig[]): string[] => {
        return items.map(item => item.id);  // This returns only the top-level node IDs
    };

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
        setExpanded(nodeIds);
    };

    // Function to filter the tree items based on the search query
    const filterItems = (items: TreeItemConfig[], query: string): TreeItemConfig[] => {
        if (!query) return items;
        const filteredItems = items
            .map(item => {
                if (item.name.toLowerCase().includes(query.toLowerCase())) {
                    return item;
                }
                const filteredChildren = filterItems(item.children || [], query);
                if (filteredChildren.length > 0) {
                    return {
                        ...item,
                        children: filteredChildren
                    };
                }
                return null;
            })
            .filter(item => item !== null);
        return filteredItems as TreeItemConfig[];
    };

    const filteredData = filterItems(objectData, searchQuery);

    return (
        <Box
            sx={{
                minHeight: 220,
                flexGrow: 1,
                maxWidth: 300,
                color: darkMode ? 'white' : 'black',
            }}
        >
            <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="p-2 border rounded mb-4 dark:border-gray-600/50"
            />
            {filteredData.map((category: TreeItemConfig) => (
                <div key={category.id}>
                    {/*<a*/}
                    {/*    href="#"*/}
                    {/*    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"*/}
                    {/*>*/}
                    {/*    <CodeIcon className="h-4 w-4" />*/}
                    {/*    {category.name}*/}
                    {/*</a>*/}
                    <TreeView
                        aria-label="multi-select"
                        defaultCollapseIcon={<Icon icon="ph:folder-duotone" width="20" />}
                        defaultExpandIcon={<Icon icon="ph:folder-duotone" width="20" />}
                        defaultEndIcon={<StrippedSquare />}
                        multiSelect
                        expanded={expanded}
                        onNodeToggle={handleToggle}
                    >
                        {category.children && category.children.map((item: TreeItemConfig) => (
                            <TreeViewerItem item={item} key={item.id} />
                        ))}
                    </TreeView>
                </div>
            ))}
        </Box>
    );
};

const TreeViewerItemComponent: React.FC<TreeViewerItemProps> = ({ item }) => {
    const navigate = useNavigate();
    const { setSelectedClass } = useSelectedClass();

    const handleClick = () => {
        navigate('class/' + item.path);
        setSelectedClass(item);
    };

    const customLabel = (
        <span className="text-xs font-sans">{item.name}</span>
    );

    return (
        <TreeItem
            onClick={handleClick}
            className="text-foreground"
            nodeId={item.id}
            label={customLabel}
        >
            {item.children && item.children.map((child) => (
                <TreeViewerItem item={child} key={child.id} />
            ))}
        </TreeItem>
    );
};

const TreeViewerItem = React.memo(TreeViewerItemComponent);
