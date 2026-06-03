import React from 'react';
import { Game } from '../types';

const leftTraceOffsets = [10, 26, 44, 62];
const rightTraceOffsets = [14, 34, 54, 74];

const CyberBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#04050a]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0b1220_0%,#06070d_48%,#020307_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
    <div className="absolute -left-[18%] top-[8%] h-[36rem] w-[36rem] rounded-full blur-[130px] cp-float-slow" style={{ background: 'radial-gradient(circle, rgba(252,238,10,0.18) 0%, rgba(252,238,10,0.02) 48%, rgba(252,238,10,0) 74%)' }} />
    <div className="absolute -right-[16%] top-[10%] h-[40rem] w-[40rem] rounded-full blur-[150px] cp-float-reverse" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.2) 0%, rgba(0,229,255,0.03) 44%, rgba(0,229,255,0) 74%)' }} />
    <div className="absolute left-[18%] top-[18%] h-[20rem] w-[20rem] rounded-full blur-[110px]" style={{ background: 'radial-gradient(circle, rgba(255,0,60,0.08) 0%, rgba(255,0,60,0) 72%)' }} />
    <div className="absolute left-[-8%] top-0 h-full w-[32%] cp-side-architecture opacity-45" />
    <div className="absolute right-[-8%] top-0 h-full w-[30%] cp-side-architecture opacity-45 scale-x-[-1]" />
    {leftTraceOffsets.map((offset, index) => (
      <div key={`left-trace-${offset}`} className="absolute left-0 h-px w-[28vw] cp-pulse-trace" style={{ top: `${offset}%`, animationDelay: `${index * 0.9}s`, background: 'linear-gradient(90deg, rgba(252,238,10,0), rgba(252,238,10,0.5), rgba(252,238,10,0))' }} />
    ))}
    {rightTraceOffsets.map((offset, index) => (
      <div key={`right-trace-${offset}`} className="absolute right-0 h-px w-[30vw] cp-pulse-trace" style={{ top: `${offset}%`, animationDelay: `${index * 0.8 + 0.4}s`, background: 'linear-gradient(90deg, rgba(0,229,255,0), rgba(0,229,255,0.45), rgba(0,229,255,0))' }} />
    ))}
    <div className="absolute left-1/2 top-[56%] h-[36rem] w-[90rem] -translate-x-1/2 cp-grid-plane opacity-35" />
    <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black via-black/35 to-transparent" />
    <div className="absolute inset-0 cp-hud-grid opacity-[0.12]" />
    <div className="absolute inset-0 cp-noise-soft opacity-35" />
    <div className="absolute inset-0 cp-scan-drift opacity-[0.05]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.18)_42%,rgba(0,0,0,0.72)_100%)]" />
  </div>
);

const MojaveBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#070604]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1a130b_0%,#0d0b07_46%,#030302_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(217,144,47,0.05),rgba(0,0,0,0.58))]" />
    <div className="absolute left-1/2 top-[10%] h-48 w-48 -translate-x-1/2 rounded-full border border-[#d9902f]/20 nv-radio-rings" />
    <div className="absolute left-1/2 top-[10%] h-80 w-80 -translate-x-1/2 rounded-full border border-[#6bbf59]/10 nv-radio-rings" style={{ animationDelay: '-2s' }} />
    <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,transparent,rgba(52,34,14,0.24)_48%,rgba(0,0,0,0.86))]" />
    <div className="absolute left-1/2 bottom-[-18%] h-[28rem] w-[120vw] -translate-x-1/2 rounded-[50%] border-t border-[#d9902f]/15 bg-[#120d06]/42" />
    <div className="absolute left-[10%] bottom-[18%] h-24 w-52 border-t border-[#d9902f]/20 opacity-60" />
    <div className="absolute right-[12%] bottom-[24%] h-28 w-44 border-t border-[#6bbf59]/15 opacity-50" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(217,144,47,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(217,144,47,0.025)_1px,transparent_1px)] bg-[length:140px_140px] opacity-35" />
    <div className="absolute inset-0 cp-noise-soft opacity-45" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.16)_44%,rgba(0,0,0,0.78)_100%)]" />
  </div>
);

