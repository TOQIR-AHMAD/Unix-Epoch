# Change Log

## 1.3.0

- **Themed terminal fonts**: each theme now also applies an era-appropriate font via `terminal.integrated.fontFamily` — VT323 for CRT/phosphor themes, IBM Plex Mono for mainframe/DOS, Ubuntu Mono for Ubuntu, and so on. Fallback stacks end in `monospace`, and your original font is restored on Reset. New setting `retroTerminal.themeFont` (default on).
- Immersive mode now gives the terminal toolbar/tab strip a **distinct shade** (one step lighter on dark themes, darker on light themes) and a **visible border**, so the chrome reads as a professional panel instead of blending into the terminal.
- README preview mockups regenerated to show the same bordered, shaded chrome and themed fonts as VS Code.

## 1.2.0

- **Immersive mode** (on by default): the terminal tabs, title, toolbar background, and borders now match the selected theme too — not just the terminal content area. Colors are derived from each theme's own palette, so all 20 themes get it for free.
- New setting `retroTerminal.immersiveMode` to toggle chrome theming; toggling it re-applies the current theme and cleanly removes the chrome keys.
- Reset and the live preview account for the chrome keys as well.

## 1.1.1

- New Marketplace README: hero banner, badges, real palette-rendered screenshots, era table, palette reference, FAQ
- Preview mockups generated from the actual theme data (`npm run previews`)

## 1.1.0

- Extension logo (pixel-art retro CRT)
- Activity Bar icon with a CRT-styled sidebar theme browser: era groups, color swatches, search, one-click apply, reset button

## 1.0.0

- Initial release
- 20 retro terminal themes (1964–2010) with full ANSI palettes
- Theme picker with live preview, random theme, and clean reset
- Status bar item showing the active theme
