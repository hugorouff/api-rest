<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { API_URL } from "../config";

    let champions = [];
    let error = "";

    async function loadChampions() {
        const response = await fetch(`${API_URL}/champions`);
        const data = await response.json();
        champions = data.champions;
    }

    async function deleteChampion(champion) {
        if (!confirm(`Supprimer ${champion.name} ?`)) return;

        const response = await fetch(`${API_URL}/champions/${champion.id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // 204 : pas de contenu à lire, on retire juste le champion de la liste
            champions = champions.filter((c) => c.id !== champion.id);
            error = "";
        } else {
            error = `Impossible de supprimer ${champion.name}.`;
        }
    }

    onMount(loadChampions);
</script>

<main>
    <h1>Gérer les Champions</h1>

    <button class="add" on:click={() => navigate("/champion-form")}>
        + Ajouter un champion
    </button>

    {#if error}
        <p class="error">{error}</p>
    {/if}

    <table>
        <thead>
            <tr>
                <th>Image</th>
                <th>Nom</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each champions as champion (champion.id)}
                <tr>
                    <td><img src={champion.image_url} alt={champion.name} /></td>
                    <td>{champion.name}</td>
                    <td class="actions">
                        <button class="edit" on:click={() => navigate(`/champion-form/${champion.id}`)}>
                            Modifier
                        </button>
                        <button class="delete" on:click={() => deleteChampion(champion)}>
                            Supprimer
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</main>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    th, td {
        padding: 8px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }
    img {
        width: 50px;
        height: 50px;
    }
    .actions {
        display: flex;
        gap: 8px;
    }
    button {
        border: none;
        color: white;
        padding: 6px 12px;
        cursor: pointer;
    }
    .add { background-color: green; }
    .edit { background-color: blue; }
    .delete { background-color: crimson; }
    .error { color: crimson; }
</style>