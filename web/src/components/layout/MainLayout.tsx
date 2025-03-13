import { PropsWithChildren } from 'react';
import { Separator } from "../ui/separator";
import { AppSidebar } from '../app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '../ui/breadcrumb';
import { ThemeSwitcher } from 'src/components/ui/ThemeSwitcher';
import { useSelectedClass } from '../../providers/SelectedClassContextProvider';
import { useNavigate } from 'react-router-dom';
import { handleHomeClick } from 'src/lib/utils';

const MainLayout = ({ children }: PropsWithChildren) => {
    const { selectedClass, setSelectedClass } = useSelectedClass();
    const navigate = useNavigate();

    return (
        <main className="flex w-full h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b justify-between">
                        <div className="flex items-center gap-2 px-3">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            {selectedClass !== null ? (
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink onClick={(e) => handleHomeClick(e, setSelectedClass, navigate)} href="/">Classes</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbLink href={`/class/${selectedClass.path}`}>{selectedClass.name}</BreadcrumbLink>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            ) : (
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink onClick={(e) => handleHomeClick(e, setSelectedClass, navigate)} href="/">Classes</BreadcrumbLink>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            )}
                        </div>
                        <ThemeSwitcher />
                    </header>
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </main>
    );
};

export default MainLayout;
