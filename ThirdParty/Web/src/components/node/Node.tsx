import React from 'react';
import {Section} from '../class/Section';
import {PinInput} from './PinInput';
import {PinOutput} from './PinOutput';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {NodePinConfig} from '../../types/types';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../ui/breadcrumb";

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
            <Breadcrumb className="mb-8">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <p className="mb-1 text-4xl text-dark-color-base-00 dark:text-light-color-base-00">
                Node - {shortTitle}
            </p>
            <hr className="nty-hr" />
            <div className="text-dark-color-base-40 dark:text-light-color-base-40 mb-3">
                {description === '' ?
                    <span className="nty-zero-state-text">No description provided</span> : description}
            </div>

            <img className="my-10" src={imgPath?.replace('..', '')} alt={`Visualization of node: ${description}`} />

            {inputs && <RenderSection<NodePinConfig> items={inputs} title="Inputs" ItemComponent={PinInput} />}
            {outputs && <RenderSection<NodePinConfig> items={outputs} title="Outputs" ItemComponent={PinOutput} />}
        </main>
    );
};
