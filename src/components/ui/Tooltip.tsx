"use client";

import { useState, useId } from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
};

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex items-center">
      <span
        aria-describedby={id}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex items-center"
      >
        {children}
      </span>
      {visible && (
        <span
          id={id}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded bg-zinc-800 px-3 py-1.5 text-xs text-white shadow-lg max-w-xs text-center pointer-events-none"
        >
          {content}
        </span>
      )}
    </span>
  );
}
