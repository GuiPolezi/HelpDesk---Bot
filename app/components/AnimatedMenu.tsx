"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedMenu() {

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuRef.current) return;

    const tl = gsap.timeline();

    // abre imediatamente
    tl.to(menuRef.current, {
      duration: 0.7,
      x: "0%",
      ease: "expo.out"
    })

    // espera 3s e fecha
    .to(menuRef.current, {
      duration: 0.7,
      x: "-100%",
      ease: "expo.inOut",
      delay: 3
    });

  }, []);

  return (
    <div ref={menuRef} className="menu">
      <h2 className="text-white text-2xl p-10">Hello World!</h2>
    </div>
  );
}