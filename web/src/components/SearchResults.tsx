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
        <ul>
            {results.map((item) => (
                <li key={item.id}>
                    <button
                        onClick={() => handleItemClick(item)}
                        className={`
                            flex flex-row justify-between pl-4 pr-1.5 py-1.5 text-sm w-full
                                                            border-l-2 border-color-gray-200 hover:bg-gray-200 dark:border-gray-200/10 dark:hover:border-[#26bbff] hover:border-[#26bbff] dark:hover:text-white dark:hover:bg-[#202024] rounded-r
                            ${activeItemId === item.id
                            ? 'text-blue-500'
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
