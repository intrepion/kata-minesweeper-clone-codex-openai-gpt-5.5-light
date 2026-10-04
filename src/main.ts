import "./styles.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App root was not found.");
}

app.innerHTML = `
  <main class="shell">
    <h1>Minesweeper</h1>
    <p>Game engine ready. Playable UI arrives in the next MVP slice.</p>
  </main>
`;
