import React, {useEffect} from 'react';
import {FunctionParameter} from './FunctionParameter';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../ui/breadcrumb";

export const Function = () => {
    const {selectedFunction} = useSelectedClass();
    console.log(useSelectedClass())

    const {description, name, flags, parameters, returnType} = selectedFunction || {}; // Provide a fallback to prevent errors if selectedFunction is undefined

    if (!selectedFunction) {
        return <p>No function selected</p>;  // Conditional rendering in case there's no selected function
    }

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
                Function - {name || 'Unnamed'}
            </p>
            <hr className="nty-hr" />
            <div className="text-dark-color-base-40 dark:text-light-color-base-40 mb-3">
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

            {parameters && parameters.length > 0 ? (
                <div className="w-full overflow-x-auto rounded-md mt-12">
                    <table className="nty-table">
                        <thead>
                            <tr className="flex">
                                <th className="w-1/2 nty-th">Type</th>
                                <th className="w-1/2 nty-th">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parameters.map((parameter, index) => (
                                <tr key={index} className="flex">
                                    <FunctionParameter parameter={parameter} />
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-dark-color-base-60 dark:text-light-color-base-60 mb-3">
                    <p className="nty-zero-state-text mt-8">No parameters available for this function.</p>
                </div>
                )}
        </main>
    );
};
