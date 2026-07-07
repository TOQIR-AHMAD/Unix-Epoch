# Retro Terminal Themes

Give the **VS Code integrated terminal** a retro computing look — without touching your editor theme. Pick from **20 themes spanning 1960–2010**, from IBM mainframe phosphor to Solarized.

The extension only changes terminal color keys inside `workbench.colorCustomizations` (user settings). Your editor theme, UI colors, and any other customizations are left exactly as they are.

![Theme picker screenshot placeholder](images/picker.png)
![Amber terminal screenshot placeholder](images/amber.png)

## Features

- 🎨 **20 hand-tuned retro palettes** — full 16-color ANSI set plus background, foreground, cursor, and selection for every theme
- 👀 **Live preview** — arrow through the picker and the terminal restyles instantly; `Esc` restores what you had, `Enter` keeps it
- 🎲 **Random theme** — feeling nostalgic but indecisive
- 🧹 **Clean reset** — removes only the keys this extension set, never your own customizations
- 📊 **Status bar item** — shows the active retro theme; click it to open the picker
- ✅ The currently applied theme is marked with a check in the picker

## Commands

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run:

| Command | What it does |
|---|---|
| `Retro Terminal: Select Theme` | QuickPick of all 20 themes, sorted by year, with live preview |
| `Retro Terminal: Random Theme` | Applies a random theme and tells you which one |
| `Retro Terminal: Reset Terminal Colors` | Removes only this extension's terminal color keys |

## The Themes

| # | Theme | Year | Vibe |
|---|---|---|---|
| 1 | IBM Mainframe | 1964 | Cold white/blue text on black |
| 2 | Punch Card Beige | 1965 | Dark brown ink on cream card stock |
| 3 | DEC VT52 Amber | 1975 | Warm amber phosphor |
| 4 | Apple II Green | 1977 | Classic green phosphor |
| 5 | IBM PC DOS | 1981 | Light grey on black, `C:\>` |
| 6 | Commodore 64 | 1982 | Light blue on deep blue, `READY.` |
| 7 | ZX Spectrum | 1982 | Saturated primaries on black |
| 8 | Apple Macintosh | 1984 | Black on light grey |
| 9 | CGA Magenta | 1984 | Cyan/magenta/white CGA palette 1 |
| 10 | Amiga Workbench | 1985 | Blue-grey with orange and white |
| 11 | Turbo Pascal | 1990 | Yellow on Borland blue |
| 12 | Windows 3.1 | 1992 | White on navy blue |
| 13 | Norton Commander | 1993 | Blue with cyan panels, yellow highlights |
| 14 | Windows 95 Console | 1995 | Silver-grey on black |
| 15 | Hacker Green (Matrix) | 1999 | `#00ff41` on pure black |
| 16 | Windows XP Luna | 2001 | Soft Bliss-era blues |
| 17 | OS X Aqua Terminal | 2001 | Black on white, Terminal.app defaults |
| 18 | Ubuntu Human | 2004 | Aubergine with orange accents |
| 19 | Solarized Dark | 2010 | The Ethan Schoonover classic |
| 20 | Solarized Light | 2010 | Light variant, same accent colors |

## Adding Your Own Theme

Every theme lives in one self-contained block in [`src/themes.ts`](src/themes.ts) — no logic changes needed, ever.

1. Open `src/themes.ts`.
2. Copy any existing theme block inside the `RETRO_THEMES` array and paste it where you like.
3. Change `name`, `year`, `description`, and the 20 hex values in `colors`:
   - `terminal.background`, `terminal.foreground`, `terminalCursor.foreground`, `terminal.selectionBackground`
   - the 16 ANSI keys: `terminal.ansiBlack` … `terminal.ansiBrightWhite`
4. Recompile (`npm run compile` or the running watch task) and reload.

That's it. The picker, live preview, random command, status bar, and reset all pick the new theme up automatically. Example:

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

## How It Works

Applying a theme merges its color keys into your global `workbench.colorCustomizations` via `workspace.getConfiguration().update(..., ConfigurationTarget.Global)`. The extension remembers exactly which keys it wrote (in `globalState`), so **Reset** strips only those keys and leaves the rest of your customizations untouched. If nothing else remains, the setting is removed entirely.

## Development

```bash
npm install
npm run compile   # one-shot build
npm run watch     # rebuild on save
```

Press **F5** to launch an Extension Development Host with the extension loaded, then open the integrated terminal and run `Retro Terminal: Select Theme`.

## License

MIT
