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

// Get contact info by character name
app.get('./characters/name_list', (req, res) => {
  //const { name } = req.params;
  fs.readFile('./characters/name_list', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });
    res.json({ contact: character.contact });
  });
});

// Add character via GET
app.get('/add_char', (req, res) => {
  const { name, age } = req.query;

  if (!name  || !description) {
    return res.status(400).json({ error: 'Name,age and description are required' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON in file' });
    }

    if (!Array.isArray(json.characters)) {
      json.characters = [];
    }

    const newCharacter = { name, age: Number(age) };
    json.characters.push(newCharacter);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save character' });
      res.status(200).json({ message: 'Character added', character: newCharacter });
    });
  });
});



app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
