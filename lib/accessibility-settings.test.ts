import { expect, test } from "bun:test";
import { readAccessibilitySettings, defaultAccessibilitySettings } from "./accessibility-settings";
test("saved accessibility settings are validated without trusting arbitrary storage strings", () => {
 const saved = { "accessibility-text-size": "xl", "accessibility-color-filter": "grayscale", "accessibility-voice": "true" };
 expect(readAccessibilitySettings({ getItem: key => saved[key as keyof typeof saved] || null })).toMatchObject({ textSize: "xl", colorFilter: "grayscale", voiceMode: true });
 expect(readAccessibilitySettings({ getItem: () => "invalid" })).toEqual(defaultAccessibilitySettings);
});
test("unavailable browser storage falls back without breaking the page", () => {
 expect(readAccessibilitySettings({ getItem: () => { throw new Error("Storage denied"); } })).toEqual(defaultAccessibilitySettings);
});

test("removed blue filter preferences migrate to normal", () => {
 expect(readAccessibilitySettings({ getItem: key => key === "accessibility-color-filter" ? "blue" : null }).colorFilter).toBe("none");
});
