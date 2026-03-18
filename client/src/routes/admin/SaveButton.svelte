<script>
  let { isDirty, isSaving, onSave, onRevert } = $props();
</script>

<div class="save-controls">
  {#if isDirty}
    <button
      type="button"
      class="btn-revert"
      onclick={onRevert}
      disabled={isSaving}
    >
      Discard
    </button>
  {/if}

  <button
    type="button"
    class="btn-save"
    class:dirty={isDirty}
    onclick={onSave}
    disabled={!isDirty || isSaving}
  >
    {isSaving ? "Saving..." : "Save Changes"}
  </button>
</div>

<style>
  .save-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-save {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    background: #ccc;
    color: white;
    transition: all 0.2s;
  }

  .btn-save.dirty {
    background: #28a745;
    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  }

  .btn-save:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .btn-revert {
    background: transparent;
    border: none;
    color: #dc3545;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: underline;
  }
</style>
