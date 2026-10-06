"use client";
import { useEffect, type RefObject } from "react";

const textSelector = "p, a, h1, h2, h3, h4, h5, h6, button, label, li, span";
function targetElement(target: EventTarget | null): Element | null {
  return target instanceof Element ? target : null;
}

export function useAccessibilityTools({ voiceMode, magnifierMode, adhdMode, rulerRef }: {
  voiceMode: boolean; magnifierMode: boolean; adhdMode: boolean; rulerRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    if (!voiceMode || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastElement: Element | null = null;
    let lastText = "";
    const cancelPending = () => { clearTimeout(timer); lastElement = null; };
    const read = (event: Event) => {
      const element = targetElement(event.target)?.closest(textSelector);
      if (!element || element.closest(".accessibility-widget-ignore, [aria-hidden='true']") || element === lastElement) return;
      clearTimeout(timer);
      lastElement = element;
      timer = setTimeout(() => {
        const text = (element.getAttribute("aria-label") || element.textContent || "").trim().slice(0, 1200);
        if (!text || text === lastText) return;
        lastText = text;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "id-ID";
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }, 150);
    };
    document.addEventListener("mouseover", read);
    document.addEventListener("focusin", read);
    document.addEventListener("mouseout", cancelPending);
    document.addEventListener("focusout", cancelPending);
    return () => {
      document.removeEventListener("mouseover", read); document.removeEventListener("focusin", read);
      document.removeEventListener("mouseout", cancelPending); document.removeEventListener("focusout", cancelPending);
      clearTimeout(timer); window.speechSynthesis.cancel();
    };
  }, [voiceMode]);

  useEffect(() => {
    if (!magnifierMode) return;
    let hovered: Element | null = null;
    const clear = () => { hovered?.classList.remove("accessibility-magnifier-hover"); hovered = null; };
    const enlarge = (event: Event) => {
      const element = targetElement(event.target);
      if (!element || element.closest(".accessibility-widget-ignore")) { clear(); return; }
      const target = element.closest("button, a") || element.closest("h1, h2, h3, h4, h5, h6, p, label, img, li, span");
      if (target === hovered) return;
      clear(); hovered = target; hovered?.classList.add("accessibility-magnifier-hover");
    };
    const leave = (event: MouseEvent | FocusEvent) => {
      if (!(event.relatedTarget instanceof Node) || !hovered?.contains(event.relatedTarget)) clear();
    };
    document.addEventListener("mouseover", enlarge); document.addEventListener("focusin", enlarge);
    document.addEventListener("mouseout", leave); document.addEventListener("focusout", leave);
    return () => {
      document.removeEventListener("mouseover", enlarge); document.removeEventListener("focusin", enlarge);
      document.removeEventListener("mouseout", leave); document.removeEventListener("focusout", leave); clear();
    };
  }, [magnifierMode]);

  useEffect(() => {
    if (!adhdMode) return;
    let frame = 0;
    const position = (y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => rulerRef.current?.style.setProperty("--focus-y", `${Math.max(25, Math.min(innerHeight - 25, y))}px`));
    };
    const move = (event: PointerEvent) => position(event.clientY);
    const focus = (event: FocusEvent) => {
      const element = targetElement(event.target);
      if (element && !element.closest(".accessibility-widget-ignore")) {
        const rect = element.getBoundingClientRect(); position(rect.top + rect.height / 2);
      }
    };
    window.addEventListener("pointermove", move); document.addEventListener("focusin", focus);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("pointermove", move); document.removeEventListener("focusin", focus); };
  }, [adhdMode, rulerRef]);
}
