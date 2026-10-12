import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function LoadingFallback({ message = "Loading page chunk..." }) {
  return (
    <div className="lazy-fallback-container">
      <div className="lazy-fallback-card">
        <div className="spinner-wrapper">
          <Loader2 className="lazy-spinner-icon" size={40} />
          <Sparkles className="lazy-sparkle-icon" size={16} />
        </div>
        <h3 className="lazy-fallback-title">Loading Route Chunk</h3>
        <p className="lazy-fallback-text">{message}</p>
        <div className="lazy-skeleton-bar">
          <div className="lazy-skeleton-shimmer"></div>
        </div>
        <div className="lazy-badge">React.lazy() • Suspense Chunk Loading</div>
      </div>
    </div>
  );
}
