export function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Desconhecido";

  const ua = navigator.userAgent;

  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Chrome/")) return "Google Chrome";
  if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR/")) return "Opera";

  return "Desconhecido";
}

export function detectOS(): string {
  if (typeof navigator === "undefined") return "Desconhecido";

  const ua = navigator.userAgent;
  const platform = navigator.platform ?? "";

  if (/Win/i.test(platform) || ua.includes("Windows")) return "Windows";
  if (/Mac/i.test(platform) || ua.includes("Macintosh")) return "macOS";
  if (/Linux/i.test(platform) || ua.includes("Linux")) return "Linux";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";

  return "Desconhecido";
}
