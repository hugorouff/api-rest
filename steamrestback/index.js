import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
const database = new DatabaseSync('./apidatabase.db');

const app = express()
const port = 8080

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret-de-dev-a-remplacer';
if (!process.env.JWT_SECRET) {
    console.warn('/!\\ JWT_SECRET absent : secret de développement utilisé');
}

// Middlewares
app.use(cors({
    origin: 'http://localhost:5173',
}))
app.use(express.json())

const colonnes = database.prepare('PRAGMA table_info(Utilisateurs)').all().map(c => c.name.toLowerCase());
if (!colonnes.includes('motdepasse')) {
    database.exec('ALTER TABLE Utilisateurs ADD COLUMN MotDePasse TEXT');
}
if (!colonnes.includes('role')) {
    database.exec("ALTER TABLE Utilisateurs ADD COLUMN Role TEXT NOT NULL DEFAULT 'utilisateur'");
    database.exec("UPDATE Utilisateurs SET Role = 'admin' WHERE UtilisateurID = 1"); // Alice = admin (démo)
}
const hashDemo = bcrypt.hashSync('password123', 10);
database.prepare('UPDATE Utilisateurs SET MotDePasse = ? WHERE MotDePasse IS NULL').run(hashDemo);

const camelKey = (k) => {
    const s = k.replace(/ID$/, 'Id');
    return s.charAt(0).toLowerCase() + s.slice(1);
};
const camel = (row) => {
    if (!row) return row;
    return Object.fromEntries(Object.entries(row).map(([k, v]) => [camelKey(k), v]));
};

const COLONNES_USER = 'UtilisateurID, NomUtilisateur, Email, DateInscription, Role';

const getBiblio = (idUser, jeuId) =>
    camel(database
        .prepare('SELECT rowid AS bibliothequeId, * FROM bibliothequejeux WHERE UtilisateurID = ? AND JeuID = ?')
        .get(idUser, jeuId));

const authentifier = (req, res, next) => {
    const entete = req.headers.authorization ?? '';
    const [type, token] = entete.split(' ');
    if (type !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentification requise' });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide ou expiré' });
    }
};

const proprietaireOuAdmin = (param) => (req, res, next) => {
    if (req.user.role === 'admin' || req.user.id === Number(req.params[param])) {
        return next();
    }
    res.status(403).json({ error: 'Accès interdit' });
};

// Réservé aux administrateurs (bonus 2)
const exigerAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Réservé aux administrateurs' });
    }
    next();
};

app.post('/utilisateurs', (req, res) => {
    const { nomUtilisateur, motDePasse, email } = req.body ?? {};
    if (typeof nomUtilisateur !== 'string' || !nomUtilisateur.trim()) {
        return res.status(400).json({ error: 'nomUtilisateur requis' });
    }
    if (typeof motDePasse !== 'string' || motDePasse.length < 8) {
        return res.status(400).json({ error: 'motDePasse requis (8 caractères minimum)' });
    }
    const nom = nomUtilisateur.trim();
    const mail = (typeof email === 'string' && email.trim()) || `${nom}@steam.local`;

    try {
        const hash = bcrypt.hashSync(motDePasse, 10);
        const result = database
            .prepare("INSERT INTO utilisateurs (NomUtilisateur, Email, MotDePasse, Role) VALUES (?, ?, ?, 'utilisateur')")
            .run(nom, mail, hash);
        const cree = database
            .prepare(`SELECT ${COLONNES_USER} FROM utilisateurs WHERE UtilisateurID = ?`)
            .get(result.lastInsertRowid);
        res.status(201).json(camel(cree));
    } catch (error) {
        if (String(error.message).includes('UNIQUE')) {
            return res.status(409).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.post('/sessions', (req, res) => {
    const { nomUtilisateur, motDePasse } = req.body ?? {};
    if (typeof nomUtilisateur !== 'string' || typeof motDePasse !== 'string') {
        return res.status(400).json({ error: 'nomUtilisateur et motDePasse requis' });
    }
    const user = database
        .prepare('SELECT * FROM utilisateurs WHERE NomUtilisateur = ?')
        .get(nomUtilisateur);

    if (!user || !bcrypt.compareSync(motDePasse, user.MotDePasse)) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign(
        { id: user.UtilisateurID, nom: user.NomUtilisateur, role: user.Role },
        JWT_SECRET,
        { expiresIn: '2h' }
    );
    res.status(200).json({
        token,
        utilisateur: { utilisateurId: user.UtilisateurID, nomUtilisateur: user.NomUtilisateur, role: user.Role }
    });
});

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

app.post('/jeux', authentifier, exigerAdmin, (req, res) => {
    const { titre, developpeur, editeur, dateSortie, image, prix } = req.body ?? {};
    if (!titre || !developpeur || !editeur || !image || typeof prix !== 'number' || prix < 0) {
        return res.status(400).json({ error: 'titre, developpeur, editeur, image et prix (nombre >= 0) sont requis' });
    }
    const result = database
        .prepare('INSERT INTO jeux (Titre, Developpeur, Editeur, DateSortie, Image, Prix) VALUES (?, ?, ?, ?, ?, ?)')
        .run(titre, developpeur, editeur, dateSortie ?? null, image, prix);
    const jeu = database.prepare('SELECT * FROM jeux WHERE JeuID = ?').get(result.lastInsertRowid);
    res.status(201).json(camel(jeu));
});

app.get('/utilisateurs', authentifier, (req, res) => {
    const lignes = req.user.role === 'admin'
        ? database.prepare(`SELECT ${COLONNES_USER} FROM utilisateurs`).all()
        : database.prepare(`SELECT ${COLONNES_USER} FROM utilisateurs WHERE UtilisateurID = ?`).all(req.user.id);
    res.json(lignes.map(camel));
});

app.get('/utilisateurs/:id', authentifier, proprietaireOuAdmin('id'), (req, res) => {
    const utilisateur = database
        .prepare(`SELECT ${COLONNES_USER} FROM utilisateurs WHERE UtilisateurID = ?`)
        .get(req.params.id);
    if (utilisateur) {
        res.json(camel(utilisateur));
    } else {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
});

app.get('/utilisateurs/:idUser/bibliothequejeux', authentifier, proprietaireOuAdmin('idUser'), (req, res) => {
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

app.delete('/utilisateurs/:idUser/bibliothequejeux/:jeuId', authentifier, proprietaireOuAdmin('idUser'), (req, res) => {
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

app.put('/utilisateurs/:idUser/bibliothequejeux/:jeuId', authentifier, proprietaireOuAdmin('idUser'), (req, res) => {
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

app.post('/achats', authentifier, (req, res) => {
    const { JeuID, UtilisateurID } = req.body ?? {};
    if (!JeuID || !UtilisateurID) {
        return res.status(400).json({ error: 'JeuID et UtilisateurID sont requis' });
    }
    if (req.user.role !== 'admin' && req.user.id !== Number(UtilisateurID)) {
        return res.status(403).json({ error: 'Vous ne pouvez acheter que pour votre propre compte' });
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