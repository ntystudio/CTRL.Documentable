import React, {FC, ReactNode} from 'react';
import {EmptyContainer} from '../../components/UI/EmptyContainer';

type IProps = {
    title: string
    dataNode: ReactNode
    isEmpty: boolean
}

export const Section: FC<IProps> = (props) => {
    const {title: type, dataNode, isEmpty} = props;

    return (
        <>
            <h2 className="text-dark-color-base-00 dark:text-light-color-base-00 text-3xl mb-6 mt-8">{type}</h2>
            {isEmpty ? (
                <EmptyContainer text={`No ${type} available for this class`} />
            ) : (
                <div className="w-full">
                    {dataNode}
                </div>
            )}
        </>
    );
};
