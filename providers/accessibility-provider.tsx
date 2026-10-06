"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "next-themes";
import { accessibilityStorageKeys, defaultAccessibilitySettings, readAccessibilitySettings, type AccessibilitySettings, type TextSize, type ColorFilterType } from "@/lib/accessibility-settings";
export type { TextSize, ColorFilterType } from "@/lib/accessibility-settings";

interface AccessibilityContextType extends AccessibilitySettings {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
  setTextSize: (size: TextSize) => void;
  setHighContrast: (active: boolean) => void;
  setDyslexiaMode: (active: boolean) => void;
  setVoiceMode: (active: boolean) => void;
  setMagnifierMode: (active: boolean) => void;
  setAdhdMode: (active: boolean) => void;
  setColorFilter: (type: ColorFilterType) => void;
  resetAll: () => void;
}
const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);
const sizes: Record<TextSize, string> = { sm: "14px", base: "16px", lg: "18px", xl: "20px" };
const classes: Partial<Record<keyof AccessibilitySettings, string>> = {
  highContrast: "accessibility-high-contrast", dyslexiaMode: "accessibility-dyslexia",
  voiceMode: "accessibility-voice", magnifierMode: "accessibility-magnifier", adhdMode: "accessibility-adhd",
};

function AccessibilitySettingsProvider({ children }: { children: ReactNode }) {
  const { theme: activeTheme, setTheme } = useTheme();
  const theme = activeTheme === "dark" ? "dark" : "light";
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      let saved = { ...defaultAccessibilitySettings };
      try { saved = readAccessibilitySettings(window.localStorage); } catch { /* Storage may be disabled. */ }
      setSettings(saved);
      setLoaded(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.style.fontSize = sizes[settings.textSize];
    for (const [key, className] of Object.entries(classes)) root.classList.toggle(className, settings[key as keyof AccessibilitySettings] === true);
    root.classList.toggle("color-filter-grayscale", settings.colorFilter === "grayscale");
    for (const token of ["--primary", "--primary-foreground", "--ring", "--sidebar-ring", "--sidebar-primary"]) {
      root.style.removeProperty(token);
    }
    try {
      for (const key of Object.keys(accessibilityStorageKeys) as (keyof AccessibilitySettings)[]) localStorage.setItem(accessibilityStorageKeys[key], String(settings[key]));
    } catch { /* Settings remain usable when storage is unavailable. */ }
  }, [settings, loaded]);

  const update = <Key extends keyof AccessibilitySettings>(key: Key, value: AccessibilitySettings[Key]) => setSettings(previous => ({ ...previous, [key]: value }));
  return <AccessibilityContext.Provider value={{
    ...settings, theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    setTextSize: value => update("textSize", value), setHighContrast: value => update("highContrast", value),
    setDyslexiaMode: value => update("dyslexiaMode", value), setVoiceMode: value => update("voiceMode", value),
    setMagnifierMode: value => update("magnifierMode", value), setAdhdMode: value => update("adhdMode", value),
    setColorFilter: value => update("colorFilter", value),
    resetAll: () => { setSettings({ ...defaultAccessibilitySettings }); setTheme("light"); },
  }}>{children}</AccessibilityContext.Provider>;
}

export function AccessibilityProvider({ children, nonce }: { children: ReactNode; nonce?: string }) {
  return <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} themes={["light", "dark"]} nonce={nonce}>
    <AccessibilitySettingsProvider>{children}</AccessibilitySettingsProvider>
  </ThemeProvider>;
}
export function useAccessibility() {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error("useAccessibility must be used within an AccessibilityProvider");
  return value;
}
