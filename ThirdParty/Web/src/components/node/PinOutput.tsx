import React, {FC} from 'react';
import {NodePinConfig} from '../../types/types';

type NodePinOutputProps = {
    item: NodePinConfig;
};
export const PinOutput: FC<NodePinOutputProps> = ({item: {name, type, description}}) => {
    return (
        <>
            <span className="font-mono text-foreground">{name ? `${name}:` : '-'}</span>
            <span className="font-mono ml-2 text-orange-700 dark:text-orange-400">{type ? type : '-'}</span>
            {/*<p className="text-muted-foreground text-sm">{description ? description : '-'}</p>*/}
        </>
    );
};
