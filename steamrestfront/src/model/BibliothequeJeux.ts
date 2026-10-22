import type { Jeu } from "./Jeu";

export interface BibliothequeJeux {
    bibliothequeId: number; // Primary key
    utilisateurId: number; // Foreign key referencing Utilisateurs
    jeuId: number; // Foreign key referencing Jeux
    jeu: Jeu;
    heuresJeu: number; // Default is 0
    estInstalle: boolean; // Default is false
}
