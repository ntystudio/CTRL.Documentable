// TreeViewer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { Input } from './ui/input';
import { TreeItemConfig } from '../types/types';
import { useSelectedClass } from '../providers/SelectedClassContextProvider';
import SearchResults from './SearchResults';

export const TreeViewer: React.FC = () => {
    const { objectData, setSelectedClass } = useSelectedClass();
    const [darkMode, setDarkMode] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeItemId, setActiveItemId] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDarkMode);

        const findActiveItem = (items: TreeItemConfig[]): string | null => {
            for (const item of items) {
                if (location.pathname.includes(`/class/${item.path}`)) {
                    return item.id;
                }
                if (item.children) {
                    const childResult = findActiveItem(item.children);
                    if (childResult) return childResult;
                }
            }
            return null;
        };

        setActiveItemId(findActiveItem(objectData));
    }, [objectData, location.pathname]);

    const filterItems = useCallback((items: TreeItemConfig[], query: string): TreeItemConfig[] => {
        if (!query) return [];
        const results: TreeItemConfig[] = [];
        items.forEach(item => {
            if (item.name.toLowerCase().includes(query.toLowerCase())) {
                results.push(item);
            }
            if (item.children) {
                results.push(...filterItems(item.children, query));
            }
        });
        return results;
    }, []);

    const searchResults = useMemo(() => filterItems(objectData, searchQuery), [objectData, searchQuery, filterItems]);

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleItemClick = useCallback((item: TreeItemConfig) => {
        navigate('class/' + item.path);
        setSelectedClass(item);
        setActiveItemId(item.id);
    }, [navigate, setSelectedClass]);

    const renderChildLinks = useCallback((children: TreeItemConfig[]) => {
        return (
            <ul className="">
                {children.map((child) => (
                    <li key={child.id}>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value={child.id}>
                                <AccordionTrigger
                                    onClick={() => handleItemClick(child)}
                                    className={`text-sm hover:underline ${activeItemId === child.id ? 'font-bold text-blue-500' : ''}`}
                                >
                                    {child.name}
                                </AccordionTrigger>
                                {child.children && child.children.length > 0 && (
                                    <AccordionContent>
                                        <ul className="">
                                            {child.children.map((grandchild) => (
                                                <li key={grandchild.id} className="">
                                                    <button
                                                        onClick={() => handleItemClick(grandchild)}
                                                        className={`
                                                            flex flex-row justify-between pl-4 pr-1.5 py-1.5 text-sm w-full
                                                            border-l-2 border-color-gray-200 hover:bg-gray-200 dark:border-gray-200/10 dark:hover:bg-gray-200/10 rounded-r
                                                            ${activeItemId === grandchild.id
                                                            ? 'font-bold text-blue-500 bg-gray-100 dark:bg-gray-700'
                                                            : 'text-muted-foreground'
                                                        }
                                                        `}
                                                    >
                                                        {grandchild.name}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                )}
                            </AccordionItem>
                        </Accordion>
                    </li>
                ))}
            </ul>
        );
    }, [activeItemId, handleItemClick]);

    const renderAccordionItems = useMemo(() => {
        return objectData.map((item) => (
            <React.Fragment key={item.id}>
                {item.children && item.children.length > 0 && renderChildLinks(item.children)}
            </React.Fragment>
        ));
    }, [objectData, renderChildLinks]);

    return (
        <div className={darkMode ? 'dark' : ''}>
            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="p-2 pr-8 border rounded dark:border-gray-600/50"
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label="Clear search"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
            {searchQuery ? (
                <SearchResults results={searchResults} activeItemId={activeItemId} />
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {renderAccordionItems}
                </Accordion>
            )}
        </div>
    );
};

export default TreeViewer;
