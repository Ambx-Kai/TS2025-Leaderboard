import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const db = Database('./db/db.sqlite');
const port = 3000;

const createTable = () => {
  db.prepare(
    'CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, points INTEGER)'
  ).run();
};

createTable();

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/leads', (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads').all();

    const result = {
      message: 'Leads retrieved successfully',
      data: leads,
    };

    return res.status(200).json(result);
  } catch (e) {
    const result = {
      message: e.message,
    };

    return res.status(500).json(result);
  }
});

app.get('/leads/:name', (req, res) => {
  console.log(req.params.name);

  if (!req.params.name) {
    const result = {
      message: 'Name is required',
    };

    return res.status(404).json(result);
  }

  try {
    const result = db
      .prepare('SELECT * FROM leads WHERE name = ?')
      .get(req.params.name);

    return res.status(200).json(result);
  } catch (e) {
    const result = {
      message: e.message,
    };

    return res.status(500).json(result);
  }
});

app.post('/leads', (req, res) => {
  console.log(req.body);

  if (!req.body.name && !req.body.points) {
    const result = {
      message: 'Body is required',
    };

    return res.status(404).json(result);
  }

  try {
    db.prepare('INSERT INTO leads (name, points) VALUES (?, ?)').run(
      req.body.name,
      req.body.points
    );

    const result = {
      message: 'Lead created successfully',
    };

    return res.status(200).json(result);
  } catch (e) {
    const result = {
      message: e.message,
    };

    return res.status(500).json(result);
  }
});

app.put('/leads', (req, res) => {
  if (!req.body.name && !req.body.points) {
    const result = {
      message: 'Body is required',
    };

    return res.status(404).json(result);
  }
  try {
    const lead = db
      .prepare('SELECT * FROM leads WHERE name = ?')
      .get(req.body.name);

    if (!lead) {
      const result = {
        message: 'Lead not found',
      };

      return res.status(404).json(result);
    }

    db.prepare('UPDATE leads SET points = ? WHERE name = ?').run(
      Number(lead.points) + Number(req.body.points),
      req.body.name
    );

    const result = {
      message: 'Lead updated successfully',
    };

    return res.status(200).json(result);
  } catch (e) {
    const result = {
      message: e.message,
    };

    return res.status(500).json(result);
  }
});

app.delete('/leads/:name', (req, res) => {
  if (!req.params.name) {
    const result = {
      message: 'Name is required',
    };

    return res.status(404).json(result);
  }

  try {
    db.prepare('DELETE FROM leads WHERE name = ?').run(req.params.name);

    const result = {
      message: 'Lead deleted successfully',
    };

    return res.status(200).json(result);
  } catch (e) {
    const result = {
      message: e.message,
    };

    return res.status(500).json(result);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
