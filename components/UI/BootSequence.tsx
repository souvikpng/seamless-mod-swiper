import React from 'react';
import { Database, Radar, ShieldCheck, Zap } from 'lucide-react';
import { FetchProgress, RateLimitInfo } from '../../services/nexusService';
import { Game } from '../../types';
import { getGamePresentation, isNewVegas } from '../../utils/gamePresentation';
import { GlitchText, Panel } from './CyberComponents';

interface BootSequenceProps {
  progress: FetchProgress | null;
  rateLimit: RateLimitInfo | null;
  game?: Game;
}

const PHASE_ORDER: Array<FetchProgress['phase']> = ['auth', 'pool', 'fetching', 'lists', 'complete'];

const getProgressPercent = (progress: FetchProgress | null) => {
  if (!progress || progress.total <= 0) {
    return 8;
  }

  return Math.max(8, Math.min((progress.current / progress.total) * 100, 100));
};

const BootSequence: React.FC<BootSequenceProps> = ({ progress, rateLimit, game = Game.CYBERPUNK }) => {
  const progressPercent = getProgressPercent(progress);
  const activePhase = progress?.phase ?? 'auth';
  const presentation = getGamePresentation(game);
  const mojave = isNewVegas(game);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="absolute inset-0 cp-boot-grid opacity-40" />
      <div
        className="absolute inset-0"
        style={{
          background:
            mojave
              ? 'radial-gradient(circle at top, rgba(107,191,89,0.12), transparent 35%), radial-gradient(circle at bottom left, rgba(217,144,47,0.16), transparent 30%)'
              : 'radial-gradient(circle at top, rgba(0,229,255,0.14), transparent 35%), radial-gradient(circle at bottom left, rgba(252,238,10,0.12), transparent 30%)',
        }}
      />

      <Panel theme={mojave ? 'mojave' : 'cyber'} className={`relative mx-4 w-full max-w-5xl overflow-hidden border bg-black/85 p-6 md:p-10 ${mojave ? 'rounded-sm border-[#6bbf59]/25 shadow-[0_0_80px_rgba(107,191,89,0.08)]' : 'border-cp-cyan/25 shadow-[0_0_80px_rgba(0,229,255,0.08)]'}`}>
        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${mojave ? 'via-[#6bbf59]/60' : 'via-cp-cyan/60'} to-transparent`} />

        <div className="grid gap-10 md:grid-cols-[1.15fr,0.85fr] md:items-center">
          <div className="relative flex min-h-[320px] items-center justify-center">
            <div className={`absolute h-72 w-72 rounded-full border animate-spin ${mojave ? 'border-[#6bbf59]/20' : 'border-cp-cyan/20'}`} style={{ animationDuration: '8s' }} />
            <div className={`absolute h-56 w-56 rounded-full border border-dashed animate-spin ${mojave ? 'border-[#d9902f]/40' : 'border-cp-yellow/40'}`} style={{ animationDirection: 'reverse', animationDuration: '6s' }} />
            <div className={`absolute h-40 w-40 rounded-full border animate-spin ${mojave ? 'border-[#d45f3d]/30' : 'border-cp-red/30'}`} style={{ animationDuration: '3.5s' }} />
            <div className={`absolute h-80 w-80 rounded-full blur-3xl ${presentation.softSecondaryBgClass}`} />
            <div className={`absolute h-60 w-60 rounded-full blur-3xl ${presentation.softPrimaryBgClass}`} />

            <div className={`relative flex h-36 w-36 items-center justify-center rounded-full border bg-black/70 ${mojave ? 'border-[#6bbf59]/40 shadow-[0_0_40px_rgba(107,191,89,0.12)]' : 'border-cp-cyan/40 shadow-[0_0_40px_rgba(0,229,255,0.12)]'}`}>
              <div className={`absolute inset-3 rounded-full border ${mojave ? 'border-[#d9902f]/30' : 'border-cp-yellow/30'}`} />
              <div className={`absolute inset-5 rounded-full border border-dashed animate-spin ${mojave ? 'border-[#d45f3d]/30' : 'border-cp-red/30'}`} style={{ animationDirection: 'reverse', animationDuration: '5s' }} />
              <Zap className={`h-10 w-10 ${presentation.primaryClass}`} />
            </div>

            <div className={`absolute bottom-0 left-1/2 w-[min(100%,28rem)] -translate-x-1/2 rounded-md border bg-black/70 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-gray-400 backdrop-blur-sm ${mojave ? 'border-[#6bbf59]/20' : 'border-cp-cyan/20'}`}>
              <div className="flex items-center justify-between gap-3 text-[10px] text-gray-500">
                <span>{presentation.bootProgressLabel}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-900">
                <div
                  className={`h-full bg-gradient-to-r transition-all duration-300 ${mojave ? 'from-[#d9902f] via-[#6bbf59] to-[#d45f3d]' : 'from-cp-yellow via-cp-cyan to-cp-red'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className={`text-[11px] font-mono uppercase tracking-[0.35em] ${mojave ? 'text-[#6bbf59]/80' : 'text-cp-cyan/80'}`}>
                {presentation.bootSystem}
              </div>
              <GlitchText active text={presentation.bootTitle} className="text-4xl font-black uppercase tracking-[0.24em] text-white md:text-5xl" />
              <p className="max-w-xl text-sm leading-relaxed text-gray-400 md:text-base">
                {presentation.bootDescription}
              </p>
            </div>

            <div className="grid gap-3">
              {PHASE_ORDER.map((phase) => {
                const phaseIndex = PHASE_ORDER.indexOf(phase);
                const activeIndex = PHASE_ORDER.indexOf(activePhase);
                const isComplete = phaseIndex < activeIndex || activePhase === 'complete';
                const isCurrent = phase === activePhase;

                return (
                  <div
                    key={phase}
                    className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 transition-colors ${
                      isCurrent
                        ? `${mojave ? 'border-[#6bbf59]/60 bg-[#6bbf59]/10 text-[#6bbf59]' : 'border-cp-cyan/60 bg-cp-cyan/10 text-cp-cyan'}`
                        : isComplete
                          ? `${mojave ? 'border-[#d9902f]/30 bg-[#d9902f]/10 text-[#d9902f]' : 'border-cp-yellow/30 bg-cp-yellow/10 text-cp-yellow'}`
                          : 'border-gray-800 bg-black/40 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${isCurrent ? `${presentation.secondaryBgClass} animate-pulse` : isComplete ? presentation.primaryBgClass : 'bg-gray-700'}`} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.28em]">{presentation.phaseLabels[phase]}</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em]">
                      {isCurrent ? presentation.currentState : isComplete ? presentation.completeState : presentation.waitingState}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-cp-gray bg-black/60 p-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">
                  <ShieldCheck className={`h-4 w-4 ${presentation.primaryClass}`} />
                  Status
                </div>
                <div className="mt-3 text-sm text-white">{progress?.message ?? presentation.bootStatusFallback}</div>
              </div>

              <div className="rounded-md border border-cp-gray bg-black/60 p-4">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">
                  <Database className={`h-4 w-4 ${presentation.secondaryClass}`} />
                  Throughput
                </div>
                <div className="mt-3 text-sm text-white">
                  {progress ? `${progress.current}/${progress.total || 1} operations resolved` : presentation.bootThroughputFallback}
                </div>
              </div>
            </div>

            {rateLimit && (
              <div className="rounded-md border border-cp-red/20 bg-cp-red/5 px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.24em] text-gray-500">
                  <Radar className="h-4 w-4 text-cp-red" />
                  Rate Limit Telemetry
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-300">
                  <span>Hourly: {rateLimit.hourlyRemaining}/{rateLimit.hourlyLimit}</span>
                  <span>Daily: {rateLimit.dailyRemaining}/{rateLimit.dailyLimit}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default BootSequence;
