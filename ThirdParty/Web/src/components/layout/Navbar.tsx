import {ThemeSwitcher} from '../ui/themeSwitcher';

const Navbar = () => {
    return (
        <nav
            className="fixed top-0 z-50 w-full border-b-2 text-secondary flex justify-between px-4 py-2 bg-background dark:bg-background">
            <p className="text-xl text-foreground">CTRL Documentable</p>
            <ThemeSwitcher />
        </nav>
    );
};

export default Navbar;
