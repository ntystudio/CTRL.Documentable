import React, {FC, ReactNode} from "react";
import {EmptyContainer} from "./ui/EmptyContainer";

interface NodePinProps<T> {
    items: T[];
    title: string;
    ItemComponent: React.ComponentType<{item: T}>;
}

type IProps = {
    title: string
    dataNode: ReactNode
    isEmpty: boolean
}

const Section: FC<IProps> = (props) => {
    const {title: type, dataNode, isEmpty} = props;

    return (
        <>
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


export const NodePins = <T, >({items, title, ItemComponent}: NodePinProps<T>) => (
    <>
        <p className="uppercase text-sm font-semibold mt-4 mb-3">{title}</p>
        {items.map((item, index) => (
                <div key={index} className="flex mb-2">
                    <ItemComponent item={item} />
                </div>
            ))
        }
    </>
);
