import {PropsWithChildren} from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({children}: PropsWithChildren) => {
    return (
        <>
            <Navbar />
            <main className="flex min-h-screen w-full bg-background">
                <Sidebar />
                <div className="flex-1 px-6 py-16 overflow-y-auto h-screen">
                    <div className="flex-1">{children}</div>
                </div>
            </main>
        </>
    );
};

export default MainLayout;
