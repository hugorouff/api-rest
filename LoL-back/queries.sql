DROP TABLE champions;
DROP TABLE players;
DROP TABLE matches;

CREATE TABLE champions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL
);

CREATE TABLE players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    division TEXT
);

CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    champion_id INTEGER NOT NULL,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_won INTEGER NOT NULL,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (champion_id) REFERENCES champions(id)
);



