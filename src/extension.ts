import * as vscode from "vscode";
import { RETRO_THEMES, RetroTheme } from "./themes";

/** globalState key: name of the currently applied retro theme. */
const STATE_CURRENT_THEME = "retroTerminal.currentTheme";
/** globalState key: the colorCustomizations keys this extension wrote, so Reset removes only ours. */
const STATE_MANAGED_KEYS = "retroTerminal.managedKeys";
/** globalState key: whether we currently own terminal.integrated.fontFamily. */
const STATE_FONT_MANAGED = "retroTerminal.fontManaged";
/** globalState key: the user's fontFamily from before we first changed it, to restore on reset. */
const STATE_PREV_FONT = "retroTerminal.prevFontFamily";

let statusBarItem: vscode.StatusBarItem;
let extensionContext: vscode.ExtensionContext;
let themesViewProvider: RetroThemesViewProvider | undefined;

interface ThemeQuickPickItem extends vscode.QuickPickItem {
  theme: RetroTheme;
}

/**
 * Read the *global* (user settings) value of workbench.colorCustomizations.
 * We inspect the global value specifically because that is the scope we write
 * to; the merged view could include workspace overrides we must not touch.
 */
function readGlobalColorCustomizations(): Record<string, unknown> {
  const inspected = vscode.workspace
    .getConfiguration("workbench")
    .inspect<Record<string, unknown>>("colorCustomizations");
  return { ...(inspected?.globalValue ?? {}) };
}

async function writeGlobalColorCustomizations(
  value: Record<string, unknown> | undefined
): Promise<void> {
  await vscode.workspace
    .getConfiguration("workbench")
    .update("colorCustomizations", value, vscode.ConfigurationTarget.Global);
}

/** True when the user wants the terminal panel chrome (tabs/toolbar) themed too. */
function isImmersive(): boolean {
  return vscode.workspace
    .getConfiguration("retroTerminal")
    .get<boolean>("immersiveMode", true);
}

/** True when the user wants each theme's era-appropriate terminal font applied. */
function isThemeFont(): boolean {
  return vscode.workspace
    .getConfiguration("retroTerminal")
    .get<boolean>("themeFont", true);
}

/**
 * Apply (or clear) the terminal font for a theme. We remember the user's own
 * fontFamily the first time we take it over, and restore it exactly on reset —
 * so turning the extension off leaves the terminal font as it was.
 */
async function applyFont(theme: RetroTheme | undefined): Promise<void> {
  const cfg = vscode.workspace.getConfiguration("terminal.integrated");
  const fontManaged = extensionContext.globalState.get<boolean>(STATE_FONT_MANAGED, false);

  try {
    if (theme && isThemeFont()) {
      if (!fontManaged) {
        // First time taking over: stash whatever the user had (may be undefined).
        const prev = cfg.inspect<string>("fontFamily")?.globalValue;
        await extensionContext.globalState.update(STATE_PREV_FONT, prev ?? null);
        await extensionContext.globalState.update(STATE_FONT_MANAGED, true);
      }
      await cfg.update("fontFamily", theme.font, vscode.ConfigurationTarget.Global);
    } else if (fontManaged) {
      // Restore the user's original font (undefined removes our override).
      const prev = extensionContext.globalState.get<string | null>(STATE_PREV_FONT, null);
      await cfg.update("fontFamily", prev ?? undefined, vscode.ConfigurationTarget.Global);
      await extensionContext.globalState.update(STATE_FONT_MANAGED, false);
      await extensionContext.globalState.update(STATE_PREV_FONT, undefined);
    }
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Retro Terminal: failed to update terminal font — ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ── Small color helpers, so chrome shades derive from each theme's own bg ──
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}
/** Perceived brightness, 0 (black) → 1 (white). */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
/** Blend two colors: amt 0 = from, 1 = to. */
function mix(from: string, to: string, amt: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * amt, g1 + (g2 - g1) * amt, b1 + (b2 - b1) * amt);
}
/** Nudge a color toward white if it's dark, toward black if it's light. */
function shade(hex: string, amt: number): string {
  return luminance(hex) < 0.5 ? mix(hex, "#ffffff", amt) : mix(hex, "#000000", amt);
}

