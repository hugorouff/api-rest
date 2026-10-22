INSERT INTO champions (name, image_url) VALUES
('Ahri', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Ahri.png'),
('Yasuo', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Yasuo.png'),
('Lee Sin', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/LeeSin.png'),
('Lux', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Lux.png'),
('Ezreal', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Ezreal.png'),
('Jinx', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Jinx.png'),
('Garen', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Garen.png'),
('Thresh', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Thresh.png'),
('Zed', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Zed.png'),
('Akali', 'https://ddragon.leagueoflegends.com/cdn/12.23.1/img/champion/Akali.png');


INSERT INTO players (name, division) VALUES
('Faker', 'Challenger'),
('Cabochard', 'Challenger'),
('Thebausffs', 'Grandmaster'),
('ChapGG', 'Master'),
('ProGamerDu81', 'Iron');

INSERT INTO matches (player_id, champion_id, is_won, match_date) VALUES
(1, 1, 1, '2025-02-01 15:00:00'),  -- Player1 joue Ahri
(2, 5, 1, '2025-02-02 17:30:00'),  -- Player2 joue Ezreal
(3, 3, 1, '2025-02-03 19:00:00'),  -- Player3 joue Lee Sin
(4, 7, 0, '2025-02-04 21:15:00'),  -- Player4 joue Garen
(5, 2, 0, '2025-02-05 18:45:00'),  -- Player5 joue Yasuo
(1, 6, 1, '2025-02-06 16:30:00'),  -- Player1 joue Jinx
(2, 4, 0, '2025-02-07 20:00:00'),  -- Player2 joue Lux
(3, 8, 1, '2025-02-08 14:00:00'),  -- Player3 joue Thresh
(4, 9, 0, '2025-02-09 22:00:00'),  -- Player4 joue Zed
(5, 10, 0, '2025-02-10 12:30:00'); -- Player5 joue Akali