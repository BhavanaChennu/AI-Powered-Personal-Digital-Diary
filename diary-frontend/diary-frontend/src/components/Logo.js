import React from "react";

// Original illustration: a quill resting on an open book, painted in soft
// pastel pink/purple gradients with a gentle glow, echoing the reference mood
// board's style. Not copied from any existing product icon - built fresh
// with gradients/blur so it renders crisply at any size.
function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="My Diary logo">
      <defs>
        <radialGradient id="glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#f3d6f0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c9a7e8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6c9de" />
          <stop offset="100%" stopColor="#b7a4e8" />
        </linearGradient>
        <linearGradient id="pageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fffaf3" />
          <stop offset="100%" stopColor="#fbe9f2" />
        </linearGradient>
        <linearGradient id="quillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f9c6e0" />
          <stop offset="50%" stopColor="#d8b4f0" />
          <stop offset="100%" stopColor="#a7c7f2" />
        </linearGradient>
      </defs>

      {/* solid backdrop so the pastel mark stays visible on both light and dark topbars */}
      <circle cx="50" cy="50" r="49" fill="#fdf6ee" stroke="#e8c7dd" strokeWidth="1" />
      <circle cx="50" cy="50" r="48" fill="url(#glow)" />

      {/* book cover + pages */}
      <path d="M18 62 Q50 50 82 62 L82 72 Q50 62 18 72 Z" fill="url(#bookGrad)" />
      <path d="M20 60 Q50 49 80 60 L80 63 Q50 52 20 63 Z" fill="url(#pageGrad)" />
      <path d="M20 56 L50 48 L50 60 L20 62 Z" fill="url(#pageGrad)" stroke="#e8c7dd" strokeWidth="0.5" />
      <path d="M80 56 L50 48 L50 60 L80 62 Z" fill="url(#pageGrad)" stroke="#e8c7dd" strokeWidth="0.5" />

      {/* quill feather */}
      <path
        d="M52 55 C48 40 52 22 66 12 C70 24 68 34 60 42 C64 40 68 40 70 42 C62 46 56 50 52 55 Z"
        fill="url(#quillGrad)" opacity="0.95"
      />
      <line x1="52" y1="55" x2="46" y2="63" stroke="#8b6fae" strokeWidth="1.6" strokeLinecap="round" />

      {/* sparkles */}
      <circle cx="72" cy="20" r="1.6" fill="#fff" opacity="0.9" />
      <circle cx="80" cy="30" r="1" fill="#fff" opacity="0.8" />
      <circle cx="26" cy="40" r="1.2" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export default Logo;
