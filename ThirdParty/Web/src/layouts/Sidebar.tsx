import {twMerge} from 'tailwind-merge';
import {TreeViewer} from '../core/TreeView';

const Sidebar = () => {
    return (
        <aside
            id="separator-sidebar"
            className={twMerge(
                'sticky top-0 z-40 h-screen overflow-y-auto transition-transform bg-light-color-base-00 dark:bg-dark-color-base-00 w-fit min-w-80 p-3',
                'hidden md:block border-r-2 border-r-light-color-base-30 dark:border-r-dark-color-base-30',
            )}
            aria-label="Sidebar"
        >
            <TreeViewer />
        </aside>
    );
};

export default Sidebar;
