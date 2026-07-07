<p align="center">
  <img src="media/preview/hero.png" alt="Retro Terminal Themes — 20 retro terminal color themes, 1964–2010" width="960" />
</p>

<h1 align="center">Retro Terminal Themes</h1>

<p align="center"><b>20 retro terminal color themes spanning 1964–2010 — with a CRT-styled one-click picker right in your sidebar.</b></p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=ToqirAhmad.retro-terminal-themes"><img src="https://img.shields.io/visual-studio-marketplace/v/ToqirAhmad.retro-terminal-themes?color=33ff41&label=Marketplace&logo=visual-studio-code" alt="Marketplace Version" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ToqirAhmad.retro-terminal-themes"><img src="https://img.shields.io/visual-studio-marketplace/i/ToqirAhmad.retro-terminal-themes?color=ffb000&label=Installs" alt="Installs" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ToqirAhmad.retro-terminal-themes"><img src="https://img.shields.io/visual-studio-marketplace/d/ToqirAhmad.retro-terminal-themes?color=00e8c6&label=Downloads" alt="Downloads" /></a>
  <a href="https://marketplace.visualstudio.com/items?itemName=ToqirAhmad.retro-terminal-themes&ssr=false#review-details"><img src="https://img.shields.io/visual-studio-marketplace/r/ToqirAhmad.retro-terminal-themes?color=fabd2f&label=Rating" alt="Rating" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-58a6ff.svg" alt="MIT License" /></a>
</p>

<p align="center">
  <b>Your editor theme stays. Only the terminal time-travels.</b><br/>
  IBM Mainframe · Punch Card · VT52 Amber · Apple II · DOS · Commodore 64 · ZX Spectrum · Macintosh · CGA · Amiga · Turbo Pascal · Windows 3.1 · Norton Commander · Windows 95 · Matrix · XP Luna · OS X Aqua · Ubuntu · Solarized
</p>

---

## Table of Contents

