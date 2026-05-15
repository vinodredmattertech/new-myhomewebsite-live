import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

let registered = false;
export function registerGsap() {
  if (typeof window === "undefined") return;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

export const ease = {
  smooth: "cubic-bezier(0.65,0,0.35,1)",
  premium: "expo.out",
  enter: "power3.out",
  outIn: "power2.inOut",
};

export function splitToWords(node) {
  if (!node) return [];
  const original = node.textContent || "";
  node.textContent = "";
  const frag = document.createDocumentFragment();
  const spans = [];
  original.split(/(\s+)/).forEach((part) => {
    if (/^\s+$/.test(part)) {
      frag.appendChild(document.createTextNode(part));
    } else if (part.length) {
      const wrap = document.createElement("span");
      wrap.style.display = "inline-block";
      wrap.style.overflow = "hidden";
      wrap.style.lineHeight = "1.1";
      const inner = document.createElement("span");
      inner.style.display = "inline-block";
      inner.style.willChange = "transform";
      inner.textContent = part;
      wrap.appendChild(inner);
      frag.appendChild(wrap);
      spans.push(inner);
    }
  });
  node.appendChild(frag);
  return spans;
}

export { gsap, ScrollTrigger };
