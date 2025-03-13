import { PropsWithChildren } from 'react';
import { Separator } from "../ui/separator";
import { AppSidebar } from '../app-sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '../ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../ui/breadcrumb';
import { ThemeSwitcher } from 'src/components/ui/ThemeSwitcher';

const MainLayout = ({ children }: PropsWithChildren) => {
    return (
        <main className="flex w-full h-screen overflow-hidden">
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b justify-between">
                        <div className="flex items-center gap-2 px-3">
                            <SidebarTrigger />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem className="hidden md:block">
                                        <BreadcrumbLink href="#">
                                            Building Your Application
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>
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
