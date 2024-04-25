import {twMerge} from 'tailwind-merge';
import {ThemeSwitcher} from '../components/UI/themeSwitcher';

const Navbar = () => {
    return (
        <nav
            className={twMerge('sticky top-0 z-50 bg-light-color-base-00 dark:bg-dark-color-base-00 border-b-2 border-b-light-color-base-30 dark:border-b-dark-color-base-30 text-secondary flex justify-between px-4 py-2')}>
            <p className="text-xl text-dark-color-base-00 dark:text-light-color-base-00">CTRL Documentable</p>
            <ThemeSwitcher />
        </nav>
    );
};

export default Navbar;
