import { writable } from 'svelte/store';
import { navigate } from 'svelte-routing';
import { API_URL } from '../config';

export interface Session {
    token: string;
    utilisateurId: number;
    nomUtilisateur: string;
    role: string;
}

function chargerSession(): Session | null {
    try {
        const brut = localStorage.getItem('session');
        return brut ? JSON.parse(brut) : null;
    } catch {
        return null;
    }
}

// Store réactif : les composants peuvent afficher "connecté / déconnecté"
export const session = writable<Session | null>(chargerSession());

export function ouvrirSession(s: Session) {
    localStorage.setItem('session', JSON.stringify(s));
    session.set(s);
}

export function fermerSession() {
    localStorage.removeItem('session');
    session.set(null);
}

// fetch qui ajoute automatiquement le token JWT ; si le serveur répond 401, on renvoie vers la connexion
export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const s = chargerSession();
    const response = await fetch(API_URL + path, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
            ...(s ? { Authorization: `Bearer ${s.token}` } : {})
        }
    });
    if (response.status === 401) {
        fermerSession();
        navigate('/connexion');
    }
    return response;
}
