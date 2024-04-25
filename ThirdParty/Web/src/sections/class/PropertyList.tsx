import React, {FC} from 'react';
import {PropertyItem} from './PropertyItem';
import {PropertyConfig} from '../../types/types';
import {Section} from './Section';

type PropertyListProps = {
    properties: PropertyConfig[]
}
export const PropertyList: FC<PropertyListProps> = ({properties}) => {
    const isEmpty = properties.length === 0;

    return (
        <Section
            dataNode={
                <div className="w-full overflow-x-auto rounded-md">
                    <table className="nty-table">
                        <thead>
                        <tr className="flex">
                            <th className="w-1/3 nty-th">Type</th>
                            <th className="w-2/3 nty-th">Name,
                                Description, Metadata
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {properties.map((property, index) => (
                            <tr key={index} className="flex">
                                <PropertyItem property={property} />
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            }
            title={`Properties (${properties.length})`}
            isEmpty={isEmpty}
        />
    );
};
