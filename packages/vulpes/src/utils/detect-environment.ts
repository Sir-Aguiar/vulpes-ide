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

  if (ua.includes("Windows")) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (ua.includes("Macintosh")) return "macOS";
  if (/linux|x11/i.test(ua)) return "Linux";

  return "Desconhecido";
}
