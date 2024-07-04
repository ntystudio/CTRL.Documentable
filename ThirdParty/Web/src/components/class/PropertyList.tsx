import React, {FC} from 'react';
import {PropertyItem} from './PropertyItem';
import {PropertyConfig} from '../../types/types';
import {Section} from './Section';
import {Card, CardContent, CardHeader, CardDescription, CardFooter, CardTitle} from "../ui/card";
import {Label} from "../ui/label";
import {Input} from "../ui/input";
import {Button} from "../ui/button";

export const PropertyList: FC<PropertyListProps> = ({properties}) => {
    const isEmpty = properties.length === 0;

    return (
        <>
            <Card className="grid">
                <CardHeader>
                    <CardTitle>Account</CardTitle>
                    <CardDescription>
                        Make changes to your account here. Click save when you're done.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-row w-full">
                    <div className="grid grid-cols-4">
                        stuff
                    </div>
                    <div className="grid grid-cols-8">
                        stuff
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save changes</Button>
                </CardFooter>
            </Card>
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
        </>
);
};
type PropertyListProps = {
    properties: PropertyConfig[]
}
