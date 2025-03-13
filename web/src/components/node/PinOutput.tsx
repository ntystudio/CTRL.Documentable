import React, {FC} from 'react';
import {NodePinConfig} from '../../types/types';

type NodePinOutputProps = {
    item: NodePinConfig;
};
export const PinOutput: FC<NodePinOutputProps> = ({item: {name, type, description}}) => {
    return (
        <>
            <span className="font-medium font-mono text-informational mr-2">{type}</span>
            <span className="font-medium">{name}</span>
        </>
    );
};
