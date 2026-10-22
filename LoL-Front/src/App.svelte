<script>
  import { Router, Route, Link } from "svelte-routing";
  import Home from "./pages/Home.svelte";
  import ChampionForm from "./pages/ChampionForm.svelte";
  import ManageChampions from "./pages/ManageChampions.svelte";
  // import Players from "./pages/Players.svelte";
  export let url = "";
</script>

<main>
  <Router {url}>
      <nav>
        <Link to="/">Champions</Link>
        <Link to="/gerer-champions">Gérer Champions</Link>
        <Link to="/players">Joueurs</Link>
      </nav>
      <div>
        <Route path="/"><Home/></Route>
        <Route path="/gerer-champions" component={ManageChampions} />
        <Route path="/champion-form/:id" let:params>
            <ChampionForm id="{params.id}" />
        </Route>
        <Route path="/champion-form" component={ChampionForm} />
        <!-- <Route path="/players" component={Players} /> -->
      </div>
  </Router>
</main>

<style>
  nav {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
</style>