/** Toolbar/tab-strip background: one subtle step off the terminal background. */
export function toolbarBgFor(bg: string): string {
  return shade(bg, 0.1);
}
/** Border color: a stronger step off, so the panel is clearly outlined. */
export function borderFor(bg: string): string {
  return shade(bg, 0.28);
}

/**
 * Panel/tab/toolbar chrome colors, derived entirely from the theme's own
 * palette — so the terminal tabs, title, borders, and the strip around the
 * terminal all match the selected theme. The toolbar sits one shade off the
 * terminal background (lighter on dark themes, darker on light ones) and gets
 * a visible border, so the chrome reads as a distinct, professional strip
 * rather than blending into the terminal content.
 */
function chromeColorsFor(theme: RetroTheme): Record<string, string> {
  const c = theme.colors;
  const bg = c["terminal.background"];
  const fg = c["terminal.foreground"];
  const accent = c["terminalCursor.foreground"];
  const toolbarBg = toolbarBgFor(bg);
  const border = borderFor(bg);
  const mutedFg = mix(fg, bg, 0.55);
  return {
    // The panel container (tabs strip + toolbar), one shade off the terminal
    "panel.background": toolbarBg,
    "panel.border": border,
    "panelSection.border": border,
    "panelSectionHeader.background": toolbarBg,
    // Panel title / active tab label + its accent underline
    "panelTitle.activeForeground": fg,
    "panelTitle.inactiveForeground": mutedFg,
    "panelTitle.activeBorder": accent,
    "panelTitle.border": border,
    // The terminal tab list on the right + borders around the region
    "terminal.tab.activeBorder": accent,
    "terminal.border": border,
    "terminalOverviewRuler.border": border,
  };
}

/** The full color set this extension writes for a theme: content + optional chrome. */
function colorsFor(theme: RetroTheme): Record<string, string> {
  return isImmersive() ? { ...theme.colors, ...chromeColorsFor(theme) } : { ...theme.colors };
}

/** Every key any theme could manage — used as a reset fallback if state is lost. */
function allPossibleManagedKeys(): string[] {
  return RETRO_THEMES.flatMap((t) => Object.keys({ ...t.colors, ...chromeColorsFor(t) }));
}

/**
 * Merge a color set into the given customizations object, first removing any
 * keys we previously set (in case the old theme/immersive-mode used keys the
 * new one doesn't). Never touches keys we don't manage.
 */
function mergeColors(
  base: Record<string, unknown>,
  colors: Record<string, string>,
  previouslyManagedKeys: string[]
): Record<string, unknown> {
  const merged = { ...base };
  for (const key of previouslyManagedKeys) {
    delete merged[key];
  }
  return { ...merged, ...colors };
}

