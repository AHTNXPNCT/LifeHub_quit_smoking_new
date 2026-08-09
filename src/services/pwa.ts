export async function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  try { await navigator.serviceWorker.register("/sw.js", { scope: "/" }); } catch { /* приложение остаётся доступным онлайн */ }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
  return permission === "granted";
}

export async function showDailyReminder(day: number): Promise<void> {
  if (!("Notification" in window) || Notification.permission !== "granted" || !("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification("LifeHub · отметка на сегодня", {
    body: `День ${day}: выполните практику и отметьте настроение. Один день за другим.`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `lifehub-day-${new Date().toLocaleDateString("sv-SE")}`,
  });
}

export async function getInstallPrompt() {
  return null;
}
