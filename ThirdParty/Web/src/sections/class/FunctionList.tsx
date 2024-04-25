import React, {FC} from 'react';
import {FunctionItem} from './FunctionItem';
import {FunctionConfig} from '../../types/types';
import {Section} from './Section';

type IFunctionListProps = {
    functions: FunctionConfig[]
}

export const FunctionList: FC<IFunctionListProps> = ({functions}) => {
    const isEmpty = functions.length === 0;

    return (
        <Section dataNode={
            <div className="w-full overflow-x-auto rounded-md">
                <table className="nty-table">
                    <thead>
                    <tr className="flex">
                        <th className="w-1/2 nty-th">Name</th>
                        <th className="w-1/2 nty-th">Description, Metadata</th>
                    </tr>
                    </thead>
                    <tbody>
                    {functions.map((functionItem, index) => (
                        <tr key={index} className="flex">
                            <FunctionItem function={functionItem} />
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        } title={`Functions (${functions.length})`} isEmpty={isEmpty} />
    );
};
