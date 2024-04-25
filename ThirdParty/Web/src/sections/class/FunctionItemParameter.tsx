import React, {FC} from 'react';
import {ParameterConfig} from '../../types/types';

interface IFunctionsItemParameterProps {
    parameter: ParameterConfig;
}

export const FunctionItemParameter: FC<IFunctionsItemParameterProps> = ({parameter: {name, type, description}}) => {
    return (
        <div className="pl-2 flex flex-row justify-between">
            <div className="flex-grow">
                <span className="text-light-color-cyan dark:text-dark-color-cyan font-mono"> {type} </span>
            </div>
            <div className="w-1/2">
                <span className="font-mono"> {name} </span>
            </div>
        </div>
    );
};
