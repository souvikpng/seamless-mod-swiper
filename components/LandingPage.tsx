import React, { useState } from 'react';
import { Game } from '../types';
import { GAME_THEMES } from '../constants';
import { CyberButton } from './UI/CyberComponents';
import { Cpu, Radio, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onStart: (apiKey: string, game: Game) => void | Promise<void>;
  error?: string | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, error }) => {
  const [key, setKey] = useState('');
  const [game, setGame] = useState<Game>(Game.CYBERPUNK);
  const theme = GAME_THEMES[game];
  const isNewVegas = game === Game.NEWVEGAS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(key, game);
  };

  return (
    <div className="flex items-center justify-center p-4 relative z-10 -mt-20">
      {isNewVegas && (
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(102,64,24,0.22),transparent_42%),linear-gradient(180deg,#090806,#151009_48%,#070604_100%)]" />
      )}
      <div
        className={isNewVegas
          ? 'w-full max-w-2xl rounded-sm border-2 border-[#d9902f] bg-[#080704]/92 p-10 shadow-[0_18px_80px_rgba(0,0,0,0.55),0_0_45px_rgba(217,144,47,0.12)]'
          : 'w-full max-w-2xl cp-clip-box relative border-l-2 border-cp-yellow bg-cp-dark/90 p-10 backdrop-blur-sm border-2 border-cp-yellow shadow-[0_0_50px_rgba(252,238,10,0.2)]'
        }
      >
        {isNewVegas ? (
          <>
            <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#4b2e14] via-[#d9902f] to-[#4b2e14]" />
            <div className="absolute inset-x-6 top-5 flex justify-between font-mono text-[10px] text-[#9f7a43]">
              <span>MOJAVE RELAY</span>
              <span>2281</span>
            </div>
          </>
        ) : (
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
          <div className={`flex justify-center mb-4 animate-pulse ${isNewVegas ? 'text-[#d9902f]' : 'text-cp-yellow'}`}>
            {isNewVegas ? <Radio size={64} /> : <Cpu size={64} />}
          </div>
          <h1 className={`text-5xl md:text-7xl font-black text-white uppercase tracking-tighter ${isNewVegas ? 'font-mono tracking-[-0.04em]' : 'transform -skew-x-6'}`}>
            Seamless <span style={{ color: theme.primary }}>Mod</span> Swiper
          </h1>
          <p className={`font-mono text-lg tracking-widest uppercase ${isNewVegas ? 'text-[#6bbf59]' : 'text-cp-cyan'}`}>
            {isNewVegas ? 'Mojave Uplink V.2281' : 'Nexus Protocol V.2.0.77'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block pl-1">
              {isNewVegas ? 'Radio Territory (Game)' : 'Target System (Game)'}
            </label>
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
               <button 
                 type="button"
                 onClick={() => setGame(Game.CYBERPUNK)}
                 className={`p-4 border ${game === Game.CYBERPUNK ? 'bg-cp-yellow text-black border-cp-yellow' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
               >
                 CP2077
               </button>
               <button 
                 type="button"
                  onClick={() => setGame(Game.NEWVEGAS)}
                  className={`p-4 border uppercase tracking-wider transition-colors ${
                    game === Game.NEWVEGAS
                      ? 'bg-[#d9902f] text-black border-[#f7c46c] shadow-[0_0_18px_rgba(217,144,47,0.28)]'
                      : 'border-[#4c3b22] text-[#9f7a43] hover:border-[#d9902f] hover:text-[#f7c46c]'
                  }`}
                >
                  New Vegas
                </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block pl-1">
              {isNewVegas ? 'Courier Passcode (Nexus API)' : 'Access Token (Nexus API)'}
            </label>
            <div className="relative group">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="ENTER API KEY"
                autoComplete="off"
                required
                className={`w-full border-b-2 p-4 text-white font-mono focus:outline-none transition-colors placeholder-gray-800 ${isNewVegas ? 'bg-[#12100a] border-[#4c3b22] focus:border-[#6bbf59]' : 'bg-cp-dark border-gray-700 focus:border-cp-cyan'}`}
              />
              <div className={`absolute right-4 top-4 text-gray-700 transition-colors ${isNewVegas ? 'group-focus-within:text-[#6bbf59]' : 'group-focus-within:text-cp-cyan'}`}>
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
            {isNewVegas ? (
              <button
                type="submit"
                disabled={!key.trim()}
                className="w-full min-w-[200px] rounded-sm border-2 border-[#d9902f] bg-[#d9902f] px-8 py-4 font-mono font-bold uppercase tracking-[0.22em] text-black transition-colors hover:bg-[#f7c46c] disabled:cursor-not-allowed disabled:opacity-45 md:w-auto"
              >
                <span className="block text-base">Start Mojave Run</span>
                <span className="mt-1 block text-[10px] opacity-70">Tune Relay</span>
              </button>
            ) : (
              <CyberButton 
                label="Initialize Connection" 
                subLabel="Establish Uplink"
                type="submit"
                disabled={!key.trim()}
                className="w-full md:w-auto min-w-[200px]"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LandingPage;
