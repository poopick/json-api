const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const filePath = './data.json';

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

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
  const { name, race, age, personality, goals, visual_description, relationship } = req.query;

  if (!name || !race || !age || !personality || !goals || !visual_description || !relationship) {
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
      visual_description,
      relationship
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
      visual_description: character.visual_description,
      relationship: character.relationship
    });
  });
});

// Update character attributes
app.get('/update_char', (req, res) => {
  const { name, race, age, personality, goals, visual_description, relationship } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name is required to update a character' });
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

    // Update only provided fields
    if (race !== undefined) character.race = race;
    if (age !== undefined) character.age = Number(age);
    if (personality !== undefined) character.personality = personality;
    if (goals !== undefined) character.goals = goals;
    if (visual_description !== undefined) character.visual_description = visual_description;
    if (relationship !== undefined) character.relationship = relationship;

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save updated character' });
      res.status(200).json({ message: 'Character updated', character });
    });
  });
});

// Add a location via GET
app.get('/add_location', (req, res) => {
  const { name, visual_description, region, characters, type, notes ,factions} = req.query;

  // Only check for the required fields
  if (!name || !visual_description || !region || !type) {
    return res.status(400).json({ 
      error: 'Name, visual_description, region, and type are required'
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

    if (!Array.isArray(json.locations)) {
      json.locations = [];
    }

    const newLocation = { 
      name,
      visual_description,
      region,
      type,
      notes: notes || "", // optional, default to empty string if missing
      factions: factions || "",
      characters: characters ? characters.split(',').map(c => c.trim()) : [] // optional, default to empty list
    };

    json.locations.push(newLocation);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save location' });
      res.status(200).json({ message: 'Location added', location: newLocation });
    });
  });
});

// Get location by name via GET
app.get('/get_location', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required to get a location' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const locations = json.locations || [];
    const location = locations.find(l => l.name.toLowerCase() === name.toLowerCase());

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.status(200).json(location);
  });
});

// Update location attributes via GET
app.get('/update_location', (req, res) => {
  const { name, visual_description, region, type, notes, factions, characters } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required to update a location' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const locations = json.locations || [];
    const location = locations.find(l => l.name.toLowerCase() === name.toLowerCase());

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Update only provided fields
    if (visual_description !== undefined) location.visual_description = visual_description;
    if (region !== undefined) location.region = region;
    if (type !== undefined) location.type = type;
    if (notes !== undefined) location.notes = notes;
    if (factions !== undefined) location.factions = factions;
    if (characters !== undefined) {
      location.characters = characters.split(',').map(c => c.trim());
    }

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save updated location' });
      res.status(200).json({ message: 'Location updated', location });
    });
  });
});

// Locate a character (find all locations where they are)
app.get('/locate_character', (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name query parameter is required to locate a character' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

  const locations = json.locations || [];
  const foundLocations = [];

  for (const loc of locations) {
    // Make sure loc.characters is a valid array
    if (!Array.isArray(loc.characters)) { continue; }// Check if the character is in this location (case-insensitive)
    const characterExists = loc.characters.some(c => c.toLowerCase() === name.toLowerCase());
    if (characterExists) {
      foundLocations.push({
        name: loc.name,
        region: loc.region,
        type: loc.type
      });
    }
  }

    res.status(200).json({ 
      character: name,
      locations: foundLocations.map(loc => ({
        name: loc.name,
        region: loc.region,
        type: loc.type
      }))
    });
  });
});

