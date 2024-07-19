import React from 'react';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import FunctionBreadcrumbs from '../ui/FunctionBreadcrumbs';
import {Separator} from '../ui/separator';
import {Badge} from '../ui/badge';
import {NoteSection} from "../../components/NoteSection";

export const Function = () => {
    const { selectedClass, selectedFunction } = useSelectedClass();

    if (!selectedClass || !selectedFunction) {
        return <div>Loading...</div>;
    }

    const {description, name, flags, parameters, returnType} = selectedFunction || {}; // Provide a fallback to prevent errors if selectedFunction is undefined

    if (!selectedFunction) {
        return <p>No function selected</p>;  // Conditional rendering in case there's no selected function
    }

    return (
        <main className="p-2">
            <FunctionBreadcrumbs />
            <p className="mb-1 text-4xl font-bold">
                Function - {name || 'Unnamed'}
            </p>

            <Separator className="my-8" />
            <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                <div className="col-span-4 flex flex-col">
                    <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                        <p className="uppercase text-sm font-semibold mb-1 text-muted-foreground">Return Type</p>
                        <h2 className="text-lg font-mono text-orange-700 dark:text-orange-400">{returnType}</h2>
                    </div>
                    <div className="rounded-lg p-2 bg-muted border-2">
                        <p className="uppercase text-sm font-semibold mb-2 text-muted-foreground">Flags</p>
                        <h2 className="text-base font-mono text-blue-700">
                            {flags && flags?.length !== 0 && (
                                <div className="flex flex-col items-start">
                                    {[
                                        ...flags
                                            ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('Comment') && !flag.startsWith('ToolTip')),
                                        ...flags
                                            ?.filter(flag => flag.startsWith('Comment') || flag.startsWith('ToolTip')),
                                    ].map((flag, index) => (
                                        <Badge key={index} variant="informational" className="mr-1 mb-1">
                                            {flag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </h2>
                    </div>
                </div>
                <div className="col-span-8 flex flex-col">
                    <h2 className="text-2xl font-mono pb-3">
                        <span className="text-left">{name}</span>
                    </h2>

                    <p className="text-muted-foreground text-xl">{description === ''
                        ? <span className="nty-zero-state-text">No description provided</span>
                        : description
                    }</p>

                    <NoteSection
                        classId={selectedClass.name}
                        itemId={selectedFunction.name}
                        itemName={selectedFunction.name}
                    />

                    <div className="mt-2">
                        <p className="uppercase text-sm font-semibold mt-4 mb-1 text-muted-foreground">Parameters</p>
                        {parameters?.length === 0
                            ? <p className="text-muted-foreground">No parameters provided</p>
                            : parameters?.map((param, index) => (
                                <div key={index} className="flex">
                                    <span className="font-mono text-foreground">{param.name}:</span>
                                    <span
                                        className="font-mono ml-2 text-orange-700 dark:text-orange-400">{param.type}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </main>
    );
};
