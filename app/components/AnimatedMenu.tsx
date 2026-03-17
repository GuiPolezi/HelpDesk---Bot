"use client";

import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import SplitText from "gsap/SplitText";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import CustomEase from "gsap/CustomEase";
gsap.registerPlugin(SplitText, ScrambleTextPlugin, CustomEase);
export default function AnimatedMenu() {
  const textRef = useRef(null);
  const menuRef = useRef<HTMLDivElement>(null);

   useLayoutEffect(() => {
  if (!menuRef.current || !textRef.current) return;

  const ctx = gsap.context(() => {
    const katakana = ["ア","イ","ウ","エ","オ","カ","ガ","キ","ギ","ク"];
    const split = new SplitText(textRef.current, { type: "chars" });

    const message = "¡HelpDesk!".split("");

    const chars = katakana.join("");
    const charsPerSecond = 1 / 3;
    const totalDuration = katakana.length / charsPerSecond / 60;
    const charDuration = totalDuration / message.length;

    const tl = gsap.timeline();

    // 👉 1. ABRE MENU
    tl.to(menuRef.current, {
      duration: 0.7,
      x: "0%",
      ease: "expo.out"
    });

    // 👉 2. TEXTO COMEÇA DEPOIS QUE ABRIR
    message.forEach((letter, index) => {
      const el = split.chars[index];
      const duration = charDuration * (index + 1);
      const revealDelay = charDuration * index;

      tl.to(
        el,
        {
          duration,
          scrambleText: {
            text: letter,
            chars,
            revealDelay
          },
          ease: CustomEase.create(
            "custom",
            "M0,0 C0,0 0.815,0.1 0.9,0.1 1,0.1 1,0.5 1,1"
          )
        },
        ">" // 🔥 começa após a animação anterior
      );
    });

    // 👉 3. FECHA MENU depois
    tl.to(menuRef.current, {
      duration: 0.7,
      x: "-100%",
      ease: "expo.inOut"
    }, "+=1"); // espera 1s após texto

  }, menuRef);

  return () => ctx.revert();
}, []);

  return (
    <div ref={menuRef} className="menu">
      <div className="flex flex-col items-center justify-center h-full">
        <img src="/wall-e.png" alt="wall-e" width={200} height={200}/>
        <h2 ref={textRef} className="message text-black text-2xl p-10" style={{fontWeight: "bolder", fontSize: "60px"}}>ゼヅヌヂハネヅウオシ</h2>
      </div>
    </div>
  );
}