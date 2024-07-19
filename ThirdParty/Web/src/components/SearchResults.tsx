// SearchResults.tsx
import React from 'react';
import { TreeItemConfig } from '../types/types';
import { useNavigate } from 'react-router-dom';
import { useSelectedClass } from '../providers/SelectedClassContextProvider';

interface SearchResultsProps {
    results: TreeItemConfig[];
    activeItemId: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, activeItemId }) => {
    const navigate = useNavigate();
    const { setSelectedClass } = useSelectedClass();

    const handleItemClick = (item: TreeItemConfig) => {
        navigate('class/' + item.path);
        setSelectedClass(item);
    };

    return (
        <ul className="space-y-1">
            {results.map((item) => (
                <li key={item.id} className="">
                    <button
                        onClick={() => handleItemClick(item)}
                        className={`
                            flex flex-row justify-between pl-4 pr-1.5 py-1.5 text-sm w-full
                            border-l-2 border-color-gray-200 hover:bg-gray-200 dark:border-gray-200/10 dark:hover:bg-gray-200/10 rounded-r
                            ${activeItemId === item.id
                            ? 'font-bold text-blue-500 bg-gray-100 dark:bg-gray-700'
                            : 'text-muted-foreground'
                        }
                        `}
                    >
                        {item.name}
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default SearchResults;
