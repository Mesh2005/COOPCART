"use client";

import { useEffect } from "react";
import { fireConfetti } from "@/lib/confetti";

/** Fires a one-off confetti burst on mount (e.g. right after an order lands). */
export function Celebrate() {
  useEffect(() => {
    fireConfetti();
  }, []);
  return null;
}
