import React from 'react';
import {Section} from '../class/Section';
import {PinInput} from './PinInput';
import {PinOutput} from './PinOutput';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {NodePinConfig} from '../../types/types';
import NodeBreadcrumbs from '../ui/NodeBreadcrumbs';
import {Separator} from '../ui/separator';

interface RenderSectionProps<T> {
    items: T[];
    title: string;
    ItemComponent: React.ComponentType<{item: T}>;
}

const RenderSection = <T, >({items, title, ItemComponent}: RenderSectionProps<T>) => (
    <Section
        title={title}
        dataNode={
            <div className="w-full overflow-x-auto rounded-md">
                <table className="nty-table">
                    <thead>
                        <tr className="flex">
                            <th className="w-1/3 nty-th">Type</th>
                            <th className="w-1/3 nty-th">Name</th>
                            <th className="w-1/3 nty-th">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} className="flex">
                                <ItemComponent item={item} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        }
        isEmpty={!items.length}
    />
);

export const Node = () => {
    const {selectedNode} = useSelectedClass();
    if (!selectedNode) {
        return <p>No node selected</p>;
    }

    const {shortTitle, description, imgPath, inputs, outputs} = selectedNode;

    return (
        <main className="p-2">
            <NodeBreadcrumbs />
            <p className="mb-1 text-4xl text-dark-color-base-00 dark:text-light-color-base-00">
                Node - {shortTitle}
            </p>

            <Separator className="my-8" />
            <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                <div className="col-span-4 flex flex-col">
                    <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                        <img src="/node-img-placeholder.png" alt="Node icon"
                             className="w-full max-w-[200px] mx-auto rounded-lg" />
                        {/*<img className="my-10" src={imgPath?.replace('..', '')}*/}
                        {/*     alt={`Visualization of node: ${description}`} />*/}
                    </div>
                </div>
                <div className="col-span-8 flex flex-col">
                    <div className="col-span-8 flex flex-col">
                        <h2 className="text-3xl font-mono pb-4">
                            <span className="ml-2 text-left">{shortTitle}</span>
                        </h2>
                        <p className="text-muted-foreground text-xl">{description === ''
                            ? <span className="nty-zero-state-text">No description provided</span>
                            : description
                        }</p>
                        {inputs && <RenderSection<NodePinConfig> items={inputs} title="Inputs" ItemComponent={PinInput} />}
                        {outputs && <RenderSection<NodePinConfig> items={outputs} title="Outputs" ItemComponent={PinOutput} />}
                    </div>
                </div>
            </div>
        </main>
    );
};
