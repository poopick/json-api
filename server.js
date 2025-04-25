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
// Add character via GET (extended version)
app.get('/add_char', (req, res) => {
  const { name, race, age, personality, goals, visual_description } = req.query;

  if (!name || !age || !personality || !goals || !visual_description) {
    return res.status(400).json({ 
      error: 'Name, age, personality, goals, and visual_description are required'
    });
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

    const newCharacter = { 
      name,
      race,
      age: Number(age),
      personality,
      goals,
      visual_description
    };

    json.characters.push(newCharacter);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save character' });
      res.status(200).json({ message: 'Character added', character: newCharacter });
    });
  });
});


// Get specific character by name
app.get('/get_char', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const characters = json.characters || [];
    const character = characters.find(c => c.name.toLowerCase() === name.toLowerCase());

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    res.status(200).json({ 
      name: character.name,
      race: character.race,
      age: character.age,
      personality: character.personality,
      goals: character.goals,
      visual_description: character.visual_description
    });
  });
});





app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
