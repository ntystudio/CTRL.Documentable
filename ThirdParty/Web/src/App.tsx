import {Route, Routes} from 'react-router-dom';
import 'non.geist';
import MainLayout from './layouts/MainLayout';
import MainContext from './providers/MainProvider';
import {SelectedClassContextProvider} from './providers/SelectedClassContextProvider';
import {LayoutProvider} from './providers/LayoutContext';
import {Class} from './sections/class/Class';
import {Function} from './sections/function/Function';
import {Node} from './sections/node/Node';

const App = () => {
    return (
        <MainContext>
            <SelectedClassContextProvider>
                <LayoutProvider>
                    <MainLayout>
                        <Routes>
                            <Route path="/" element={<></>} />
                            <Route path="/class/*" element={<Class />} />
                            <Route path="/class/:uuid/function/:uuid" element={<Function />} />
                            <Route path="/class/:uuid/node/:uuid" element={<Node />} />
                        </Routes>
                    </MainLayout>
                </LayoutProvider>
            </SelectedClassContextProvider>
        </MainContext>
    );
};

export default App;
