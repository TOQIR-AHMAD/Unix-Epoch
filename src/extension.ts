import * as vscode from "vscode";
import { RETRO_THEMES, RetroTheme } from "./themes";

/** globalState key: name of the currently applied retro theme. */
const STATE_CURRENT_THEME = "retroTerminal.currentTheme";
/** globalState key: the colorCustomizations keys this extension wrote, so Reset removes only ours. */
const STATE_MANAGED_KEYS = "retroTerminal.managedKeys";

let statusBarItem: vscode.StatusBarItem;
let extensionContext: vscode.ExtensionContext;

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

/**
 * Merge a theme's colors into the given customizations object, first removing
 * any keys we previously set (in case an older theme used keys the new one
 * doesn't). Never touches keys we don't manage.
 */
function mergeTheme(
  base: Record<string, unknown>,
  theme: RetroTheme,
  previouslyManagedKeys: string[]
): Record<string, unknown> {
  const merged = { ...base };
  for (const key of previouslyManagedKeys) {
    delete merged[key];
  }
  return { ...merged, ...theme.colors };
}

/** Permanently apply a theme: write settings and record state. */
async function applyTheme(theme: RetroTheme, announce: boolean): Promise<boolean> {
  const previousKeys = extensionContext.globalState.get<string[]>(STATE_MANAGED_KEYS, []);
  const merged = mergeTheme(readGlobalColorCustomizations(), theme, previousKeys);
  try {
    await writeGlobalColorCustomizations(merged);
  } catch (err) {
    void vscode.window.showErrorMessage(
      `Retro Terminal: failed to update settings — ${err instanceof Error ? err.message : String(err)}`
    );
    return false;
  }
  await extensionContext.globalState.update(STATE_CURRENT_THEME, theme.name);
  await extensionContext.globalState.update(STATE_MANAGED_KEYS, Object.keys(theme.colors));
  updateStatusBar();
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
    managedKeys.length > 0
      ? managedKeys
      : RETRO_THEMES.flatMap((t) => Object.keys(t.colors))
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
  updateStatusBar();
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
      void queueWrite(mergeTheme(snapshot, item.theme, previousKeys));
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

export function activate(context: vscode.ExtensionContext): void {
  extensionContext = context;

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = "retroTerminal.selectTheme";
  context.subscriptions.push(statusBarItem);
  updateStatusBar();

  context.subscriptions.push(
    vscode.commands.registerCommand("retroTerminal.selectTheme", selectTheme),
    vscode.commands.registerCommand("retroTerminal.randomTheme", randomTheme),
    vscode.commands.registerCommand("retroTerminal.resetColors", resetColors)
  );
}

export function deactivate(): void {
  // Applied colors intentionally persist across sessions; nothing to clean up.
}
