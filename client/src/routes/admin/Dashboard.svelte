<script>
  import { untrack } from "svelte";
  import CreateEvent from "./CreateEvent.svelte";
  import ListEvents from "./ListEvents.svelte";
  import EventEditor from "./EventEditor.svelte";
  import SaveButton from "./SaveButton.svelte";
  import { remoteServer } from "$lib/state.svelte.js";

  let selectedEvent = $state(null);
  let isSaving = $state(false);

  // Stores the original version to check for changes
  let baseline = $state("");

  // Reactive "Dirty" check
  let isDirty = $derived(
    selectedEvent && JSON.stringify(selectedEvent) !== baseline,
  );

  // When a new event is selected, set the new baseline
  $effect(() => {
    if (selectedEvent?.guid) {
      untrack(() => {
        baseline = JSON.stringify(selectedEvent);
      });
    }
  });

  // Global Navigation Guard
  $effect(() => {
    const handleUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  });

  async function handleSave() {
    if (!isDirty || isSaving) return;
    isSaving = true;
    try {
      const res = await fetch(`${remoteServer}/admin/events/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(selectedEvent),
      });
      if (res.ok) {
        baseline = JSON.stringify(selectedEvent);
      } else {
        alert("Save failed. Check server connection.");
      }
    } finally {
      isSaving = false;
    }
  }

  function handleRevert() {
    if (confirm("Discard all unsaved changes?")) {
      selectedEvent = JSON.parse(baseline);
    }
  }
</script>

<header>
  <div class="col">
    <CreateEvent />
  </div>
  <div class="col">
    <div class="toolbar">
      <ListEvents bind:selectedEvent />
    </div>
  </div>
</header>

<main>
  {#if selectedEvent}
    <EventEditor bind:event={selectedEvent} />
  {:else}
    <div class="empty-state">
      <p>Select an event from the menu above to start editing.</p>
    </div>
  {/if}
</main>

<SaveButton {isDirty} {isSaving} onSave={handleSave} onRevert={handleRevert} />

<style>
  header {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: end;
    padding: 20px;
    background: #fdfdfd;
    border-bottom: 1px solid #eee;
    margin-bottom: 2rem;
  }

  .col {
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  /* Ensure the ListEvents dropdown takes the remaining space in the toolbar */
  .toolbar :global(select) {
    flex: 1;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .empty-state {
    text-align: center;
    padding: 5rem;
    color: #999;
    border: 2px dashed #eee;
    border-radius: 12px;
  }
</style>
