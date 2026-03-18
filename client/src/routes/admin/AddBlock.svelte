<script>
  // 'value' is bindable so it updates the parent array directly
  // 'onRemove' is a callback function passed from the parent
  let { value = $bindable(), onRemove } = $props();
</script>

<div class="block-row">
  <input
    type="text"
    bind:value
    placeholder="Block name (e.g., Header, Image, Text)..."
  />
  <button
    type="button"
    class="btn-remove"
    onclick={onRemove}
    aria-label="Remove block"
  >
    ×
  </button>
</div>

<style>
  .block-row {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }

  input {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #007bff;
  }

  .btn-remove {
    background: #ffeded;
    color: #cc0000;
    border: 1px solid #ffcccc;
    border-radius: 6px;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-size: 1.5rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-remove:hover {
    background: #ff4d4d;
    color: white;
  }
</style>
