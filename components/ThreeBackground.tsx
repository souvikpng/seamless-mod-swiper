import React from 'react';

/**
 * Static Cyberpunk-themed background
 * Uses CSS gradients instead of animated Three.js for better performance
 * and a cleaner, less distracting look
 */
const ThreeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d14] to-[#0a0a0f]" />
      
      {/* Subtle cyan accent in top right */}
      <div
        className="absolute top-0 right-0 h-1/2 w-1/2"
        style={{ background: 'radial-gradient(circle at center, rgba(0,229,255,0.08) 0%, rgba(0,229,255,0) 70%)' }}
      />
      
      {/* Subtle yellow accent in bottom left */}
      <div
        className="absolute bottom-0 left-0 h-1/2 w-1/2"
        style={{ background: 'radial-gradient(circle at center, rgba(252,238,10,0.08) 0%, rgba(252,238,10,0) 72%)' }}
      />
      
      {/* Very subtle red accent */}
      <div
        className="absolute top-1/3 left-1/4 h-1/3 w-1/3 blur-3xl"
        style={{ background: 'radial-gradient(circle at center, rgba(255,0,60,0.08) 0%, rgba(255,0,60,0) 70%)' }}
      />

      {/* Faint framing grid */}
      <div className="absolute inset-0 cp-hud-grid opacity-20" />
      
      {/* Scanline overlay for CRT effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
      
      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
};

export default ThreeBackground;