// Move a character to a new location safely
app.get('/move_character', (req, res) => {
  const { name, destination } = req.query;

  if (!name || !destination) {
    return res.status(400).json({ error: 'Name and destination query parameters are required' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const locations = json.locations || [];

    // Step 1: Remove character from all locations
    for (const loc of locations) {
      if (Array.isArray(loc.characters)) {
        loc.characters = loc.characters.filter(c => c.toLowerCase() !== name.toLowerCase());
      }
    }

    // Step 2: Find the destination location
    const targetLocation = locations.find(loc => loc.name.toLowerCase() === destination.toLowerCase());

    if (!targetLocation) {
      return res.status(404).json({ error: 'Destination location not found' });
    }

    // Step 3: Add character to destination
    if (!Array.isArray(targetLocation.characters)) {
      targetLocation.characters = [];
    }

    targetLocation.characters.push(name);

    // Step 4: Save the updated data
    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save character movement' });
      res.status(200).json({ message: `Character '${name}' moved to '${destination}'` });
    });
  });
});

// Get list of all locations
app.get('/get_locations_list', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const locations = json.locations || [];
    const locationNames = locations.map(loc => loc.name);

    res.status(200).json({ locations: locationNames });
  });
});

// Get list of all characters
app.get('/get_characters_list', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const characters = json.characters || [];
    const characterNames = characters.map(c => c.name);

    res.status(200).json({ characters: characterNames });
  });
});

// Add a quest via GET
app.get('/add_quest', (req, res) => {
  const { title, description, status, locations, reward, notes } = req.query;

  if (!title || !description || !locations) {
    return res.status(400).json({ 
      error: 'Title, description, and locations are required'
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

    if (!Array.isArray(json.quests)) {
      json.quests = [];
    }

    // Check if quest with the same title already exists
    const existingQuest = json.quests.find(q => q.title.toLowerCase() === title.toLowerCase());
    if (existingQuest) {
      return res.status(400).json({ error: 'Quest with this title already exists' });
    }

    const newQuest = { 
      title,
      description,
      status: status || "available", // default to available
      locations: locations.split(',').map(l => l.trim()), // split into array
      reward: reward || "",
      notes: notes || ""
    };

    json.quests.push(newQuest);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save quest' });
      res.status(200).json({ message: 'Quest added', quest: newQuest });
    });
  });
});

// Add a scene via GET
app.get('/add_scene', (req, res) => {
  const { title, summary, locations, characters, notes } = req.query;

  if (!title || !locations || !summary || !characters) {
    return res.status(400).json({ 
      error: 'Title, summary, characters and locations are required'
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

    if (!Array.isArray(json.scenes)) {
      json.scenes = [];
    }

    // Check if scene with the same title already exists
    const existingScene = json.scenes.find(q => q.title.toLowerCase() === title.toLowerCase());
    if (existingScene) {
      return res.status(400).json({ error: 'Scene with this title already exists' });
    }

    const newScene = { 
      title,
      summary,
      locations: locations.split(',').map(l => l.trim()), // split into array
      characters: characters.split(',').map(l => l.trim()), // split into array
      notes: notes || ""
    };

    json.scenes.push(newScene);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save scene' });
      res.status(200).json({ message: 'Scene added', scene: newScene });
    });
  });
});


// Get a quest by title
app.get('/get_quest', (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title query parameter is required to get a quest' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const quests = json.quests || [];
    const quest = quests.find(q => q.title.toLowerCase() === title.toLowerCase());

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    res.status(200).json(quest);
  });
});

// Get a scene by title
app.get('/get_scene', (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title query parameter is required to get a scene' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const scenes = json.scenes || [];
    const scene = scenes.find(q => q.title.toLowerCase() === title.toLowerCase());

    if (!scene) {
      return res.status(404).json({ error: 'scene not found' });
    }

    res.status(200).json(scene);
  });
});


// Update quest attributes via GET
app.get('/update_quest', (req, res) => {
  const { title, description, status, locations, reward, notes } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title query parameter is required to update a quest' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const quests = json.quests || [];
    const quest = quests.find(q => q.title.toLowerCase() === title.toLowerCase());

    if (!quest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    // Update only provided fields
    if (description !== undefined) quest.description = description;
    if (status !== undefined) quest.status = status;
    if (locations !== undefined) quest.locations = locations.split(',').map(l => l.trim());
    if (reward !== undefined) quest.reward = reward;
    if (notes !== undefined) quest.notes = notes;

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save updated quest' });
      res.status(200).json({ message: 'Quest updated', quest });
    });
  });
});

