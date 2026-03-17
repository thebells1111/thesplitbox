<script>
  import { onMount } from "svelte";
  import Login from "./Login.svelte";
  import Dashboard from "./Dashboard.svelte";
  import { remoteServer } from "$lib/state.svelte.js";
  let isAuthenticated = false;
  let isLoading = true;

  onMount(async () => {
    try {
      // We hit the /admin/users (or any protected route) to verify the token
      const response = await fetch(`${remoteServer}/admin/users`, {
        method: "GET",
        credentials: "include", // Crucial for sending the JWT cookie
      });

      if (response.ok) {
        isAuthenticated = true;
      } else {
        isAuthenticated = false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      isAuthenticated = false;
    } finally {
      isLoading = false;
    }
  });

  function handleLoginSuccess() {
    isAuthenticated = true;
  }
</script>

{#if isLoading}
  <p>Checking authentication...</p>
{:else if !isAuthenticated}
  <Login on:success={handleLoginSuccess} />
{:else}
  <Dashboard />
{/if}

<style>
  main {
    padding: 2rem;
    font-family: sans-serif;
  }
</style>
