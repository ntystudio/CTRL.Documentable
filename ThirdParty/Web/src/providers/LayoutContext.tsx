import React, {createContext, Dispatch, ReactNode, SetStateAction, useContext, useState} from 'react';

interface LayoutContextType {
    showToC: boolean;
    setShowToC: Dispatch<SetStateAction<boolean>>;
}

const defaultState = {
    showToC: false,
    setShowToC: (() => {}) as Dispatch<SetStateAction<boolean>>
};

const LayoutContext = createContext(defaultState);

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [showToC, setShowToC] = useState<boolean>(false);

    return (
        <LayoutContext.Provider value={{ showToC, setShowToC }}>
            {children}
        </LayoutContext.Provider>
    );
};
