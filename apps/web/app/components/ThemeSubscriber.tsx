"use client";

import { useTheme } from "./ThemeProvider";
import { ReactNode, useEffect, useState } from "react";

export default function ThemeSubscriber({ children }: { children: ReactNode }) {
  // Subscribe to theme changes to trigger re-renders
  const { theme } = useTheme();
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [theme]);

  return <div key={renderKey}>{children}</div>;
}
