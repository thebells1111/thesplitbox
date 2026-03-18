<script>
  import AddBlock from "./AddBlock.svelte";

  let { event = $bindable() } = $props();

  function addNewBlock() {
    event.blocks.push("");
  }

  function removeBlock(index) {
    const blockName = event.blocks[index] || "this empty block";
    if (confirm(`Remove ${blockName}?`)) {
      event.blocks.splice(index, 1);
    }
  }
</script>

<div class="editor-card">
  <div class="field">
    <label>Event Name</label>
    <input type="text" bind:value={event.name} />
  </div>

  <div class="field">
    <label>Blocks ({event.blocks.length})</label>
    {#each event.blocks as _, i}
      <AddBlock bind:value={event.blocks[i]} onRemove={() => removeBlock(i)} />
    {/each}
    <button class="btn-add" onclick={addNewBlock}>+ Add Block</button>
  </div>
</div>

<style>
  .editor-card {
    background: white;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }
  .field {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .btn-add {
    width: 100%;
    padding: 8px;
    border: 2px dashed #ccc;
    background: #fafafa;
    cursor: pointer;
  }
</style>
