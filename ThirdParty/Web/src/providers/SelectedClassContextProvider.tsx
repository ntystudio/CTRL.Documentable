import React, {createContext, useContext, useState, useEffect, Dispatch, SetStateAction, FC, ReactNode} from 'react';
import {FunctionConfig, NodeConfig, TreeItemConfig} from '../types/types';
import {generateTreeData} from '../utils/TreeDataUtil';

/*
  This context provider is used to store the selected node, class, and function data.
  It also fetches the tree data from the API and stores it in the context.
 */

interface ISelectedClassContext {
    objectData: TreeItemConfig[];
    setObjectData: Dispatch<SetStateAction<TreeItemConfig[]>>;
    selectedClass: TreeItemConfig | null;
    setSelectedClass: Dispatch<SetStateAction<TreeItemConfig | null>>;
    selectedFunction: FunctionConfig | null;
    setSelectedFunction: Dispatch<SetStateAction<FunctionConfig | null>>;
    selectedNode: NodeConfig | null;
    setSelectedNode: Dispatch<SetStateAction<NodeConfig | null>>;
}

// Default Node values for the context
const defaultNode: NodeConfig = {
    classId: '',
    className: '',
    description: '',
    docsName: '',
    fullTitle: '',
    imgPath: '',
    inputs: [],
    outputs: [],
    shortTitle: '',
};

// Default Function values for the context
const defaultFunction: FunctionConfig = {
    name: '',
    description: '',
    flags: [],
    returnType: '',
    parameters: [],
};

const localStorageKey = 'selectedClassContext';

// Default Class values for the context
const defaultContextValue: ISelectedClassContext = {
    objectData: [],
    setObjectData: () => {
    },
    selectedNode: defaultNode,
    setSelectedNode: () => {
    },
    selectedClass: null,
    setSelectedClass: () => {
    },
    selectedFunction: defaultFunction,
    setSelectedFunction: () => {
    },
};

const SelectedClassContext = createContext<ISelectedClassContext>(defaultContextValue);

export const SelectedClassContextProvider: FC<{children: ReactNode}> = ({children}) => {
    const [classState, setClassState] = useState<TreeItemConfig | null>(null);
    const [selectedNode, setSelectedNode] = useState<NodeConfig | null>(defaultNode);
    const [selectedFunction, setSelectedFunction] = useState<FunctionConfig | null>(defaultFunction);
    const [objectData, setObjectData] = useState<TreeItemConfig[]>([]);

    // Load context state from localStorage
    useEffect(() => {
        const storedState = localStorage.getItem(localStorageKey);
        if (storedState) {
            const parsedState = JSON.parse(storedState);
            setSelectedNode(parsedState.selectedNode);
            setSelectedFunction(parsedState.selectedFunction);
            setClassState(parsedState.selectedClass);
            setObjectData(parsedState.allData);
        }
    }, []);

    // Save context state to localStorage
    useEffect(() => {
        const state = {
            selectedNode,
            selectedFunction,
            selectedClass: classState,
            allData: objectData,
        };
        localStorage.setItem(localStorageKey, JSON.stringify(state));
    }, [selectedNode, selectedFunction, classState, objectData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const treeData = await generateTreeData();
                setObjectData(treeData);
                console.log(treeData);
            } catch (error) {
                console.error('Failed to generate tree data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <SelectedClassContext.Provider
            value={{
                selectedNode: selectedNode,
                setSelectedNode: setSelectedNode,
                selectedClass: classState,
                setSelectedClass: setClassState,
                objectData: objectData,
                setObjectData: setObjectData,
                selectedFunction: selectedFunction,
                setSelectedFunction: setSelectedFunction
            }}
        >
            {children}
        </SelectedClassContext.Provider>
    );
};

export const useSelectedClass = () => useContext(SelectedClassContext);