// Update scene attributes via GET
app.get('/update_scene', (req, res) => {
  const { title, summary, locations, characters, notes } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title query parameter is required to update a scene' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const scenes = json.scenes || [];
    const scene = scenes.find(q => q.title.toLowerCase() === title.toLowerCase());

    if (!scene) {
      return res.status(404).json({ error: 'scene not found' });
    }

    // Update only provided fields
    if (summary !== undefined) scene.summary = summary;
    if (locations !== undefined) scene.locations = locations.split(',').map(l => l.trim());
    if (characters !== undefined) scene.characters = characters.split(',').map(l => l.trim());    
    if (notes !== undefined) scene.notes = notes;

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save updated scene' });
      res.status(200).json({ message: 'scene updated', scene });
    });
  });
});


// Get list of all quests
app.get('/get_quests_list', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const quests = json.quests || [];
    const questTitles = quests.map(q => q.title);

    res.status(200).json({ quests: questTitles });
  });
});

// Get list of all scenes
app.get('/get_scenes_list', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    const scenes = json.scenes || [];
    const scenesTitles = scenes.map(q => q.title);

    res.status(200).json({ scenes: scenesTitles });
  });
});

// Create a new character sheet via POST
// app.post('/make_sheet', (req, res) => {
//   const {
//     name,
//     race,
//     class: charClass,
//     background,
//     abilities   = {},          // default to empty objects so we can merge defaults
//     proficiencies = {},
//     equipment,
//     misc = {}
//   } = req.body;

//   // —— basic validation ——
//   if (!name || !race || !charClass || !background) {
//     return res.status(400).json({
//       error: 'name, race, class, and background are required'
//     });
//   }

//   // fill in any missing ability scores with 0
//   const defaultScores = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
//   const finalAbilities = { ...defaultScores, ...abilities };

//   // default empty arrays for each prof list
//   const defaultProfs = {
//     armor: [],
//     weapons: [],
//     savingThrows: [],
//     skills: [],
//     expertise: []
//   };
//   const finalProfs = Object.fromEntries(
//     Object.keys(defaultProfs).map(k => [k, proficiencies[k] || defaultProfs[k]])
//   );

//   const newSheet = {
//     name,
//     race,
//     class: charClass,
//     background,
//     HP: 0,
//     AC: 10,
//     xp: 0,
//     abilities: finalAbilities,
//     proficiencies: finalProfs,
//     known_spells: [],
//     prepard_spells: [],
//     features: [],
//     equipment: [],
//     misc: {
//       wealth: { gold: 0 },
//       titles: [],
//       achievements: []
//     }
//   };

//   // —— read, update, write the file ——
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err && err.code !== 'ENOENT')
//       return res.status(500).json({ error: 'Failed to read file' });

//     let json = {};
//     if (data) {
//       try { json = JSON.parse(data); } 
//       catch { return res.status(500).json({ error: 'Bad JSON in file' }); }
//     }

//     json.sheet = newSheet;

//     fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', err2 => {
//       if (err2) return res.status(500).json({ error: 'Failed to save sheet' });
//       res.status(201).json({ message: 'Character sheet created', sheet: newSheet });
//     });
//   });
// });

