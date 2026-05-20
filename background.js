/**
 * vi-tabs - background.js
 *
 * Listens for keyboard commands:
 *   Alt+Shift+1–9  → move the active tab to that position
 *   Alt+K          → switch to the tab on the left (wraps around)
 *   Alt+J          → switch to the tab on the right (wraps around)
 *
 * The tabs API uses zero-based indexing, so "position 1" maps to index 0,
 * "position 2" maps to index 1, etc.
 *
 * If the requested index exceeds the number of tabs in the window, the tab is
 * moved to the last available position (index -1 in the API).
 */

browser.commands.onCommand.addListener(async (command) => {
  // --- Navigate left / right (Alt+K and Alt+J) ---
  if (command === "navigate-tab-left" || command === "navigate-tab-right") {
    const allTabs = await browser.tabs.query({ currentWindow: true });
    const activeTab = allTabs.find((t) => t.active);
    if (!activeTab) return;

    const tabCount = allTabs.length;
    let targetIndex;

    if (command === "navigate-tab-left") {
      // Wrap around to the last tab when already on the first.
      targetIndex = activeTab.index === 0 ? tabCount - 1 : activeTab.index - 1;
    } else {
      // Wrap around to the first tab when already on the last.
      targetIndex = activeTab.index === tabCount - 1 ? 0 : activeTab.index + 1;
    }

    // Find the tab at the target index and activate it.
    const targetTab = allTabs.find((t) => t.index === targetIndex);
    if (targetTab) await browser.tabs.update(targetTab.id, { active: true });
    return;
  }

  // --- Move active tab to a numbered position (Alt+Shift+1–9) ---
  if (!command.startsWith("move-tab-")) return;

  // Parse the 1-based position from the command name (e.g. "move-tab-3" → 3).
  const position = parseInt(command.replace("move-tab-", ""), 10);
  if (isNaN(position)) return;

  // Convert to a zero-based index for the tabs API.
  const targetIndex = position - 1;

  // Retrieve the currently active tab in the focused window.
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab) return;

  // Get the total number of tabs in the current window so we can clamp the
  // target index to a valid range.
  const allTabs = await browser.tabs.query({ currentWindow: true });
  const tabCount = allTabs.length;

  // Clamp: if the target index is beyond the last tab, move to the end.
  // The tabs API accepts -1 to mean "last position", which is convenient here.
  const clampedIndex = targetIndex < tabCount ? targetIndex : -1;

  await browser.tabs.move(activeTab.id, { index: clampedIndex });
});
