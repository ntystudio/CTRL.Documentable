import React, {FC} from 'react';
import {NodePinConfig} from '../../types/types';

interface NodePinInputProps {
    item: NodePinConfig;
}

export const PinInput: FC<NodePinInputProps> = ({item: {name, description, type}}) => {
    return (
        <>
            <span className="font-mono text-foreground">{name ? `${name}:` : '-'}</span>
            <span className="font-mono ml-2 text-orange-700 dark:text-orange-400">{type ? type : '-'}</span>
        </>
    );
};
