import React, {FC} from 'react';
import {NodePinConfig} from '../../types/types';

type NodePinOutputProps = {
    item: NodePinConfig;
};
export const PinOutput: FC<NodePinOutputProps> = ({item: {name, type, description}}) => {
    return (
        <>
            <td className="w-1/3 nty-td">
                <div className="text-light-color-cyan dark:text-dark-color-cyan font-mono">
                    {type ? type : '-'}
                </div>
            </td>
            <td className="w-1/3 nty-td">
                <div className="font-mono text-dark-color-base-20 dark:text-light-color-base-20">
                    {name ? name : '-'}
                </div>
            </td>
            <td className="w-1/3 nty-td">
                <div className=" nty-text-body-std">
                    {description ? description : '-'}
                </div>
            </td>
        </>
    );
};
