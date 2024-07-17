import axios from 'axios';

export const fetchNotes = async () => {
    try {
        const response = await axios.get('http://localhost:3026/api/notes');
        return response.data.notes;
    } catch (error) {
        console.error('Failed to fetch notes:', error);
        return [];
    }
};

export const updateNotesFile = async (notes: any) => {
    try {
        await axios.post('http://localhost:3026/api/notes', { notes });
    } catch (error) {
        console.error('Failed to update notes file:', error);
    }
};
