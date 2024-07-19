import React from 'react';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import FunctionBreadcrumbs from '../ui/FunctionBreadcrumbs';
import {Separator} from '../ui/separator';
import {Badge} from '../ui/badge';
import {NoteSection} from "../../components/NoteSection";
import {Card, CardContent} from "../../components/ui/card";
import {Popover, PopoverContent, PopoverTrigger} from "../../components/ui/popover";
import {Button} from "../../components/ui/button";

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
                    <Card>
                        <CardContent>
                            <div className="text-lg font-bold text-informational mt-4">{returnType}</div>
                            {flags && flags.length > 0 && (
                                <>
                                    <Separator className="my-2"/>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="mt-2 w-full">Metadata</Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto" align="start">
                                            <div className="flex flex-col items-start">
                                                {[
                                                    ...flags
                                                        ?.filter(flag => !flag.startsWith('ModuleRelativePath') && !flag.startsWith('ToolTip') && !flag.startsWith('Comment')),
                                                    ...flags
                                                        ?.filter(flag => flag.startsWith('ModuleRelativePath')),
                                                ].map((flag, index, array) => (
                                                    <div key={index} className="font-mono text-sm">
                                                        {flag}
                                                        {index !== array.length - 1 && <Separator className="my-2"/>}
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-8 flex flex-col">
                    <h2 className="text-2xl font-mono pb-3">
                        <span className="text-left">{name}</span>
                    </h2>

                    {description && (
                        <p className="text-muted-foreground text-lg mb-4">{description}</p>
                    )}

                    <NoteSection
                        classId={selectedClass.name}
                        itemId={selectedFunction.name}
                        itemName={selectedFunction.name}
                    />

                    <Separator className="my-6 max-w-xl"/>

                    <div>
                        <p className="uppercase text-sm font-semibold mb-3">Parameters</p>
                        {parameters?.length === 0
                            ? <p className="text-muted-foreground">No parameters provided</p>
                            : parameters?.map((param, index) => (
                                <div key={index} className="flex mb-2">
                                    <Badge
                                        className="rounded-lg border border-[#404044] bg-[#0c0d16] py-0.5 px-1.5 dark:text-white font-mono text-base">{param.name}:</Badge>
                                    <span className="font-bold ml-2 text-informational text-lg">{param.type}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </main>
    );
};
