<script>
  import { onMount } from "svelte";
  import { remoteServer } from "$lib/state.svelte.js";

  let { selectedEvent = $bindable(null) } = $props();
  let events = $state([]);
  let selectedGuid = $state(""); // Tracks the dropdown value
  let statusMessage = $state("");
  let isLoading = $state(true);

  // 1. Fetch the master list for the dropdown
  async function fetchEvents() {
    try {
      const response = await fetch(`${remoteServer}/admin/events/list`, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        events = await response.json();
      } else {
        statusMessage = "Session expired. Please log in.";
      }
    } catch (err) {
      statusMessage = "Server connection failed.";
    } finally {
      isLoading = false;
    }
  }

  // 2. Fetch details when dropdown changes
  async function handleSelection() {
    if (!selectedGuid) {
      selectedEvent = null;
      return;
    }

    try {
      const response = await fetch(
        `${remoteServer}/admin/events/list?guid=${selectedGuid}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (response.ok) {
        selectedEvent = await response.json();
      }
    } catch (err) {
      console.error("Error fetching event details:", err);
    }
  }

  // 3. Delete the currently selected event
  async function handleDelete() {
    if (!selectedGuid || !confirm("Permanently delete this event?")) return;

    try {
      const response = await fetch(
        `${remoteServer}/admin/events/delete?guid=${selectedGuid}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        // Reset the UI state
        events = events.filter((e) => e.guid !== selectedGuid);
        selectedGuid = "";
        selectedEvent = null;
      }
    } catch (err) {
      alert("Delete failed.");
    }
  }

  onMount(fetchEvents);
</script>

<div class="card">
  <h2>Event Manager</h2>

  {#if statusMessage}
    <p class="error">{statusMessage}</p>
  {:else if isLoading}
    <p>Loading database...</p>
  {:else}
    <div class="input-group">
      <select bind:value={selectedGuid} onchange={handleSelection}>
        <option value="">-- Select an Event --</option>
        {#each events as event}
          <option value={event.guid}>{event.name}</option>
        {/each}
      </select>

      {#if selectedGuid}
        <button class="btn-delete" onclick={handleDelete}>
          Delete Event
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .card {
    padding: 20px;
    margin: 0 4px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: sans-serif;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }

  .input-group {
    display: flex;
    gap: 10px;
  }

  select {
    flex: 1;
    padding: 8px;

    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .btn-delete {
    padding: 8px 16px;
    background-color: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-delete:hover {
    background: #e60000;
  }

  .error {
    color: #d00;
    font-weight: bold;
  }
</style>
