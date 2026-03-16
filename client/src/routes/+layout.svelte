<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import { user, remoteServer } from "$lib/state.svelte.js";
</script>

<slot />

<style>
  ul {
    display: flex;
    justify-content: flex-start;
  }

  li {
    list-style: none;
  }
</style>
