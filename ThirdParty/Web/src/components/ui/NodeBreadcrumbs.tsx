import React from 'react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';

const NodeBreadcrumbs: React.FC = () => {
    const { selectedClass, selectedNode } = useSelectedClass();

    return (
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Classes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {selectedClass && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/class/${selectedClass.name}`}>{selectedClass.name}</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                    </>
                )}
                {selectedNode && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbPage>{selectedNode.fullTitle}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

export default NodeBreadcrumbs;
