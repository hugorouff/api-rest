<script lang="ts">
    import { navigate } from 'svelte-routing';
    import { API_URL } from '../config';
    import { ouvrirSession } from './auth';

    let nomUtilisateur = '';
    let motDePasse = '';
    let modeInscription = false;
    let erreur = '';

    async function seConnecter() {
        const res = await fetch(API_URL + '/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomUtilisateur, motDePasse })
        });
        const data = await res.json();
        if (!res.ok) {
            erreur = data.error;
            return;
        }
        ouvrirSession({ token: data.token, ...data.utilisateur });
        navigate('/');
    }

    async function sInscrire() {
        const res = await fetch(API_URL + '/utilisateurs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomUtilisateur, motDePasse })
        });
        const data = await res.json();
        if (!res.ok) {
            erreur = data.error;
            return;
        }
        await seConnecter(); // connexion automatique après l'inscription
    }

    function valider() {
        erreur = '';
        return modeInscription ? sInscrire() : seConnecter();
    }
</script>

<div class="page-title">{modeInscription ? 'Inscription' : 'Connexion'}</div>
<div class="formulaire">
    <input placeholder="Nom d'utilisateur" bind:value={nomUtilisateur} />
    <input type="password" placeholder="Mot de passe (8 caractères minimum)" bind:value={motDePasse} />
    <button on:click={valider}>{modeInscription ? "S'inscrire" : 'Se connecter'}</button>
    <button class="lien" on:click={() => { modeInscription = !modeInscription; erreur = ''; }}>
        {modeInscription ? 'J\'ai déjà un compte' : 'Créer un compte'}
    </button>
    {#if erreur}<span class="erreur">{erreur}</span>{/if}
</div>

<style>
    .formulaire {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin: 2rem;
    }
    input {
        padding: 10px;
        width: 20rem;
        border-radius: 5px;
        border: none;
    }
    button {
        background-color: #515969;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        width: 20rem;
    }
    .lien { background: transparent; text-decoration: underline; }
    .erreur { color: #cc4d4d; }
</style>
