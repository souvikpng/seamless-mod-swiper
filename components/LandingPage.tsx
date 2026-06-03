import React, { useState } from 'react';
import { Game } from '../types';
import { CyberButton } from './UI/CyberComponents';
import { BookOpen, Cpu, Mailbox, Radio, ScrollText, ShieldCheck } from 'lucide-react';
import { SUPPORTED_GAMES, getGamePresentation } from '../utils/gamePresentation';

interface LandingPageProps {
  onStart: (apiKey: string, game: Game) => void | Promise<void>;
  error?: string | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, error }) => {
  const [key, setKey] = useState('');
  const [game, setGame] = useState<Game>(Game.CYBERPUNK);
  const presentation = getGamePresentation(game);

  const Icon = {
    [Game.CYBERPUNK]: Cpu,
    [Game.NEWVEGAS]: Radio,
    [Game.BG3]: BookOpen,
    [Game.RDR2]: ScrollText,
    [Game.STARDEW]: Mailbox,
  }[game];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(key, game);
  };

  return (
    <div className="flex items-center justify-center p-4 relative z-10 -mt-20">
      {presentation.landingBackdropClass && <div className={`fixed inset-0 -z-10 ${presentation.landingBackdropClass}`} />}
      <div
        className={`relative w-full max-w-2xl p-10 ${presentation.landingPanelClass} ${presentation.landingAccentClass}`}
      >
        {presentation.theme === 'cyber' && (
          <>
            <div className="absolute top-0 right-0 w-16 h-1 bg-cp-yellow opacity-50" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cp-cyan" />
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1 h-1 bg-cp-red" />
              <div className="w-1 h-1 bg-cp-red" />
              <div className="w-1 h-1 bg-cp-red" />
            </div>
          </>
        )}
        
        <div className="text-center mb-12 space-y-2">
          <div className={`flex justify-center mb-4 animate-pulse ${presentation.primaryClass}`}>
            <Icon size={64} />
          </div>
          <h1 className={`text-5xl md:text-7xl font-black text-white ${presentation.titleClass}`}>
            Seamless <span className={presentation.primaryClass}>Mod</span> Swiper
          </h1>
          <p className={`font-mono text-lg tracking-widest uppercase ${presentation.secondaryClass}`}>
            {presentation.protocolLabel}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block pl-1">
              {presentation.targetLabel}
            </label>
            <div className="relative">
              <select
                value={game}
                onChange={(event) => setGame(event.target.value as Game)}
                className={`w-full appearance-none border p-4 pr-12 font-mono text-sm uppercase tracking-[0.18em] text-white outline-none transition-colors ${presentation.inputClass}`}
              >
                {SUPPORTED_GAMES.map((entry) => {
                  const option = getGamePresentation(entry);
                  return (
                    <option key={entry} value={entry} className="bg-black text-white">
                      {option.name}
                    </option>
                  );
                })}
              </select>
              <div className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${presentation.secondaryClass}`}>▾</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block pl-1">
              {presentation.accessLabel}
            </label>
            <div className="relative group">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="ENTER API KEY"
                autoComplete="off"
                required
                className={`w-full border-b-2 p-4 text-white font-mono focus:outline-none transition-colors placeholder-gray-800 ${presentation.inputClass}`}
              />
              <div className={`absolute right-4 top-4 transition-colors ${presentation.secondaryClass}`}>
                <ShieldCheck size={20} />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-mono pl-1">
              * Keys are processed in volatile memory only. No server storage.
            </p>
            {error && (
              <div className="border border-cp-red/50 bg-cp-red/10 px-3 py-2 text-xs font-mono text-cp-red">
                {error}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-center">
            {presentation.theme === 'cyber' ? (
              <CyberButton 
                label={presentation.startLabel} 
                subLabel={presentation.startSubLabel}
                type="submit"
                disabled={!key.trim()}
                className="w-full md:w-auto min-w-[200px]"
              />
            ) : (
              <button
                type="submit"
                disabled={!key.trim()}
                className={`w-full min-w-[200px] border-2 px-8 py-4 font-mono font-bold uppercase tracking-[0.22em] transition-colors disabled:cursor-not-allowed disabled:opacity-45 md:w-auto ${presentation.buttonShapeClass} ${presentation.primaryBorderClass} ${presentation.primaryBgClass} text-black hover:bg-white`}
              >
                <span className="block text-base">{presentation.startLabel}</span>
                <span className="mt-1 block text-[10px] opacity-70">{presentation.startSubLabel}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
