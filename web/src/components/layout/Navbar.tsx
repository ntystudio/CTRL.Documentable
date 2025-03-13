import {ThemeSwitcher} from 'src/components/ui/ThemeSwitcher';
import {GitHubLogoIcon} from "@radix-ui/react-icons";

const Navbar = () => {
    return (
        <nav
            className="fixed top-0 z-50 w-full border-b-2 text-secondary flex justify-between px-4 py-2 bg-background dark:bg-background">
            <a className="text-xl text-foreground" href="/">CTRL Documentable</a>
            <div className="flex items-center">
                <a href="https://github.com/ntystudio/CTRL-documentable" target="_blank" className="text-xl text-foreground">
                    <GitHubLogoIcon className="w-6 h-6 mr-2 text-black dark:text-white"/>
                </a>
                <ThemeSwitcher />
            </div>
        </nav>
    );
};

export default Navbar;
