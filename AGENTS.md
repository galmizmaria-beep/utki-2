# Published games

- Published `game-v*.html` routes and `player-v*/` directories are immutable. Never edit, remove, or repoint an existing published version, including its assets.
- `game.html` is a legacy route fixed to `player-v20260926/index.html`.
- Root `index.html?player=1` is a legacy route fixed to `player-v20260926-5/index.html`. Keep this redirect out of versioned player index files.
- Change the editor in root files. Publish runtime changes in a new, uniquely named player directory and game route. Update the editor's default URL only for newly copied embeds.
- Keep every release self-contained: its HTML, JavaScript, CSS, and bundled assets must resolve within its own directory. Do not load mutable root scripts from a frozen player.
- Run browser export, runtime-parity, result-button, and pinned-player tests when changing export or player routing. Test the new snapshot as well as the editor.
