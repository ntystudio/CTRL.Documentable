import {twMerge} from 'tailwind-merge';
import {TreeViewer} from "../TreeViewer";
import {BoxIcon, CodeIcon, CubeIcon, HomeIcon, QuestionMarkCircledIcon} from "@radix-ui/react-icons";

const Sidebar = () => {
    return (
        <aside className="hidden w-64 flex-col border-r bg-muted p-6 sm:flex" id="separator-sidebar">
            <div className="mb-4 text-lg font-bold">Documentation</div>
            <nav className="space-y-2">
                <a
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                >
                    <HomeIcon className="h-4 w-4" />
                    Introduction
                </a>
                <a
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                >
                    <BoxIcon className="h-4 w-4" />
                    Installation
                </a>
                <a
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                >
                    <CubeIcon className="h-4 w-4" />
                    Usage
                </a>
                <a
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                >
                    <CodeIcon className="h-4 w-4" />
                    API Reference
                </a>
                <a
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50"
                >
                    <QuestionMarkCircledIcon className="h-4 w-4" />
                    Support
                </a>
            </nav>
            <TreeViewer />
        </aside>
    );
};

export default Sidebar;
