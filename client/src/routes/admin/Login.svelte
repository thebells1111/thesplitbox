<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let remoteServer;

  let username = "";
  let password = "";
  let newUsername = "";
  let newPassword = "";

  let isSetupMode = false;
  let errorMessage = "";

  async function handleLogin() {
    errorMessage = "";
    try {
      const response = await fetch(`${remoteServer}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 202 && data.mustInitialize) {
        // Trigger the Setup UI
        isSetupMode = true;
      } else if (response.ok) {
        dispatch("success");
      } else {
        errorMessage = data.error || "Login failed";
      }
    } catch (err) {
      errorMessage = "Could not connect to server";
    }
  }

  async function handleSetup() {
    errorMessage = "";
    try {
      const response = await fetch(`${remoteServer}/auth/setup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername, newPassword }),
        credentials: "include",
      });

      if (response.ok) {
        // After setup, return to login mode so they can sign in with new creds
        isSetupMode = false;
        username = newUsername;
        errorMessage = "Account created! Please log in.";
      } else {
        const data = await response.json();
        errorMessage = data.error || "Setup failed";
      }
    } catch (err) {
      errorMessage = "Could not connect to server";
    }
  }
</script>

<div class="login-container">
  {#if !isSetupMode}
    <form on:submit|preventDefault={handleLogin}>
      <h2>Login</h2>
      <input
        type="text"
        bind:value={username}
        placeholder="Username"
        required
      />
      <input
        type="password"
        bind:value={password}
        placeholder="Password"
        required
      />
      <button type="submit">Sign In</button>
    </form>
  {:else}
    <form on:submit|preventDefault={handleSetup}>
      <h2>Initial Setup</h2>
      <p>System uninitialized. Create your primary admin account.</p>
      <input
        type="text"
        bind:value={newUsername}
        placeholder="New Username"
        required
      />
      <input
        type="password"
        bind:value={newPassword}
        placeholder="New Password (min 8 chars)"
        required
      />
      <button type="submit">Initialize Account</button>
    </form>
  {/if}

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</div>

<style>
  .login-container {
    max-width: 400px;
    margin: 100px auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.7rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .error {
    color: red;
    margin-top: 1rem;
    font-size: 0.9rem;
    text-align: center;
  }
</style>
