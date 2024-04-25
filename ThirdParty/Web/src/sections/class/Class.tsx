import {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {TreeItemConfig} from '../../types/types';
import {FunctionList} from './FunctionList';
import {NodeList} from './NodeList';
import {PropertyList} from './PropertyList';
import {useLayout} from '../../providers/LayoutContext';

export const Class = () => {
    const params = useParams();
    const path = params['*'];
    const { setShowToC } = useLayout();

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

        // Show the ToC when the component mounts
        setShowToC(true);

        // Hide the ToC when the component unmounts
        return () => {
            setShowToC(false);
        };

    }, [objectData, path, setShowToC]);

    if (!selectedClass) {
        return <div>Not Found</div>;
    }
    console.log(selectedClass);
    return (
        <div className="relative p-2">
            <div>
                <p className="mb-1 text-4xl text-dark-color-base-00 dark:text-light-color-base-00">
                    Class - {selectedClass?.name}
                </p>
                <hr className="nty-hr" />
                <div id="functions"
                     className="pt-2">
                    <FunctionList functions={selectedClass?.functions} />
                </div>
                <div id="nodes" className="pt-8">
                    <NodeList nodes={selectedClass?.nodes || []} />
                </div>
                <div id="properties" className="pt-8">
                    <PropertyList properties={selectedClass?.properties} />
                </div>
            </div>
        </div>
    );
};