const Bg3Background = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#08050d]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(181,100,247,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(216,181,109,0.14),transparent_32%),linear-gradient(180deg,#08050d,#1b0f18_52%,#050307)]" />
    <div className="absolute left-1/2 top-[48%] h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8b56d]/10 bg-[#180d20]/18 bg3-orbit" />
    <div className="absolute left-1/2 top-[48%] h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#b564f7]/18 bg3-orbit-reverse" />
    <div className="absolute left-[13%] top-[18%] h-44 w-32 rotate-[-8deg] rounded-t-full border border-[#6f4a2c]/45 bg-[#2a1718]/28 shadow-[0_20px_70px_rgba(0,0,0,0.3)]" />
    <div className="absolute right-[12%] bottom-[16%] h-52 w-36 rotate-[7deg] rounded-t-full border border-[#d8b56d]/20 bg-[#1e1024]/30 shadow-[0_20px_70px_rgba(0,0,0,0.3)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(216,181,109,0.16)_1px,transparent_1.4px)] bg-[length:74px_74px] opacity-30" />
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent" />
    <div className="absolute inset-0 cp-noise-soft opacity-30" />
  </div>
);

const RdrBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#090503]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,68,53,0.22),transparent_34%),linear-gradient(180deg,#150906,#2a1209_54%,#070403)]" />
    <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(216,177,94,0.1),transparent)]" />
    <div className="absolute left-[8%] top-[16%] h-64 w-44 rotate-[-5deg] rounded-sm border-2 border-[#6d3c22]/55 bg-[#2b1609]/32 rdr-poster" />
    <div className="absolute right-[9%] top-[22%] h-56 w-40 rotate-[5deg] rounded-sm border-2 border-[#6d3c22]/45 bg-[#1c1009]/36 rdr-poster" />
    <div className="absolute left-1/2 bottom-[-16%] h-[30rem] w-[120vw] -translate-x-1/2 rounded-[50%] bg-[#2a1209]/60" />
    <div className="absolute inset-x-0 bottom-[18%] h-px bg-gradient-to-r from-transparent via-[#d8b15e]/18 to-transparent" />
    <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(216,177,94,0.035)_0_1px,transparent_1px_74px)] opacity-55" />
    <div className="absolute inset-0 cp-noise-soft opacity-50" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.1)_38%,rgba(0,0,0,0.78)_100%)]" />
  </div>
);

const StardewBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-[#20391f]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(127,200,232,0.18),transparent_34%),linear-gradient(180deg,#284b2c_0%,#406f35_38%,#6d4a2a_76%,#21160d_100%)]" />
    <div className="absolute left-[-8%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-[#f2b84b]/12 blur-[110px] cp-float-slow" />
    <div className="absolute right-[-8%] top-[20%] h-[28rem] w-[28rem] rounded-full bg-[#7fc8e8]/12 blur-[120px] cp-float-reverse" />
    <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[repeating-linear-gradient(90deg,rgba(121,201,107,0.14)_0_42px,rgba(47,33,19,0.12)_42px_84px)] opacity-70" />
    <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#21160d] via-transparent to-transparent" />
    <div className="absolute left-[12%] bottom-[28%] h-20 w-28 rounded-t-full border border-[#f2b84b]/20 bg-[#f2b84b]/8" />
    <div className="absolute right-[14%] bottom-[30%] h-24 w-32 rounded-t-full border border-[#79c96b]/24 bg-[#79c96b]/8" />
    <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1.4px)] bg-[length:54px_54px] opacity-20" />
    <div className="absolute inset-0 cp-noise-soft opacity-20" />
  </div>
);

const ThreeBackground: React.FC<{ game?: Game }> = ({ game = Game.CYBERPUNK }) => {
  switch (game) {
    case Game.NEWVEGAS:
      return <MojaveBackground />;
    case Game.BG3:
      return <Bg3Background />;
    case Game.RDR2:
      return <RdrBackground />;
    case Game.STARDEW:
      return <StardewBackground />;
    default:
      return <CyberBackground />;
  }
};

export default ThreeBackground;
