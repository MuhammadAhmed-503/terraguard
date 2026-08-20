"use client";

import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export default function ThemeDebug() {
  const { theme } = useTheme();
  const [htmlClass, setHtmlClass] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDOM = () => {
      const html = document.documentElement;
      setHtmlClass(html.className);
      console.log("🔍 Debug - HTML element classes:", html.className);
      console.log("🔍 Debug - Has 'dark' class:", html.classList.contains("dark"));
      console.log("🔍 Debug - Has 'light' class:", html.classList.contains("light"));
      const bodyStyle = window.getComputedStyle(document.body);
      console.log("🔍 Debug - body background:", bodyStyle.backgroundColor);
      console.log("🔍 Debug - body color:", bodyStyle.color);
    };

    checkDOM();
    const interval = setInterval(checkDOM, 500);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-slate-950 dark:bg-white p-4 rounded-lg text-white dark:text-slate-950 text-xs font-mono shadow-lg border border-slate-700 dark:border-slate-300 z-40">
      <div className="space-y-2">
        <div>
          <strong>Theme State:</strong> {theme}
        </div>
        <div>
          <strong>HTML Classes:</strong>
          <br />
          {htmlClass || "loading..."}
        </div>
        <div>
          <strong>Dark Class:</strong> {document.documentElement.classList.contains("dark") ? "✅ YES" : "❌ NO"}
        </div>
      </div>
    </div>
  );
}
