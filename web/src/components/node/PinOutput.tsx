import React, {FC} from 'react';
import {NodePinConfig} from '../../types/types';

type NodePinOutputProps = {
    item: NodePinConfig;
};
export const PinOutput: FC<NodePinOutputProps> = ({item: {name, type, description}}) => {
    return (
        <>
            <span className="rounded-lg border border-border bg-card dark:border-border dark:bg-card py-0.5 px-1.5 text-black dark:text-white font-mono text-base">{name ? `${name}:` : '-'}</span>
            <span className="font-bold ml-2 text-informational text-lg">{type ? type : '-'}</span>
            {/*<p className="text-muted-foreground text-sm">{description ? description : '-'}</p>*/}
        </>
    );
};
