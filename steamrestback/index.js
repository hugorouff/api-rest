import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('./apidatabase.db');

const app = express()
const port = 8080

app.use(cors({
    origin: 'http://localhost:5173',
}))
app.use(express.json())

const camelKey = (k) => {
    const s = k.replace(/ID$/, 'Id');
    return s.charAt(0).toLowerCase() + s.slice(1);
};
const camel = (row) => {
    if (!row) return row;
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [camelKey(k), v]));
};

const getBiblio = (idUser, jeuId) =>
    camel(database
        .prepare('SELECT rowid AS bibliothequeId, * FROM bibliothequejeux WHERE UtilisateurID = ? AND JeuID = ?')
        .get(idUser, jeuId));

app.get('/jeux', (req, res) => {
    res.json(database.prepare('SELECT * FROM jeux').all().map(camel));
});

app.get('/jeux/:id', (req, res) => {
    const jeu = database.prepare('SELECT * FROM jeux WHERE JeuID = ?').get(req.params.id);
    if (jeu) {
        res.json(camel(jeu));
    } else {
        res.status(404).json({ error: 'Jeu non trouvé' });
    }
});

app.get('/utilisateurs', (req, res) => {
    res.json(database.prepare('SELECT * FROM utilisateurs').all().map(camel));
});

app.get('/utilisateurs/:id', (req, res) => {
    const utilisateur = database.prepare('SELECT * FROM utilisateurs WHERE UtilisateurID = ?').get(req.params.id);
    if (utilisateur) {
        res.json(camel(utilisateur));
    } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
});

app.get('/utilisateurs/:idUser/bibliothequejeux', (req, res) => {
    const utilisateur = database
        .prepare('SELECT 1 FROM utilisateurs WHERE UtilisateurID = ?')
        .get(req.params.idUser);
    if (!utilisateur) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const bibliotheque = database
        .prepare('SELECT rowid AS bibliothequeId, * FROM bibliothequejeux WHERE UtilisateurID = ?')
        .all(req.params.idUser);
    res.json(bibliotheque.map(camel));
});

app.delete('/utilisateurs/:idUser/bibliothequejeux/:jeuId', (req, res) => {
    const { idUser, jeuId } = req.params;
    const entree = getBiblio(idUser, jeuId);
    if (!entree) {
        return res.status(404).json({ error: 'Jeu non présent dans la bibliothèque' });
    }
    database
        .prepare('DELETE FROM bibliothequejeux WHERE UtilisateurID = ? AND JeuID = ?')
        .run(idUser, jeuId);
    res.json(entree);
});

app.put('/utilisateurs/:idUser/bibliothequejeux/:jeuId', (req, res) => {
    const { idUser, jeuId } = req.params;
    const { estInstalle } = req.body ?? {};
    if (typeof estInstalle !== 'boolean') {
        return res.status(400).json({ error: 'estInstalle (booléen) est requis' });
    }
    if (!getBiblio(idUser, jeuId)) {
        return res.status(404).json({ error: 'Jeu non présent dans la bibliothèque' });
    }
    database
        .prepare('UPDATE bibliothequejeux SET EstInstalle = ? WHERE UtilisateurID = ? AND JeuID = ?')
        .run(estInstalle ? 1 : 0, idUser, jeuId);
    res.json(getBiblio(idUser, jeuId));
});

app.post('/achats', (req, res) => {
    const { JeuID, UtilisateurID } = req.body ?? {};
    if (!JeuID || !UtilisateurID) {
        return res.status(400).json({ error: 'JeuID et UtilisateurID sont requis' });
    }
    if (!database.prepare('SELECT 1 FROM utilisateurs WHERE UtilisateurID = ?').get(UtilisateurID)) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    if (!database.prepare('SELECT 1 FROM jeux WHERE JeuID = ?').get(JeuID)) {
        return res.status(404).json({ error: 'Jeu non trouvé' });
    }
    if (getBiblio(UtilisateurID, JeuID)) {
        return res.status(409).json({ error: 'Jeu déjà possédé par cet utilisateur' });
    }

    try {
        database.exec('BEGIN');
        const achat = database
            .prepare('INSERT INTO achats (UtilisateurID, JeuID) VALUES (?, ?)')
            .run(UtilisateurID, JeuID);
        database
            .prepare('INSERT INTO bibliothequejeux (UtilisateurID, JeuID) VALUES (?, ?)')
            .run(UtilisateurID, JeuID);
        database.exec('COMMIT');
        res.status(201).json({
            achatId: Number(achat.lastInsertRowid),
            utilisateurId: UtilisateurID,
            jeuId: JeuID
        });
    } catch (error) {
        database.exec('ROLLBACK');
        res.status(500).json({ error: 'Erreur lors de l\'achat : ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`L'API Steam écoute sur le port ${port}`)
});