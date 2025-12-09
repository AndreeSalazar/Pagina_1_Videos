"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TransitionEpic() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), 900);
    return () => clearTimeout(t);
  }, [pathname]);
  return (
    <div className={`epic-overlay ${active ? "show" : "hide"}`} aria-hidden>
      <div className="epic-sweep" />
    </div>
  );
}

