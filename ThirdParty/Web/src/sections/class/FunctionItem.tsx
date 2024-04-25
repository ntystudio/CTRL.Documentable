import React, {FC} from 'react';
import {FunctionConfig} from '../../types/types';
import {FunctionItemParameter} from './FunctionItemParameter';
import {useNavigate} from 'react-router-dom';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {LinkIcon} from '../../components/UI/icons/LinkIcon';

interface IFunctionItemProps {
    function: FunctionConfig;
}

export const FunctionItem: FC<IFunctionItemProps> = ({
     function: {
         name,
         description,
         parameters,
         returnType,
         flags,
     },
 }) => {
    const {setSelectedFunction, selectedClass} = useSelectedClass();
    const navigate = useNavigate();

    // Destructure the class name from the selectedClass object via an alias
    const { name: className } = selectedClass || {};

    const selectFunctionHandler = () => {
        setSelectedFunction({name, description, parameters, returnType, flags});
        navigate(`/class/${className}/function/${name}`);
    };

    return (
        <>
            <td className="w-1/2 nty-td">
                <div className="text-dark-color-base-20 dark:text-light-color-base-20">
                    <button onClick={selectFunctionHandler} className="font-mono nty-text-link-std">
                        <LinkIcon className="text-current" />
                        <span className="ml-1 text-left">{returnType} {name}{parameters.length !== 0 ? '' : '()'}</span>
                    </button>
                    {parameters.length !== 0 && (
                        <div className="flex flex-col">
                            (
                            {parameters.map((parameter, index) => (
                                <FunctionItemParameter key={index} parameter={parameter} />
                            ))}
                            )
                        </div>
                    )}
                </div>
            </td>
            <td className="w-1/2 nty-td">
                <div className="mb-3 nty-text-body-std">
                    {description === '' ?
                        <span className="nty-zero-state-text">No description provided</span> : description}
                </div>
                <div
                    className="nty-box-std">
                    {flags?.map((flag, index) => (
                        <span key={index} className="font-mono nty-text-body-std">
                            {flag}
                            {index !== flags.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            </td>
        </>
    );
};
