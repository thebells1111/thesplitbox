import { dev } from "$app/environment";

export const remoteServer = dev
  ? "http://localhost:3000"
  : "https://thesplitbox.com";


export const user = $state({
  address: "",
});
