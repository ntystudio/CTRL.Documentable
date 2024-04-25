import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

export const ThemeSwitcher = () => {

    // Initialize darkMode based on localStorage or default to true
    // Adding explicit type definition for useState
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        const storedMode = localStorage.getItem('darkMode');
        return storedMode ? storedMode === 'true' : true;  // Explicitly handle null from localStorage
    });

    useEffect(() => {
        // Apply or remove the 'dark' class on the <html> element based on darkMode state
        document.documentElement.classList.toggle('dark', darkMode);
        // Store the current state in localStorage
        localStorage.setItem('darkMode', darkMode.toString());
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    return (
        <button onClick={toggleDarkMode}>
            {
                darkMode ? <Icon icon="iconamoon:mode-light-light" width="24" color="white" /> :
                    <Icon icon="iconamoon:mode-dark-light" width="24" />
            }
        </button>
    );
};

export default ThemeSwitcher;
