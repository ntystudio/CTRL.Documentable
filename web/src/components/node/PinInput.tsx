import {FC} from 'react';
import {NodePinConfig} from '../../types/types';

interface NodePinInputProps {
    item: NodePinConfig;
}

export const PinInput: FC<NodePinInputProps> = ({item: {name, type}}) => {
    return (
        <>
            <span className="font-medium font-mono text-informational mr-2">{type}</span> 
            <span className="font-medium">{name}</span>
        </>
    );
};
