import React, {FC} from 'react';
import {ParameterConfig} from '../../types/types';

interface ParameterItemProps {
    parameter: ParameterConfig;
};
export const FunctionParameter: FC<ParameterItemProps> = ({parameter: {name, type, description, flags}}) => {

    return (
        <>
            <td className="w-1/2 nty-td">
                <div className="text-light-color-cyan dark:text-dark-color-cyan font-mono">
                    {type}
                </div>
            </td>
            <td className="w-1/2 nty-td">
                <div className="font-mono nty-text-body-std">{name}</div>
            </td>
        </>
    );
};
