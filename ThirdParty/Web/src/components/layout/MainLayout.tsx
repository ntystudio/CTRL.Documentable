import {PropsWithChildren} from 'react';
import Sidebar from './Sidebar';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "../../components/ui/resizable";

const MainLayout = ({children}: PropsWithChildren) => {
    return (
        <main className="flex w-full h-screen overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="w-full">
                <ResizablePanel defaultSize={20} minSize={16} maxSize={25}>
                    <Sidebar/>
                </ResizablePanel>
                <ResizableHandle withHandle/>
                <ResizablePanel defaultSize={80}>
                    <div className="h-full overflow-y-auto px-4">{children}</div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </main>
    );
};

export default MainLayout;
