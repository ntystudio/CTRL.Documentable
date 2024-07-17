const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3026;

app.use(cors());
app.use(express.json());

const NOTES_FILE_PATH = path.join(__dirname, 'src', 'data', 'notes.json');

app.get('/api/notes', async (req, res) => {
    try {
        const notesData = await fs.readFile(NOTES_FILE_PATH, 'utf-8');
        res.json(JSON.parse(notesData));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read notes' });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        await fs.writeFile(NOTES_FILE_PATH, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to write notes' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
