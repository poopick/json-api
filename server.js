const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = './data.json';

// Load data
app.get('/data', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });
    res.json(JSON.parse(data || '{}'));
  });
});

// Save data
app.post('/data', (req, res) => {
  const content = JSON.stringify(req.body, null, 2);
  fs.writeFile(filePath, content, 'utf8', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write file' });
    res.status(200).json({ message: 'Data saved' });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
