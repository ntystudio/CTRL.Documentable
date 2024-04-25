/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {createContext, useContext} from 'react';
import {ClassConfig} from '../types/types';

export const Context = createContext({});


const MainContext = (props: any) => {
    const {children} = props;
    const [state] = React.useState<any>({
        user: {
            sessionId: '',
        },
        settings: {},
    });

    return (
        <Context.Provider
            value={{
                ...state,
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default MainContext;
