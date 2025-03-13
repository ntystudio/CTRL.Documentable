import {PinInput} from './PinInput';
import {PinOutput} from './PinOutput';
import {useSelectedClass} from '../../providers/SelectedClassContextProvider';
import {NodePinConfig} from '../../types/types';
import NodeBreadcrumbs from '../ui/NodeBreadcrumbs';
import {Separator} from '../ui/separator';
import {NodePins} from "../NodePins";
import {NoteSection} from "../../components/NoteSection";


export const Node = () => {
    const { selectedClass, selectedNode } = useSelectedClass();

    if (!selectedClass || !selectedNode) {
        return <div>Loading...</div>;
    }

    const {shortTitle, description, imgPath, inputs, outputs} = selectedNode;

    return (
        <main className="p-2">
            <NodeBreadcrumbs />
            <p className="mb-1 text-4xl font-bold">
                Node - {shortTitle}
            </p>

            <Separator className="my-8" />
            <div className="grid grid-cols-12 gap-8 w-full max-w-[1200px]">
                <div className="col-span-4 flex flex-col">
                    <div className="rounded-lg p-2 bg-muted border-2 mb-3">
                        <img className="w-full max-w-[300px] mx-auto rounded-lg" src={imgPath?.replace('..', '')}
                             alt={`Visualization of node: ${description}`}/>
                    </div>
                </div>
                <div className="col-span-8">
                    <h2 className="text-2xl font-bold pb-3">
                        <span>{shortTitle}</span>
                    </h2>

                    {description && (
                        <p className="text-muted-foreground text-lg mb-4">{description}</p>
                    )}

                    <NoteSection
                        classId={selectedClass.name}
                        itemId={selectedNode.fullTitle}
                        itemName={selectedNode.fullTitle}
                    />

                    <Separator className="mt-6 mb-2 max-w-xl"/>

                    <div className="grid grid-cols-1 gap-4 w-full">
                        <div> {/* Inputs container */}
                            {inputs &&
                                <NodePins<NodePinConfig> items={inputs} title="Inputs" ItemComponent={PinInput}/>}
                        </div>
                        <Separator className="mt-2 mb-0 max-w-xl"/>
                        <div> {/* Outputs container */}
                            {outputs &&
                                <NodePins<NodePinConfig> items={outputs} title="Outputs" ItemComponent={PinOutput}/>}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};
