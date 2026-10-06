export type TextSize = "sm" | "base" | "lg" | "xl";
export type ColorFilterType = "none" | "grayscale";
export interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  dyslexiaMode: boolean;
  voiceMode: boolean;
  magnifierMode: boolean;
  adhdMode: boolean;
  colorFilter: ColorFilterType;
}
export const defaultAccessibilitySettings: AccessibilitySettings = {
  textSize: "base", highContrast: false, dyslexiaMode: false, voiceMode: false,
  magnifierMode: false, adhdMode: false, colorFilter: "none",
};
export const accessibilityStorageKeys: Record<keyof AccessibilitySettings, string> = {
  textSize: "accessibility-text-size", highContrast: "accessibility-high-contrast",
  dyslexiaMode: "accessibility-dyslexia", voiceMode: "accessibility-voice",
  magnifierMode: "accessibility-magnifier", adhdMode: "accessibility-adhd",
  colorFilter: "accessibility-color-filter",
};
export function readAccessibilitySettings(storage: Pick<Storage, "getItem">): AccessibilitySettings {
  try {
    const textSize = storage.getItem(accessibilityStorageKeys.textSize);
    const colorFilter = storage.getItem(accessibilityStorageKeys.colorFilter);
    return {
      textSize: textSize === "sm" || textSize === "lg" || textSize === "xl" ? textSize : "base",
      colorFilter: colorFilter === "grayscale" ? colorFilter : "none",
      highContrast: storage.getItem(accessibilityStorageKeys.highContrast) === "true",
      dyslexiaMode: storage.getItem(accessibilityStorageKeys.dyslexiaMode) === "true",
      voiceMode: storage.getItem(accessibilityStorageKeys.voiceMode) === "true",
      magnifierMode: storage.getItem(accessibilityStorageKeys.magnifierMode) === "true",
      adhdMode: storage.getItem(accessibilityStorageKeys.adhdMode) === "true",
    };
  } catch { return { ...defaultAccessibilitySettings }; }
}
