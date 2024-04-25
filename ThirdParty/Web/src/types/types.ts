// Paths
export type IPath = string;

// NodeList
export interface NodeConfig {
    docsName: string;
    classId: string;
    className: string;
    shortTitle: string;
    fullTitle: string;
    imgPath: string;
    inputs: NodePinConfig[];
    outputs: NodePinConfig[];
    description?: string;
}

// FunctionList
export interface FunctionConfig {
    name: string;
    returnType: string;
    parameters: ParameterConfig[];
    flags?: string[];
    description?: string;
}

// PropertyList
export interface PropertyConfig {
    name: string;
    type: string;
    flags?: string[];
    description?: string;
}

// Inputs and Outputs for NodeList
export interface NodePinConfig {
    name: string;
    type: string;
    description?: string;
}

// Parameters used in FunctionList
export interface ParameterConfig {
    name: string;
    type: string;
    flags?: string[];
    description?: string;
}

// Tree structures for organizing hierarchical data
export interface TreeItemConfig {
    id: string;
    name: string;
    path: IPath;
    children: Array<TreeItemConfig>;
    properties: Array<PropertyConfig>;
    functions: Array<FunctionConfig>;
    nodes?: Array<NodeConfig>;
}

export type ITreeData = Array<TreeItemConfig>;

// Main Class Interface
export interface ObjectConfig {
    className: string;
    path: IPath;
    properties: Array<PropertyConfig>;
    functions: Array<FunctionConfig>;
    nodes?: Array<NodeConfig>;
}

export interface ClassConfig {
    nodes: ObjectConfig[];
}
