"use client";
import { useEffect, useState } from "react";

export function useNow(interval = 1000) {
  const [now, setNow] = useState(0);
  useEffect(() => { const start = window.setTimeout(() => setNow(Date.now()), 0); const id = window.setInterval(() => setNow(Date.now()), interval); return () => { window.clearTimeout(start); window.clearInterval(id); }; }, [interval]);
  return now;
}
