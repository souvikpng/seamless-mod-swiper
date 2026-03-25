import React from 'react';

const leftTraceOffsets = [10, 26, 44, 62];
const rightTraceOffsets = [14, 34, 54, 74];

const ThreeBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#04050a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1220_0%,#06070d_48%,#020307_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />

      <div className="absolute -left-[18%] top-[8%] h-[36rem] w-[36rem] rounded-full blur-[130px] cp-float-slow" style={{ background: 'radial-gradient(circle, rgba(252,238,10,0.18) 0%, rgba(252,238,10,0.02) 48%, rgba(252,238,10,0) 74%)' }} />
      <div className="absolute -right-[16%] top-[10%] h-[40rem] w-[40rem] rounded-full blur-[150px] cp-float-reverse" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, rgba(0,229,255,0.03) 44%, rgba(0,229,255,0) 74%)' }} />
      <div className="absolute left-[18%] top-[18%] h-[20rem] w-[20rem] rounded-full blur-[110px]" style={{ background: 'radial-gradient(circle, rgba(255,0,60,0.08) 0%, rgba(255,0,60,0) 72%)' }} />

      <div className="absolute left-[-8%] top-0 h-full w-[32%] cp-side-architecture opacity-45" />
      <div className="absolute right-[-8%] top-0 h-full w-[30%] cp-side-architecture opacity-45 scale-x-[-1]" />

      {leftTraceOffsets.map((offset, index) => (
        <div
          key={`left-trace-${offset}`}
          className="absolute left-0 h-px w-[28vw] cp-pulse-trace"
          style={{
            top: `${offset}%`,
            animationDelay: `${index * 0.9}s`,
            background: 'linear-gradient(90deg, rgba(252,238,10,0), rgba(252,238,10,0.5), rgba(252,238,10,0))',
          }}
        />
      ))}

      {rightTraceOffsets.map((offset, index) => (
        <div
          key={`right-trace-${offset}`}
          className="absolute right-0 h-px w-[30vw] cp-pulse-trace"
          style={{
            top: `${offset}%`,
            animationDelay: `${index * 0.8 + 0.4}s`,
            background: 'linear-gradient(90deg, rgba(0,229,255,0), rgba(0,229,255,0.45), rgba(0,229,255,0))',
          }}
        />
      ))}

      <div className="absolute left-1/2 top-[56%] h-[36rem] w-[90rem] -translate-x-1/2 cp-grid-plane opacity-35" />
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black via-black/35 to-transparent" />

      <div className="absolute left-[8%] top-[16%] h-32 w-32 rounded-full border border-cp-yellow/10 cp-drift-orbit" />
      <div className="absolute right-[12%] top-[20%] h-40 w-40 rounded-full border border-cp-cyan/10 cp-drift-orbit" style={{ animationDelay: '-4s' }} />
      <div className="absolute left-[12%] bottom-[16%] h-20 w-20 border border-cp-red/10 rotate-45 cp-drift-orbit" style={{ animationDelay: '-2s' }} />

      <div className="absolute inset-0 cp-hud-grid opacity-[0.12]" />
      <div className="absolute inset-0 cp-noise-soft opacity-35" />
      <div className="absolute inset-0 cp-scan-drift opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.72)_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[50rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/28 blur-[70px]" />
    </div>
  );
};

export default ThreeBackground;
