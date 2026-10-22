<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { API_URL } from "../config";
    let champions = [];

    onMount(async () => {
        const response = await fetch(`${API_URL}/champions`);
        champions = await response.json();
        champions = champions['champions'];
    });
</script>

<main>
    <h1>Liste des Champions</h1>
    <div class="grid">
        {#each champions as champion}
            <div class="card" on:click={() => navigate(`/champion-form/${champion.id}`)}>
                <img src={champion.image_url} alt={champion.name} />
                <h2>{champion.name}</h2>
            </div>
        {/each}
    </div>
</main>

<style>
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}
.card {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
    cursor: pointer;
}
.card img {
    width: 100%;
    height: auto;
}
</style>
