import React from "react";

export default function NavArrows({ light = false, onPrev, onNext, className = "" }) {
  const cls = light ? "mh-nav-arrow mh-nav-arrow--light" : "mh-nav-arrow";
  return (
    <div className={`flex items-center gap-3 lg:gap-5 ${className}`}>
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrev}
        className={cls}
      >
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0.293 6.293L6.586 0 8 1.414 4.414 5 22 5v2H4.414L8 10.586 6.586 12 .293 5.707a1 1 0 010-1.414z" fill="currentColor"/>
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        className={cls}
      >
        <svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.707 7.707L15.414 14 14 12.586 17.586 9H0V7h17.586L14 3.414 15.414 2l6.293 6.293a1 1 0 010 1.414z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  );
}
