<script lang="ts">
  import { Router, Link, Route } from 'svelte-routing';
  import Magasin from './lib/Magasin.svelte';
  import Bibliotheque from './lib/Bibliotheque.svelte';
  import NotFound from './lib/NotFound.svelte';
  import Connexion from './lib/Connexion.svelte';
  import { session, fermerSession } from './lib/auth';

  export let url = '';
</script>


<Router {url} >

  <nav>
    <span id="logo">Steam</span>
    <!-- Change style if page is current page -->
    <span class="link"><Link to="/">MAGASIN</Link></span>
    <span class="link"><Link to="/bibliotheque">BIBLIOTHÈQUE</Link></span>
    <span class="link spacer">
      {#if $session}
        {$session.nomUtilisateur}{$session.role === 'admin' ? ' (admin)' : ''} —
        <a href="/connexion" on:click|preventDefault={() => { fermerSession(); location.href = '/connexion'; }}>DÉCONNEXION</a>
      {:else}
        <Link to="/connexion">CONNEXION</Link>
      {/if}
    </span>
  </nav>

  <main>
    <Route path="/" > <Magasin /> </Route>
    <Route path="/bibliotheque"> <Bibliotheque /> </Route>
    <Route path="/connexion"> <Connexion /> </Route>
    <Route component={NotFound} />
  </main>

</Router>


<style>
  #logo {
    font-size: 2em;
    font-weight: bold;
    color: #ffffff;
    margin-inline: 3rem;
  }

  nav {
    display: flex;
    align-items: center;
    background-color: #282c34;
    gap: 2rem;
    padding: 1rem;
  }

  .link {
    font-weight: 600;
  }

  .spacer {
    margin-left: auto;
    margin-right: 2rem;
  }

</style>
