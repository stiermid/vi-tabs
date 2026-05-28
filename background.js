browser.commands.onCommand.addListener(async (command) => {
  // --- Navigate left / right (Alt+K / Alt+J) ---
  if (command === "navigate-tab-left" || command === "navigate-tab-right") {
    const allTabs = await browser.tabs.query({ currentWindow: true });
    const activeTab = allTabs.find((t) => t.active);
    if (!activeTab) return;

    const tabCount = allTabs.length;
    let targetIndex;

    if (command === "navigate-tab-left") {
      targetIndex = activeTab.index === 0 ? tabCount - 1 : activeTab.index - 1;
    } else {
      targetIndex = activeTab.index === tabCount - 1 ? 0 : activeTab.index + 1;
    }

    const targetTab = allTabs.find((t) => t.index === targetIndex);
    if (targetTab) await browser.tabs.update(targetTab.id, { active: true });
    return;
  }

  // --- Jump to first / last tab (Alt+Shift+G / Alt+G) ---
  if (command === "navigate-tab-first" || command === "navigate-tab-last") {
    const allTabs = await browser.tabs.query({ currentWindow: true });
    if (!allTabs.length) return;

    const targetTab =
      command === "navigate-tab-first"
        ? allTabs.find((t) => t.index === 0)
        : allTabs.reduce((a, b) => (b.index > a.index ? b : a));

    if (targetTab) await browser.tabs.update(targetTab.id, { active: true });
    return;
  }

  // --- Move active tab to a numbered position (Alt+Shift+1–9) ---
  if (!command.startsWith("move-tab-")) return;

  const position = parseInt(command.replace("move-tab-", ""), 10);
  if (isNaN(position)) return;

  const targetIndex = position - 1;

  const allTabs = await browser.tabs.query({ currentWindow: true });
  const activeTab = allTabs.find((t) => t.active);
  if (!activeTab) return;

  const clampedIndex = targetIndex < allTabs.length ? targetIndex : -1;
  await browser.tabs.move(activeTab.id, { index: clampedIndex });
});
