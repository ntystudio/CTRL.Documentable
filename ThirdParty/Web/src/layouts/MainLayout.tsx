import {PropsWithChildren} from 'react';
import {twMerge} from 'tailwind-merge';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLayout } from '../providers/LayoutContext';

const MainLayout = ({children}: PropsWithChildren) => {
    const { showToC } = useLayout();
    return (
        <>
            <Navbar />
            <main
                className={twMerge('dark:bg-dark-color-base-00 bg-light-color-base-00')}
            >
                <div className="flex h-full">
                    <Sidebar />
                    <div className="p-6 flex" style={{width: 'calc(100vw - 320px)'}}>
                        <div className="flex-1">{children}</div>
                        {showToC && (
                            <div
                                className="sticky top-0 p-3 border-2 border-light-color-base-40 dark:border-dark-color-base-40 bg-light-color-base-30 dark:bg-dark-color-base-30 text-left text-xs font-semibold text-dark-color-base-00 dark:text-light-color-base-00 uppercase hide-scrollbar rounded-md"
                                style={{minWidth: '120px', top: "60px" , height: 'fit-content'}}
                            >
                                <h2 className="mb-4 text-left text-xs font-semibold text-dark-color-base-00 dark:text-light-color-base-00 uppercase">Contents</h2>
                                <div className="table-of-contents">
                                    <ul className="list-none m-0 p-0">
                                        <li className="mb-2">
                                            <a href="#functions"
                                               className="text-light-color-blue dark:text-dark-color-blue hover:text-dark-color-blue hover:dark-text-light-color-blue">Functions</a>
                                        </li>
                                        <li className="mb-2">
                                            <a href="#nodes"
                                               className="text-light-color-blue dark:text-dark-color-blue hover:text-dark-color-blue hover:dark-text-light-color-blue">Nodes</a>
                                        </li>
                                        <li className="mb-2">
                                            <a href="#properties"
                                               className="text-light-color-blue dark:text-dark-color-blue hover:text-dark-color-blue hover:dark-text-light-color-blue">Properties</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default MainLayout;
