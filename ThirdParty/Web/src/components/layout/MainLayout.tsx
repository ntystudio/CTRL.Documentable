import {PropsWithChildren} from 'react';
import {twMerge} from 'tailwind-merge';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLayout } from '../../providers/LayoutContext';

const MainLayout = ({children}: PropsWithChildren) => {
    const { showToC } = useLayout();
    return (
        <>
            <Navbar />
            <main className={twMerge('dark:bg-dark-color-base-00 bg-light-color-base-00')}>
                <div className="flex min-h-screen w-full bg-background">
                    <Sidebar />
                    <div className="flex-1 p-6 sm:p-10">
                        <div className="flex-1">{children}</div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default MainLayout;