// Create a new blank character sheet via GET
app.get('/make_sheet', (req, res) => {

  // default empty arrays for each prof list
  const defaultProfs = {
    armor: [],
    weapons: [],
    savingThrows: [],
    skills: [],
    expertise: []
  };

  const newSheet = {
    name: "",
    race : "",
    class: "",
    background: "",
    HP: 0,
    AC: 10,
    xp: 0,
    abilities: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
    proficiencies: defaultProfs,
    known_spells: [],
    prepard_spells: [],
    features: [],
    equipment: [],
    misc: {
      gold: 0 ,
      titles: [],
      achievements: []
    }
  };

  // —— read, update, write the file ——
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT')
      return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    if (data) {
      try { json = JSON.parse(data); } 
      catch { return res.status(500).json({ error: 'Bad JSON in file' }); }
    }

    json.sheet = newSheet;

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', err2 => {
      if (err2) return res.status(500).json({ error: 'Failed to save sheet' });
      res.status(201).json({ message: 'Character sheet created', sheet: newSheet });
    });
  });
});

// Get character sheet
app.get('/get_sheet', (req, res) => {

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    try {
      json = JSON.parse(data || '{}');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Invalid JSON format' });
    }

    if (!json.sheet) {
    return res.status(400).json({ error: 'Name query parameter is required to get a sheet' });
    }

    res.status(200).json(json.sheet);
  });
});


// helper ---------------------------------------------------------------
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object'
    ) {
      deepMerge(target[key], source[key]);
    } else {
      // arrays and primitives just overwrite
      target[key] = source[key];
    }
  }
  return target;
}

// PATCH /sheet  --------------------------------------------------------
app.patch('/update_sheet', (req, res) => {
  const updates = req.body;           // anything the client wants to change

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT')
      return res.status(500).json({ error: 'Failed to read file' });

    let json = {};
    if (data) {
      try { json = JSON.parse(data); }
      catch { return res.status(500).json({ error: 'Corrupted JSON on disk' }); }
    }

    if (!json.sheet) {
      return res.status(404).json({ error: 'No character sheet found—create one first' });
    }

    // ---- merge incoming updates ----
    deepMerge(json.sheet, updates);

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', err2 => {
      if (err2)
        return res.status(500).json({ error: 'Failed to write updated sheet' });

      res.status(200).json({ message: 'Sheet updated', sheet: json.sheet });
    });
  });
});


// helper to go into an object safely by path
function getNested(obj, path) {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys.slice(0, -1)) {   // all except last
    if (!current[key]) return undefined;
    current = current[key];
  }
  return { parent: current, key: keys[keys.length - 1] };
}

// DELETE /sheet/remove  --------------------------------------------------------
app.post('/remove_from_sheet', (req, res) => {
  console.log('Incoming POST /sheet/remove', req.body);

  const { path, value } = req.body;

  if (!path || typeof path !== 'string') {
    return res.status(200).json({ success: false, error: 'A valid "path" string is required' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Read file error', err);
      return res.status(200).json({ success: false, error: 'Failed to read file' });
    }

    let json = {};
    if (data) {
      try {
        json = JSON.parse(data);
      } catch (parseErr) {
        console.error('JSON parse error', parseErr);
        return res.status(200).json({ success: false, error: 'Corrupted JSON on disk' });
      }
    }

    if (!json.sheet) {
      return res.status(200).json({ success: false, error: 'No character sheet found' });
    }

    const target = getNested(json.sheet, path);

    if (!target || !target.parent) {
      return res.status(200).json({ success: false, error: 'Invalid path' });
    }

    const { parent, key } = target;

    if (!(key in parent)) {
      return res.status(200).json({ success: false, error: `No such field: ${key}` });
    }

    // ----- remove the item -----
    if (Array.isArray(parent[key]) && value !== undefined) {
      parent[key] = parent[key].filter(item => item !== value);
    } else {
      delete parent[key];
    }

    fs.writeFile(filePath, JSON.stringify(json, null, 2), 'utf8', err2 => {
      if (err2) {
        console.error('Write file error', err2);
        return res.status(200).json({ success: false, error: 'Failed to update sheet' });
      }

      console.log('Sheet successfully updated');
      res.status(200).json({ success: true, message: 'Field/value removed', sheet: json.sheet });
    });
  });
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
