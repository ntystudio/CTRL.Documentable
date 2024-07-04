import React, {FC} from 'react';
import {PropertyConfig} from '../../types/types';

type PropertyItemProps = {
    property: PropertyConfig;
};
export const PropertyItem: FC<PropertyItemProps> = ({property: {description, type, name, flags}}) => {

    return (
        <>
            <td className="w-1/3 nty-td">
                <div className="text-md text-light-color-cyan dark:text-dark-color-cyan font-mono truncate" title={type}>
                    {type}
                </div>
            </td>
            <td className="w-2/3 nty-td">
                <div className="text-dark-color-base-20 dark:text-light-color-base-20 font-mono">
                    {name}
                </div>
                <div className="text-dark-color-base-60 dark:text-light-color-base-60 mb-3">
                    {description === '' ?
                        <span className="nty-zero-state-text">No description provided</span> : description}
                </div>
                {flags?.length !== 0 &&
                    <div className="nty-box-std">
                        {flags?.map((flag, index) => (
                            <span key={index} className="font-mono  nty-text-body-std">
                                {flag}
                                {index !== flags.length - 1 && ', '}
                            </span>
                        ))}
                    </div>
                }
            </td>
        </>
    );
};
