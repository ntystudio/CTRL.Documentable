import {Route, Routes} from 'react-router-dom';
import 'non.geist';
import MainLayout from './components/layout/MainLayout';
import MainContext from './providers/MainProvider';
import {SelectedClassContextProvider} from './providers/SelectedClassContextProvider';
import {LayoutProvider} from './providers/LayoutContext';
import {Class} from './components/class/Class';
import {Function} from './components/function/Function';
import {Node} from './components/node/Node';
import WelcomePage from "./components/Welcome";
import {NotesProvider} from "./providers/NotesContextProvider";

const App = () => {
    return (
        <MainContext>
            <SelectedClassContextProvider>
                <NotesProvider>
                    <LayoutProvider>
                        <MainLayout>
                            <Routes>
                                <Route path="/" element={<WelcomePage />} />
                                <Route path="/class/*" element={<Class />} />
                                <Route path="/class/:uuid/function/:uuid" element={<Function />} />
                                <Route path="/class/:uuid/node/:uuid" element={<Node />} />
                            </Routes>
                        </MainLayout>
                    </LayoutProvider>
                </NotesProvider>
            </SelectedClassContextProvider>
        </MainContext>
    );
};

export default App;
