import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import cors from 'cors';

const database = new DatabaseSync('./apidatabase.db');

const app = express()
const port = 8080

let corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/champions', (req, res) => {
    const query = database.prepare('SELECT * FROM champions');
    res.json({
        champions: query.all()
    });
})

app.get('/champions/:idChampion', (req, res) => {
    const id = Number(req.params.idChampion)
    const query = database.prepare('SELECT * FROM champions WHERE id = ?');
    const championFromDb = query.get(id);

    if (!championFromDb) {
        return res.status(404).json({ error: 'Champion introuvable' });
    }

    res.json(championFromDb);
})

app.post('/champions', (req, res) => {
    if (!req.body.name || !req.body.image) {
        return res.status(400).json({ error: 'name et image sont obligatoires' });
    }

    const query = database.prepare('INSERT INTO champions (name, image_url) VALUES (?, ?)')
    const insertedId = query.run(req.body.name, req.body.image).lastInsertRowid;
    const queryGet = database.prepare('SELECT * FROM champions WHERE id = ?');
    const championFromDb = queryGet.get(insertedId);

    res.status(201).json(championFromDb);
})

app.put('/champions/:idChampion', (req, res) => {
    const id = Number(req.params.idChampion)

    const queryGet = database.prepare('SELECT * FROM champions WHERE id = ?');
    const existing = queryGet.get(id);
    if (!existing) {
        return res.status(404).json({ error: 'Champion introuvable' });
    }

    const name = req.body.name ?? existing.name;
    const image = req.body.image ?? existing.image_url;

    const query = database.prepare('UPDATE champions SET name = ?, image_url = ? WHERE id = ?');
    query.run(name, image, id);

    res.json(queryGet.get(id));
})

app.delete('/champions/:idChampion', (req, res) => {
    const id = Number(req.params.idChampion)

    const query = database.prepare('DELETE FROM champions WHERE id = ?');
    const result = query.run(id);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'Champion introuvable' });
    }

    res.status(204).send();
})

app.listen(port, () => {
    console.log(`Mon API LoL maison écoute sur le port ${port}`)
})