import { useRef, useEffect } from "react";

export function useDragToScroll() {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e) => {
    // Avoid triggering drag on interactive buttons/inputs
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) {
      return;
    }
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX - ref.current.offsetLeft;
    scrollLeft.current = ref.current.scrollLeft;
    ref.current.style.cursor = "grabbing";
    ref.current.style.userSelect = "none";
  };

  const onMouseLeave = () => {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.removeProperty("user-select");
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (ref.current) {
      ref.current.style.cursor = "grab";
      ref.current.style.removeProperty("user-select");
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag speed multiplier
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  const onWheel = (e) => {
    if (!ref.current) return;
    // Enable horizontal scrolling with vertical mouse wheel
    if (Math.abs(e.deltaX) === 0 && e.deltaY !== 0) {
      // Check if can scroll horizontally
      const maxScrollLeft = ref.current.scrollWidth - ref.current.clientWidth;
      if (maxScrollLeft > 0) {
        ref.current.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  const scrollLeftBy = (amount = 350) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -amount, behavior: "smooth" });
    }
  };

  const scrollRightBy = (amount = 350) => {
    if (ref.current) {
      ref.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return {
    ref,
    scrollLeftBy,
    scrollRightBy,
    events: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove,
      onWheel,
      style: { cursor: "grab" }
    }
  };
}
