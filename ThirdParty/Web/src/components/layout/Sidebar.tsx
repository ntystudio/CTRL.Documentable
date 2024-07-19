import { TreeViewer } from "../TreeViewer";

const Sidebar = () => {
    return (
        <aside className="hidden w-96 flex-col border-r bg-muted px-6 py-16 sm:flex h-screen overflow-y-auto" id="separator-sidebar">
            <TreeViewer />
        </aside>
    );
};

export default Sidebar;
