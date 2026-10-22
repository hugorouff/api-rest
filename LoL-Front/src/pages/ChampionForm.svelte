<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { API_URL } from "../config";

    export let id = undefined;
    let name = "";
    let image = "";
    let error = "";

    onMount(async () => {
        if (id) {
            const response = await fetch(`${API_URL}/champions/${id}`);
            if (!response.ok) {
                error = "Champion introuvable.";
                return;
            }
            const champion = await response.json();
            name = champion.name;
            image = champion.image_url; // corrigé : image_url (et pas image)
        }
    });

    async function saveChampion() {
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_URL}/champions/${id}` : `${API_URL}/champions`;

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, image })
        });

        if (!response.ok) {
            error = `Erreur ${response.status} : enregistrement impossible.`;
            return;
        }

        navigate("/gerer-champions");
    }
</script>

<main>
    <h1>{id ? "Modifier" : "Ajouter"} un Champion</h1>
    <form on:submit|preventDefault={saveChampion}>
        <input type="text" bind:value={name} placeholder="Nom du champion" required />
        <input type="text" bind:value={image} placeholder="URL de l'image" required />
        <button type="submit">{id ? "Modifier" : "Ajouter"}</button>
    </form>

    {#if error}
        <p class="error">{error}</p>
    {/if}
</main>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }
    button {
        background-color: blue;
        color: white;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
    }
    .error {
        color: crimson;
    }
</style>