- [Why Retro Terminal Themes](#why-retro-terminal-themes)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Using the Theme Browser](#using-the-theme-browser)
- [All 20 Themes](#all-20-themes)
- [Color Palette Reference](#color-palette-reference)
- [Adding Your Own Theme](#adding-your-own-theme)
- [FAQ](#faq)
- [Contributing & Development](#contributing--development)
- [License](#license)

---

## Why Retro Terminal Themes

Theme extensions restyle your whole editor. This one restyles **only the integrated terminal** — so you keep the editor theme you love and give your shell a genuine piece of computing history.

- 🕰️ **20 hand-tuned palettes across five decades** — from 1964 mainframe phosphor to 2010 Solarized.
- 🎨 **Complete palettes** — every theme defines background, foreground, cursor, selection, and all **16 ANSI colors**, so `ls`, `git`, and your prompt all look right.
- 🖥️ **CRT-styled sidebar browser** — scanlines included. Browse by era, see a live color swatch for every theme, and apply with one click.
- 👀 **Live preview picker** — arrow through the Command Palette QuickPick and the terminal restyles instantly; `Esc` puts everything back.
- 🎲 **Random theme** — feeling nostalgic but indecisive.
- 🎛️ **Immersive mode** — themes the terminal **tabs, title, and toolbar chrome** too, not just the content area, so the whole terminal region matches. Toggle it with `retroTerminal.immersiveMode`.
- ↩️ **Reversible & polite** — themes merge into `workbench.colorCustomizations` without touching your other customizations, and **Reset** removes only the keys this extension set.
- 🆓 **Free & open source**, MIT licensed.

---

## Screenshots

> Every mockup below is rendered from the theme's actual palette.

### 🟠 DEC VT52 Amber · 1975
Warm amber phosphor glow of DEC video terminals.

<p align="center"><img src="media/preview/dec-vt52-amber.png" alt="Retro Terminal Themes — DEC VT52 Amber" width="820" /></p>

### 🟢 Apple II Green · 1977
The classic green P1 phosphor of the Apple ][ monitor.

<p align="center"><img src="media/preview/apple-ii-green.png" alt="Retro Terminal Themes — Apple II Green" width="820" /></p>

### 🔵 Commodore 64 · 1982
`READY.` — light blue text on the famous deep blue screen.

<p align="center"><img src="media/preview/commodore-64.png" alt="Retro Terminal Themes — Commodore 64" width="820" /></p>

### 🟡 Turbo Pascal · 1990
Borland's IDE — yellow on blue, F1 for Help.

<p align="center"><img src="media/preview/turbo-pascal.png" alt="Retro Terminal Themes — Turbo Pascal" width="820" /></p>

### 🟩 Hacker Green (Matrix) · 1999
Follow the white rabbit — `#00ff41` rain on pure black.

<p align="center"><img src="media/preview/hacker-green-matrix.png" alt="Retro Terminal Themes — Hacker Green (Matrix)" width="820" /></p>

### 🌒 Solarized Dark · 2010
Ethan Schoonover's precision palette, faithfully reproduced.

<p align="center"><img src="media/preview/solarized-dark.png" alt="Retro Terminal Themes — Solarized Dark" width="820" /></p>

---

## Installation

### Easy Installation

Get started in under a minute:

1. Open the **Extensions** sidebar in Visual Studio Code (`Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for **Retro Terminal Themes**.
3. Click **Install**.
4. Click the **terminal icon** in the Activity Bar (left edge) to open the theme browser.
5. Pick any theme — the terminal restyles instantly.
6. Enjoy! And consider leaving a ⭐⭐⭐⭐⭐ review.

### Alternate Installation

Prefer the command palette?

1. Launch **Quick Open** — `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS).
2. Paste: `ext install ToqirAhmad.retro-terminal-themes`
3. Hit **Enter**, then **Install**.

---

## Using the Theme Browser

- Click the **terminal icon** in the Activity Bar to open the retro sidebar — green phosphor, scanlines, blinking cursor.
- Themes are **grouped by era** (1960s–70s · 1980s · 1990s · 2000s), each with a **color swatch** built from its real palette.
- **Click any theme to apply it** — the active one is marked with `►`.
- Use the **`> SEARCH THEMES...`** box to filter by name, year, or description.
- **[ RESET TERMINAL COLORS ]** at the bottom removes everything this extension set and nothing else.

### Immersive mode (themed tabs & toolbar)

By default the extension also tints the **terminal panel chrome** — the tab strip, the active tab title, the toolbar background, and the borders — so the tabs and icons match the theme instead of staying your editor-theme color. Every color is pulled from the theme's own palette.

Because VS Code's bottom panel is shared, this also tints the **Problems / Output / Debug Console** tabs that live next to the terminal. If you'd rather restyle only the terminal viewport, set:

```jsonc
"retroTerminal.immersiveMode": false
```

Toggling it re-applies the current theme and cleanly removes the chrome keys — your own customizations are never touched.

You can also use the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

| Command | What it does |
| --- | --- |
| `Retro Terminal: Select Theme` | QuickPick sorted by year with **live preview** — arrow keys preview, `Enter` applies, `Esc` restores |
| `Retro Terminal: Random Theme` | Applies a random theme and tells you which one |
| `Retro Terminal: Reset Terminal Colors` | Removes only this extension's terminal color keys |

The **status bar** (bottom right) always shows the active retro theme — click it to open the picker.

---

## All 20 Themes

Four eras, five decades, 20 machines worth of nostalgia.

| Era | Themes |
| --- | --- |
| 🧮 **1960s–70s** | IBM Mainframe (1964) · Punch Card Beige (1965) · DEC VT52 Amber (1975) · Apple II Green (1977) |
| 🕹️ **1980s** | IBM PC DOS (1981) · Commodore 64 (1982) · ZX Spectrum (1982) · Apple Macintosh (1984) · CGA Magenta (1984) · Amiga Workbench (1985) |
| 💾 **1990s** | Turbo Pascal (1990) · Windows 3.1 (1992) · Norton Commander (1993) · Windows 95 Console (1995) · Hacker Green / Matrix (1999) |
| 💿 **2000s** | Windows XP Luna (2001) · OS X Aqua Terminal (2001) · Ubuntu Human (2004) · Solarized Dark (2010) · Solarized Light (2010) |

---

## Color Palette Reference

Every theme is a complete terminal palette — background, foreground, cursor, selection, and all 16 ANSI colors. A few of the highlights:

### 🟠 DEC VT52 Amber

| Role | Color | Hex |
| --- | --- | --- |
| Background | ⬛ | `#120B00` |
| Foreground | 🟧 | `#FFB000` |
| Cursor | 🟨 | `#FFCC33` |
| Bright Red | 🟧 | `#FF8C1A` |
| Bright Green | 🟧 | `#FFB733` |
| Bright Yellow | 🟨 | `#FFD11A` |
| Bright Blue | 🟫 | `#CC9933` |

### 🔵 Commodore 64

| Role | Color | Hex |
| --- | --- | --- |
| Background | 🟦 | `#40318D` |
| Foreground | 🟪 | `#7869C4` |
| Cursor | 🟪 | `#7869C4` |
| Red | 🟥 | `#883932` |
| Green | 🟩 | `#55A049` |
| Yellow | 🟨 | `#BFCE72` |
| Cyan | 🟦 | `#67B6BD` |

### 🌒 Solarized Dark

| Role | Color | Hex |
| --- | --- | --- |
| Background | 🟦 | `#002B36` |
| Foreground | ⬜ | `#839496` |
| Cursor | ⬜ | `#93A1A1` |
| Red | 🟥 | `#DC322F` |
| Green | 🟩 | `#859900` |
| Yellow | 🟨 | `#B58900` |
| Blue | 🟦 | `#268BD2` |

---

## Adding Your Own Theme

Every theme lives in one self-contained block in [`src/themes.ts`](src/themes.ts) — no logic changes needed, ever.

1. Open `src/themes.ts`.
2. Copy any existing theme block inside the `RETRO_THEMES` array and paste it where you like.
3. Change `name`, `year`, `description`, and the 20 hex values in `colors`:
   - `terminal.background`, `terminal.foreground`, `terminalCursor.foreground`, `terminal.selectionBackground`
   - the 16 ANSI keys: `terminal.ansiBlack` … `terminal.ansiBrightWhite`
4. Recompile (`npm run compile` or the running watch task) and reload.

That's it. The sidebar browser, live-preview picker, random command, status bar, and reset all pick the new theme up automatically. Example:

```ts
{
  name: "My Teletype",
  year: 1971,
  description: "Ink on paper",
  colors: {
    "terminal.background": "#f5f0e6",
    "terminal.foreground": "#222222",
    "terminalCursor.foreground": "#222222",
    "terminal.selectionBackground": "#c9bfa899",
    "terminal.ansiBlack": "#222222",
    // ... the remaining 15 ANSI colors
  }
},
```

Tip: `terminal.selectionBackground` accepts 8-digit hex (`#rrggbbaa`) for translucent selections.

---

## FAQ

**Does this change my editor theme?**
No — that's the whole point. It only writes terminal color keys into `workbench.colorCustomizations`, so your editor theme, UI colors, and syntax highlighting are untouched.

**Will it overwrite my existing color customizations?**
Never. Themes are *merged* into your settings, and the extension remembers exactly which keys it wrote — **Reset** strips only those and leaves everything else alone.

**Do the colors stay if I uninstall?**
Yes, because they live in your user settings. Run **Retro Terminal: Reset Terminal Colors** before uninstalling if you want the defaults back.

**Which theme is best for presentations or screencasts?**
High-contrast picks like **Hacker Green (Matrix)**, **DEC VT52 Amber**, **Apple II Green**, or **IBM PC DOS** read beautifully on a projector.

**Can I request a theme?**
Absolutely — open an issue on the [repository](https://github.com/TOQIR-AHMAD/Unix-Epoch), or add it yourself in one minute (see [Adding Your Own Theme](#adding-your-own-theme)).

---

## Contributing & Development

```bash
npm install          # install dev dependencies
npm run compile      # build the extension
npm run watch        # rebuild on save
npm run previews     # regenerate the README preview mockups (HTML)
```

- All 20 themes live in [`src/themes.ts`](src/themes.ts) — one typed block per theme, zero logic.
- README preview mockups are generated by [`scripts/generate-previews.js`](scripts/generate-previews.js) from the real palettes, then screenshotted from a browser.
- Press **F5** in VS Code to launch an Extension Development Host with the extension loaded.

Issues and pull requests are welcome at [github.com/TOQIR-AHMAD/Unix-Epoch](https://github.com/TOQIR-AHMAD/Unix-Epoch).

---

## License

[MIT](LICENSE) © Toqir Ahmad

<p align="center">Made with 🖥️ and phosphor glow — if your terminal feels 40 years younger, consider leaving a ⭐ review on the <a href="https://marketplace.visualstudio.com/items?itemName=ToqirAhmad.retro-terminal-themes">Marketplace</a>.</p>
