import {TreeViewer} from "../TreeViewer";
import {GitHubLogoIcon} from "@radix-ui/react-icons";
import {ThemeSwitcher} from "src/components/ui/ThemeSwitcher";

const Sidebar = () => {
    return (
        <nav className="h-screen overflow-y-auto flex-col border-r bg-muted px-6 py-4">
            <div className="space-y-1">
                <div className="flex w-full flex-row items-center justify-between mb-4">
                    <a className="uppercase font-bold " href="/">CTRL Documentable</a>
                    <div className="flex items-center">
                        <a href="https://github.com/ntystudio/CTRL-documentable" target="_blank"
                           className="text-xl text-foreground">
                            <GitHubLogoIcon className="w-6 h-6 mr-2 text-black dark:text-white"/>
                        </a>
                        <ThemeSwitcher/>
                    </div>
                </div>
                <TreeViewer/>
            </div>
        </nav>
    );
};

export default Sidebar;
