<script>
    import { remoteServer } from "$lib/state.svelte.js";

    let eventName = "";
    let statusMessage = "";
    let isLoading = false;

    async function handleCreate() {
        if (!eventName.trim()) {
            statusMessage = "Please enter a name.";
            return;
        }

        isLoading = true;
        statusMessage = "Creating...";

        try {
            // Constructs: ${remoteServer}/admin/events/create?name=YourName
            const response = await fetch(
                `${remoteServer}/admin/events/create?name=${encodeURIComponent(eventName)}`,
                {
                    method: "GET",
                    // This is the essential line for cookies to work
                    credentials: "include",
                },
            );

            const data = (await response.json())?.event;

            if (response.ok) {
                statusMessage = `Success! Event created with GUID: ${data.guid}`;
                eventName = ""; // Clear input
            } else {
                statusMessage = `Error: ${data.error || "Failed to create event."}`;
            }
        } catch (err) {
            statusMessage = "Connection error. Is the server running?";
            console.error(err);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="card">
    <h2>Create New Event</h2>

    <div class="input-group">
        <input
            type="text"
            bind:value={eventName}
            placeholder="Event Name (e.g. Summer Bash)"
            disabled={isLoading}
        />
        <button on:click={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
        </button>
    </div>

    {#if statusMessage}
        <p class="status">{statusMessage}</p>
    {/if}
</div>

<style>
    .card {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        max-width: 400px;
        font-family: sans-serif;
    }
    .input-group {
        display: flex;
        gap: 10px;
    }
    input {
        flex: 1;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        padding: 8px 16px;
        background-color: #ff3e00;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:disabled {
        background-color: #ccc;
    }
    .status {
        margin-top: 15px;
        font-size: 0.9rem;
        color: #555;
    }
</style>