/** Permanently apply a theme: write settings and record state. */
async function applyTheme(theme: RetroTheme, announce: boolean): Promise<boolean> {
  const previousKeys = extensionContext.globalState.get<string[]>(STATE_MANAGED_KEYS, []);
  const colors = colorsFor(theme);
  const merged = mergeColors(readGlobalColorCustomizations(), colors, previousKeys);
  try {
    await writeGlobalColorCustomizations(merged);
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Retro Terminal: failed to update settings — ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
  await extensionContext.globalState.update(STATE_CURRENT_THEME, theme.name);
  await extensionContext.globalState.update(STATE_MANAGED_KEYS, Object.keys(colors));
  await applyFont(theme);
  updateStatusBar();
  themesViewProvider?.refresh();
  if (announce) {
    void vscode.window.showInformationMessage(
      `Retro Terminal: applied “${theme.name}” (${theme.year})`
    );
  }
  return true;
}

/** Remove only the keys this extension manages from colorCustomizations. */
async function resetColors(): Promise<void> {
  const managedKeys = extensionContext.globalState.get<string[]>(STATE_MANAGED_KEYS, []);
  // Fall back to every key any built-in theme uses, in case state was lost.
  const keysToRemove = new Set(
    managedKeys.length > 0 ? managedKeys : allPossibleManagedKeys()
  );

  const current = readGlobalColorCustomizations();
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(current)) {
    if (!keysToRemove.has(key)) {
      cleaned[key] = value;
    }
  }

  try {
    // If nothing else is customized, remove the setting entirely.
    await writeGlobalColorCustomizations(
      Object.keys(cleaned).length > 0 ? cleaned : undefined
    );
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Retro Terminal: failed to update settings — ${err instanceof Error ? err.message : String(err)}`
    );
    return;
  }
  await extensionContext.globalState.update(STATE_CURRENT_THEME, undefined);
  await extensionContext.globalState.update(STATE_MANAGED_KEYS, undefined);
  await applyFont(undefined); // restore the user's original terminal font
  updateStatusBar();
  themesViewProvider?.refresh();
  void vscode.window.showInformationMessage("Retro Terminal: terminal colors reset.");
}

/** QuickPick with live preview while arrowing through themes. */
async function selectTheme(): Promise<void> {
  const currentName = extensionContext.globalState.get<string>(STATE_CURRENT_THEME);
  const previousKeys = extensionContext.globalState.get<string[]>(STATE_MANAGED_KEYS, []);
  // Snapshot to restore on Escape.
  const snapshot = readGlobalColorCustomizations();
  const snapshotHadKeys = Object.keys(snapshot).length > 0;

  const items: ThemeQuickPickItem[] = [...RETRO_THEMES]
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
    .map((theme) => ({
      label: theme.name === currentName ? `$(check) ${theme.name}` : `$(circle-large-outline) ${theme.name}`,
      description: String(theme.year),
      detail: theme.description,
      theme,
    }));

  const picker = vscode.window.createQuickPick<ThemeQuickPickItem>();
  picker.title = "Retro Terminal Themes (1960–2010)";
  picker.placeholder = "Arrow keys to preview live · Enter to apply · Esc to cancel";
  picker.items = items;
  picker.matchOnDetail = true;
  picker.matchOnDescription = true;
  const active = items.find((i) => i.theme.name === currentName);
  if (active) {
    picker.activeItems = [active];
  }

  let accepted = false;
  let previewTimer: NodeJS.Timeout | undefined;
  // Serialize settings writes so a fast arrow-key sequence can't interleave.
  let writeChain: Promise<unknown> = Promise.resolve();
  const queueWrite = (value: Record<string, unknown> | undefined) => {
    writeChain = writeChain
      .then(() => writeGlobalColorCustomizations(value))
      .catch(() => {
        /* preview writes are best-effort; the final apply reports errors */
      });
    return writeChain;
  };

  picker.onDidChangeActive((activeItems) => {
    const item = activeItems[0];
    if (!item) {
      return;
    }
    // Small debounce: settings writes hit disk, so don't write on every keystroke.
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    previewTimer = setTimeout(() => {
      void queueWrite(mergeColors(snapshot, colorsFor(item.theme), previousKeys));
    }, 80);
  });

  picker.onDidAccept(() => {
    accepted = true;
    const chosen = picker.selectedItems[0] ?? picker.activeItems[0];
    picker.hide();
    if (chosen) {
      // Wait for any in-flight preview write, then apply for real.
      void writeChain.then(() => applyTheme(chosen.theme, true));
    }
  });

  picker.onDidHide(() => {
    if (previewTimer) {
      clearTimeout(previewTimer);
    }
    if (!accepted) {
      // Escape: put back exactly what was there before.
      void queueWrite(snapshotHadKeys ? snapshot : undefined);
    }
    picker.dispose();
  });

  picker.show();
}

async function randomTheme(): Promise<void> {
  const currentName = extensionContext.globalState.get<string>(STATE_CURRENT_THEME);
  // Don't "randomly" pick the theme that's already applied.
  const pool = RETRO_THEMES.filter((t) => t.name !== currentName);
  const theme = pool[Math.floor(Math.random() * pool.length)] ?? RETRO_THEMES[0];
  await applyTheme(theme, true);
}

function updateStatusBar(): void {
  const currentName = extensionContext.globalState.get<string>(STATE_CURRENT_THEME);
  if (currentName) {
    statusBarItem.text = `$(terminal) ${currentName}`;
    statusBarItem.tooltip = `Retro Terminal theme: ${currentName} — click to change`;
  } else {
    statusBarItem.text = "$(terminal) Retro Terminal";
    statusBarItem.tooltip = "Pick a retro terminal theme";
  }
  statusBarItem.show();
}

/**
 * Activity Bar sidebar: a CRT-styled webview listing every theme grouped by
 * era. Clicking a theme applies it; the active one is highlighted.
 */
class RetroThemesViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "retroTerminal.themesView";
  private view: vscode.WebviewView | undefined;

  public resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.buildHtml();

    webviewView.webview.onDidReceiveMessage(async (message: { type: string; name?: string }) => {
      if (message.type === "apply" && message.name) {
        const theme = RETRO_THEMES.find((t) => t.name === message.name);
        if (theme) {
          await applyTheme(theme, false);
        }
      } else if (message.type === "reset") {
        await resetColors();
      }
    });

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });
    this.refresh();
  }

  /** Push the currently applied theme name so the view can mark it. */
  public refresh(): void {
    void this.view?.webview.postMessage({
      type: "current",
      name: extensionContext.globalState.get<string>(STATE_CURRENT_THEME) ?? null,
    });
  }

  private buildHtml(): string {
    const nonce = Array.from({ length: 32 }, () =>
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 62))
    ).join("");
    const themesJson = JSON.stringify(
      [...RETRO_THEMES]
        .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name))
        .map((t) => ({
          name: t.name,
          year: t.year,
          description: t.description,
          bg: t.colors["terminal.background"],
          fg: t.colors["terminal.foreground"],
          dots: [
            t.colors["terminal.ansiBrightRed"],
            t.colors["terminal.ansiBrightYellow"],
            t.colors["terminal.ansiBrightBlue"],
          ],
        }))
    );
    const currentName = JSON.stringify(
      extensionContext.globalState.get<string>(STATE_CURRENT_THEME) ?? null
    );

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
  :root { --green: #33ff41; --dim: #1d8a28; --bg: #030903; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; }
  body {
    background: var(--bg);
    color: var(--green);
    font-family: Consolas, "Courier New", monospace;
    font-size: 12px;
    text-shadow: 0 0 5px rgba(51, 255, 65, 0.45);
    display: flex; flex-direction: column;
  }
  /* CRT scanlines over everything */
  body::after {
    content: ""; position: fixed; inset: 0; pointer-events: none; z-index: 10;
    background: repeating-linear-gradient(to bottom, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.28) 2px 4px);
  }
  header { padding: 10px 10px 6px; border-bottom: 1px solid var(--dim); }
  header h1 { font-size: 13px; letter-spacing: 1px; }
  header h1::after { content: "█"; animation: blink 1.1s steps(1) infinite; margin-left: 4px; }
  @keyframes blink { 50% { opacity: 0; } }
  header .sub { color: var(--dim); margin-top: 2px; }
  .search { padding: 8px 10px; }
  .search input {
    width: 100%; background: #000; color: var(--green);
    border: 1px solid var(--dim); padding: 5px 7px;
    font-family: inherit; font-size: 12px; outline: none;
    text-shadow: inherit;
  }
  .search input:focus { border-color: var(--green); }
  .search input::placeholder { color: var(--dim); }
  main { flex: 1; overflow-y: auto; padding-bottom: 8px; }
  .era {
    color: var(--dim); padding: 10px 10px 4px; letter-spacing: 1px;
    white-space: nowrap; overflow: hidden;
  }
  .row {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px; cursor: pointer; border: 1px solid transparent;
  }
  .row:hover { background: rgba(51, 255, 65, 0.08); border-color: var(--dim); }
  .row.active { background: rgba(51, 255, 65, 0.14); border-color: var(--green); }
  .swatch {
    width: 34px; height: 22px; flex: none;
    border: 1px solid var(--dim); border-radius: 2px;
    display: flex; align-items: center; justify-content: center; gap: 3px;
  }
  .swatch i { width: 5px; height: 5px; border-radius: 50%; display: block; }
  .meta { min-width: 0; flex: 1; }
  .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .name .mark { display: inline-block; width: 12px; }
  .desc { color: var(--dim); font-size: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .year { color: var(--dim); flex: none; }
  .row.active .year { color: var(--green); }
  .empty { color: var(--dim); padding: 14px 10px; }
  footer { padding: 8px 10px; border-top: 1px solid var(--dim); }
  footer button {
    width: 100%; background: #000; color: var(--green);
    border: 1px solid var(--green); padding: 7px; cursor: pointer;
    font-family: inherit; font-size: 12px; letter-spacing: 1px;
    text-shadow: inherit;
  }
  footer button:hover { background: rgba(51, 255, 65, 0.15); }
  footer button:active { background: var(--green); color: #000; text-shadow: none; }
</style>
</head>
<body>
  <header>
    <h1>RETRO TERMINAL</h1>
    <div class="sub" id="count"></div>
  </header>
  <div class="search"><input id="search" type="text" placeholder="> SEARCH THEMES..." /></div>
  <main id="list"></main>
  <footer><button id="reset">[ RESET TERMINAL COLORS ]</button></footer>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const themes = ${themesJson};
    let current = ${currentName};

    function era(year) {
      if (year < 1980) return "1960s\\u201370s";
      if (year < 1990) return "1980s";
      if (year < 2000) return "1990s";
      return "2000s";
    }
    function esc(s) {
      return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    const searchBox = document.getElementById("search");
    const list = document.getElementById("list");
    document.getElementById("count").textContent = themes.length + " THEMES \\u00B7 1964\\u20132010";

    function render() {
      const q = searchBox.value.trim().toLowerCase();
      const filtered = themes.filter((t) =>
        !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || String(t.year).includes(q)
      );
      if (!filtered.length) {
        list.innerHTML = '<div class="empty">NO MATCH FOUND_</div>';
        return;
      }
      let html = "", lastEra = "";
      for (const t of filtered) {
        const e = era(t.year);
        if (e !== lastEra) {
          lastEra = e;
          html += '<div class="era">\\u2500\\u2500 ' + e + ' \\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500\\u2500</div>';
        }
        const active = t.name === current;
        html +=
          '<div class="row' + (active ? " active" : "") + '" data-name="' + esc(t.name) + '">' +
            '<span class="swatch" style="background:' + esc(t.bg) + '">' +
              t.dots.map((d) => '<i style="background:' + esc(d) + '"></i>').join("") +
            "</span>" +
            '<span class="meta">' +
              '<div class="name"><span class="mark">' + (active ? "\\u25BA" : "") + "</span>" + esc(t.name) + "</div>" +
              '<div class="desc">' + esc(t.description) + "</div>" +
            "</span>" +
            '<span class="year">' + t.year + "</span>" +
          "</div>";
      }
      list.innerHTML = html;
    }

    list.addEventListener("click", (ev) => {
      const row = ev.target.closest(".row");
      if (row) {
        vscode.postMessage({ type: "apply", name: row.dataset.name });
      }
    });
    document.getElementById("reset").addEventListener("click", () => {
      vscode.postMessage({ type: "reset" });
    });
    searchBox.addEventListener("input", render);
    window.addEventListener("message", (ev) => {
      if (ev.data && ev.data.type === "current") {
        current = ev.data.name;
        render();
      }
    });
    render();
  </script>
</body>
</html>`;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  extensionContext = context;

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = "retroTerminal.selectTheme";
  context.subscriptions.push(statusBarItem);
  updateStatusBar();

  themesViewProvider = new RetroThemesViewProvider();
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(RetroThemesViewProvider.viewType, themesViewProvider),
    vscode.commands.registerCommand("retroTerminal.selectTheme", selectTheme),
    vscode.commands.registerCommand("retroTerminal.randomTheme", randomTheme),
    vscode.commands.registerCommand("retroTerminal.resetColors", resetColors),
    // Re-apply the current theme when immersive mode or the font toggle changes,
    // so chrome/font are added or cleanly removed without touching the user's own keys.
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (
        e.affectsConfiguration("retroTerminal.immersiveMode") ||
        e.affectsConfiguration("retroTerminal.themeFont")
      ) {
        const name = extensionContext.globalState.get<string>(STATE_CURRENT_THEME);
        const theme = RETRO_THEMES.find((t) => t.name === name);
        if (theme) {
          void applyTheme(theme, false);
        } else if (!isThemeFont()) {
          void applyFont(undefined);
        }
      }
    })
  );
}

export function deactivate(): void {
  // Applied colors intentionally persist across sessions; nothing to clean up.
}
