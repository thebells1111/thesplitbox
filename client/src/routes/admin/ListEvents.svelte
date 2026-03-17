<script>
    import { onMount } from "svelte";
    import { remoteServer } from "$lib/state.svelte.js";

    let events = $state([]);
    let selectedGuid = $state(""); // Tracks the dropdown value
    let selectedEvent = $state(null);
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

<div class="event-manager">
    <h2>Event Manager</h2>

    {#if statusMessage}
        <p class="error">{statusMessage}</p>
    {:else if isLoading}
        <p>Loading database...</p>
    {:else}
        <div class="controls">
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

        <hr />

        <div class="content-area">
            {#if selectedEvent}
                <div class="event-details">
                    <h3>Editing: {selectedEvent.name}</h3>
                    <div class="meta">
                        <code>ID: {selectedEvent.guid}</code>
                    </div>

                    <div class="stats">
                        <div class="stat-pill">
                            Blocks: {selectedEvent.blocks.length}
                        </div>
                        <div class="stat-pill">
                            Values: {selectedEvent.valueBlock.length}
                        </div>
                    </div>

                    <div class="placeholder-editor">
                        <p>Data editor loading...</p>
                    </div>
                </div>
            {:else}
                <p class="empty-hint">
                    Select an event from the menu above to view or edit data.
                </p>
            {/if}
        </div>
    {/if}
</div>

<style>
    .event-manager {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 12px;
        background: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .controls {
        display: flex;
        gap: 10px;
        margin-bottom: 1.5rem;
    }

    select {
        flex: 1;
        padding: 10px;
        border-radius: 6px;
        border: 1px solid #ccc;
        font-size: 1rem;
    }

    .btn-delete {
        background: #ff4d4d;
        color: white;
        border: none;
        padding: 0 15px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
    }

    .btn-delete:hover {
        background: #e60000;
    }

    .event-details {
        padding: 1rem;
        background: #fcfcfc;
        border-radius: 8px;
    }

    .meta {
        margin-bottom: 1rem;
        font-size: 0.8rem;
        color: #666;
    }

    .stats {
        display: flex;
        gap: 10px;
    }

    .stat-pill {
        background: #eee;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        color: #444;
    }

    .empty-hint {
        text-align: center;
        color: #999;
        padding: 3rem 0;
        font-style: italic;
    }

    .error {
        color: #d00;
        font-weight: bold;
    }
    hr {
        border: 0;
        border-top: 1px solid #eee;
        margin: 1.5rem 0;
    }
</style>
