export interface Jeu {
    jeuId: number;
    titre: string;
    developpeur: string;
    editeur: string;
    dateSortie?: Date;
    image: string;
    prix: number;
}
