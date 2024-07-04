import React, {FC} from 'react';
import {NodeItem} from './NodeItem';
import {NodeConfig} from '../../types/types';
import {Section} from './Section';

type NodeListProps = {
    nodes: NodeConfig[];
};
export const NodeList: FC<NodeListProps> = ({nodes}) => {
    const isEmpty = nodes.length === 0;

    return (
        <Section
            dataNode={
                <div className="w-full overflow-x-auto rounded-md">
                    <table className="nty-table">
                        <thead>
                        <tr>
                            <th className="w-1/2 nty-th">Name</th>
                            <th className="w-2/3 nty-th">Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        {nodes.map((node, index) => (
                            <tr key={index}>
                                <NodeItem node={node} />
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            }
            title={`Nodes (${nodes.length})`}
            isEmpty={isEmpty}
        />
    );
};
