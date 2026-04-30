import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mod } from '../../types';
import ModCard, { SwipeSignal } from './ModCard';
import { GlitchText } from '../UI/CyberComponents';
import { CheckCircle, LoaderCircle, Undo2, XCircle } from 'lucide-react';
import { FALLBACK_IMAGE_URL, getModAuthorName, safeImageUrl } from '../../utils/modPresentation';

interface UndoAnimationSignal {
  mod: Mod;
  direction: 'left' | 'right';
  nonce: number;
}

interface OutgoingSwipe {
  mod: Mod;
  direction: 'left' | 'right';
  nonce: number;
}

interface CardStackProps {
  mods: Mod[];
  onApprove: (mod: Mod) => void;
  onReject: (mod: Mod) => void;
  isRefreshing?: boolean;
  onQueueChange?: (remaining: number) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  canUndo?: boolean;
  onUndo?: () => void;
  undoSignal?: UndoAnimationSignal | null;
  isIntroPlaying?: boolean;
  introNonce?: number;
  onIntroComplete?: () => void;
}

interface DeckIntroOverlayProps {
  active: boolean;
  mod?: Mod;
}

interface UndoRecallOverlayProps {
  mod: Mod;
}

interface OutgoingSwipeOverlayProps {
  swipe: OutgoingSwipe;
}

const INTRO_DURATION_MS = 1720;
const UNDO_DURATION_MS = 760;
const OUTGOING_SWIPE_DURATION_MS = 320;

const preloadImage = (src?: string) => {
  if (!src) return;
  const image = new Image();
  image.referrerPolicy = 'no-referrer';
  image.src = src;
};

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE_URL;
};

const CardBack: React.FC<{ accent?: 'yellow' | 'cyan'; className?: string }> = ({ accent = 'yellow', className = '' }) => {
  const accentClasses = accent === 'yellow'
    ? 'border-cp-yellow/45 shadow-[0_20px_60px_rgba(252,238,10,0.14)]'
    : 'border-cp-cyan/35 shadow-[0_20px_60px_rgba(0,229,255,0.12)]';

  return (
    <div className={`absolute inset-0 overflow-hidden cp-clip-box border bg-[linear-gradient(145deg,#141111,#09090d_45%,#08070b)] ${accentClasses} ${className}`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(252,238,10,0.16),transparent_36%,rgba(0,229,255,0.08)_72%,transparent)]" />
      <div className="absolute inset-5 border border-white/5" />
      <div className="absolute inset-x-8 top-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.34em] text-gray-500">
        <span>Stack</span>
        <span>Sync</span>
      </div>
      <div className="absolute inset-x-8 top-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-x-8 bottom-16 grid gap-3">
        <div className="h-2 w-28 bg-white/10" />
        <div className="h-2 w-36 bg-white/8" />
        <div className="h-2 w-20 bg-white/6" />
      </div>
      <div className="absolute left-8 top-1/2 h-16 w-16 -translate-y-1/2 rotate-45 border border-white/8" />
      <div className="absolute right-10 top-[38%] h-24 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
      <div className="absolute right-8 top-[38%] h-px w-20 bg-gradient-to-r from-white/20 to-transparent" />
    </div>
  );
};

const DeckIntroOverlay: React.FC<DeckIntroOverlayProps> = ({ active, mod }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={`intro-${mod?.mod_id ?? 'deck'}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.24 } }}
          className="pointer-events-none absolute inset-0 z-[72] flex items-start justify-center"
        >
          <div className="relative h-[65vh] w-full max-w-md perspective-[1400px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 36 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.92, 1, 1, 1.02], y: [36, 0, 0, -12] }}
              transition={{ duration: 1.18, delay: 0.44, times: [0, 0.18, 0.72, 1] }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 border border-cp-yellow/25 bg-black/70 px-5 py-3 backdrop-blur-md"
            >
              <GlitchText active text="DECK PRIMING" className="font-mono text-xs uppercase tracking-[0.42em] text-cp-yellow" />
            </motion.div>

            {[2, 1, 0].map((layer) => (
              <motion.div
                key={`back-${layer}`}
                initial={{ opacity: 0, y: 110 - layer * 18, rotateX: 68, rotateZ: layer === 0 ? -7 : layer === 1 ? 4 : -2, scale: 0.84 + layer * 0.03 }}
                animate={{ opacity: 1, y: layer * 18, rotateX: 0, rotateZ: layer === 0 ? -1 : layer === 1 ? 2 : -2, scale: layer === 0 ? 1 : 0.965 - layer * 0.008 }}
                transition={{ duration: 0.62, delay: layer * 0.12, ease: [0.19, 1, 0.22, 1] }}
                className="absolute inset-0"
                style={{ zIndex: 80 + layer, transformStyle: 'preserve-3d' }}
              >
                <CardBack accent={layer === 0 ? 'yellow' : 'cyan'} />
              </motion.div>
            ))}

            {mod && (
              <motion.div
                initial={{ opacity: 0, rotateY: 180, scale: 0.98, y: 6 }}
                animate={{ opacity: [0, 0, 1, 1], rotateY: [180, 180, 0, 0], scale: [0.98, 0.98, 1, 1], y: [6, 6, 0, 0] }}
                transition={{ duration: 1.08, delay: 0.42, times: [0, 0.44, 0.78, 1], ease: [0.19, 1, 0.22, 1] }}
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 overflow-hidden cp-clip-box border-l-4 border-cp-yellow border border-cp-cyan/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                  <img src={safeImageUrl(mod.picture_url)} alt="" onError={handleImageError} referrerPolicy="no-referrer" className="h-1/2 w-full object-cover opacity-70" draggable={false} />
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-black via-transparent to-black/10" />
                  <div className="absolute inset-x-5 top-[42%]">
                    <h3 className="line-clamp-2 text-3xl font-black uppercase leading-none tracking-tight text-white">{mod.name || 'Unknown Mod'}</h3>
                    <p className="mt-2 font-mono text-sm text-cp-yellow">{getModAuthorName(mod)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UndoRecallOverlay: React.FC<UndoRecallOverlayProps> = ({ mod }) => {
  return (
    <AnimatePresence>
      <motion.div
        key={`undo-${mod.mod_id}`}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none absolute inset-0 z-[78] flex items-start justify-center perspective-[1200px]"
      >
        <motion.div
          initial={{ x: -340, y: 18, rotate: -12, rotateY: 180, scale: 0.88, opacity: 0.9 }}
          animate={{ x: 0, y: 0, rotate: 0, rotateY: 360, scale: 1, opacity: 1 }}
          transition={{ duration: 0.72, ease: [0.19, 1, 0.22, 1] }}
          className="relative h-[65vh] w-full max-w-md"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <CardBack className="shadow-[0_18px_50px_rgba(252,238,10,0.18)]" />
          <div
            className="absolute inset-0 overflow-hidden cp-clip-box border-l-4 border-cp-yellow border border-cp-cyan/20 bg-black"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <img src={safeImageUrl(mod.picture_url)} alt="" onError={handleImageError} referrerPolicy="no-referrer" className="h-1/2 w-full object-cover opacity-60" draggable={false} />
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-black via-transparent to-black/20" />
            <div className="absolute inset-x-5 top-[42%]">
              <h3 className="line-clamp-2 text-3xl font-black uppercase leading-none tracking-tight text-white">{mod.name || 'Unknown Mod'}</h3>
              <p className="mt-2 font-mono text-sm text-cp-yellow">{getModAuthorName(mod)}</p>
            </div>
            <div className="absolute inset-x-5 bottom-12 border border-cp-cyan/20 bg-black/55 px-4 py-3 backdrop-blur-sm">
              <GlitchText active text="RECALL CONFIRMED" className="font-mono text-xs uppercase tracking-[0.32em] text-cp-cyan" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const OutgoingSwipeOverlay: React.FC<OutgoingSwipeOverlayProps> = ({ swipe }) => {
  const exitX = swipe.direction === 'right' ? 540 : -540;
  const exitRotate = swipe.direction === 'right' ? 12 : -12;

  return (
    <motion.div
      initial={{ x: 0, rotate: 0, opacity: 1, scale: 1 }}
      animate={{ x: exitX, rotate: exitRotate, opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
      className="pointer-events-none absolute inset-0 z-[68]"
    >
      <div className="relative h-full w-full overflow-hidden cp-clip-box border-l-4 border-cp-yellow border border-cp-cyan/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <img src={safeImageUrl(swipe.mod.picture_url)} alt="" onError={handleImageError} referrerPolicy="no-referrer" className="h-1/2 w-full object-cover opacity-75" draggable={false} />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-t from-black via-transparent to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className={`absolute inset-0 ${swipe.direction === 'right' ? 'bg-cp-cyan/16' : 'bg-cp-red/16'}`} />
        <div className="absolute inset-x-5 top-[42%]">
          <h3 className="line-clamp-2 text-3xl font-black uppercase leading-none tracking-tight text-white">{swipe.mod.name || 'Unknown Mod'}</h3>
          <p className="mt-2 font-mono text-sm text-cp-yellow">{getModAuthorName(swipe.mod)}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CardStack: React.FC<CardStackProps> = ({
  mods,
  onApprove,
  onReject,
  isRefreshing = false,
  onQueueChange,
  currentIndex,
  onIndexChange,
  canUndo = false,
  onUndo,
  undoSignal,
  isIntroPlaying = false,
  introNonce = 0,
  onIntroComplete,
}) => {
  const [swipeSignal, setSwipeSignal] = useState<SwipeSignal | null>(null);
  const [introActive, setIntroActive] = useState(false);
  const [activeUndo, setActiveUndo] = useState<UndoAnimationSignal | null>(null);
  const [outgoingSwipe, setOutgoingSwipe] = useState<OutgoingSwipe | null>(null);

  const swipeInProgress = useRef(false);
  const outgoingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    swipeInProgress.current = false;
    setSwipeSignal(null);
  }, []);

  useEffect(() => {
    if (!isIntroPlaying) {
      setIntroActive(false);
      return;
    }

    setIntroActive(true);
    const timer = window.setTimeout(() => {
      setIntroActive(false);
      onIntroComplete?.();
    }, INTRO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [introNonce, isIntroPlaying, onIntroComplete]);

  useEffect(() => {
    if (!undoSignal) {
      return;
    }

    setActiveUndo(undoSignal);
    const timer = window.setTimeout(() => {
      setActiveUndo(null);
    }, UNDO_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [undoSignal]);

  useEffect(() => {
    if (outgoingTimerRef.current !== null) {
      window.clearTimeout(outgoingTimerRef.current);
      outgoingTimerRef.current = null;
    }

    return () => {
      if (outgoingTimerRef.current !== null) {
        window.clearTimeout(outgoingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const remaining = Math.max(0, mods.length - currentIndex - 1);
    onQueueChange?.(remaining);
  }, [currentIndex, mods.length, onQueueChange]);

  useEffect(() => {
    mods.slice(currentIndex, currentIndex + 2).forEach((mod) => preloadImage(safeImageUrl(mod.picture_url)));
  }, [currentIndex, mods]);

  const clearSwipeFlagNextFrame = () => {
    window.requestAnimationFrame(() => {
      swipeInProgress.current = false;
    });
  };

  const commitSwipe = useCallback((direction: 'left' | 'right', modId: number) => {
    const currentMod = mods[currentIndex];
    const resolvedMod = currentMod?.mod_id === modId ? currentMod : mods.find((mod) => mod.mod_id === modId);

    if (!resolvedMod) {
      setSwipeSignal(null);
      clearSwipeFlagNextFrame();
      return;
    }

    const overlay = { mod: resolvedMod, direction, nonce: Date.now() };
    setOutgoingSwipe(overlay);

    if (outgoingTimerRef.current !== null) {
      window.clearTimeout(outgoingTimerRef.current);
    }

    outgoingTimerRef.current = window.setTimeout(() => {
      setOutgoingSwipe((prev) => (prev?.nonce === overlay.nonce ? null : prev));
    }, OUTGOING_SWIPE_DURATION_MS);

    if (direction === 'left') {
      onReject(resolvedMod);
    } else {
      onApprove(resolvedMod);
    }

    onIndexChange(Math.min(currentIndex + 1, mods.length));
    setSwipeSignal(null);
    clearSwipeFlagNextFrame();
  }, [currentIndex, mods, onApprove, onIndexChange, onReject]);

  const controlsLocked = introActive || Boolean(activeUndo);

  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (controlsLocked || currentIndex >= mods.length || swipeInProgress.current) return;

    const currentMod = mods[currentIndex];
    if (!currentMod) return;

    swipeInProgress.current = true;
    setSwipeSignal({ direction, modId: currentMod.mod_id, nonce: Date.now() });
  }, [controlsLocked, currentIndex, mods]);

  const handleSwipe = useCallback((direction: 'left' | 'right', modId: number) => {
    if (controlsLocked || swipeInProgress.current && !swipeSignal) {
      return;
    }

    swipeInProgress.current = true;
    commitSwipe(direction, modId);
  }, [commitSwipe, controlsLocked, swipeSignal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key.toLowerCase() === 'z' || e.key === 'Backspace') && canUndo && !controlsLocked) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      if (controlsLocked || currentIndex >= mods.length || swipeInProgress.current) return;

      if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
        triggerSwipe('left');
      } else if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') {
        triggerSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, controlsLocked, currentIndex, mods.length, onUndo, triggerSwipe]);

  if (currentIndex >= mods.length) {
    return (
      <div className="mx-auto max-w-md cp-clip-box border border-cp-gray bg-cp-dark/80 p-8 text-center backdrop-blur-md">
        {isRefreshing ? (
          <>
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cp-cyan/40 bg-black/50 mx-auto">
              <div className="absolute inset-0 rounded-full border border-cp-yellow/20 animate-spin" style={{ animationDuration: '2.8s' }} />
              <LoaderCircle className="h-8 w-8 animate-spin text-cp-cyan" />
            </div>
            <GlitchText active text="JACKING IN..." className="mb-3 text-3xl font-black uppercase tracking-[0.24em] text-white" />
            <p className="mb-2 font-mono text-cp-cyan">Rebuilding your queue from the Nexus uplink.</p>
            <p className="text-sm font-mono text-gray-500">Hold tight - fresh cards are being assembled.</p>
          </>
        ) : (
          <>
            <div className="mb-4 text-6xl">🏁</div>
            <h2 className="mb-2 text-3xl font-bold uppercase text-white font-sans">Queue Depleted</h2>
            <p className="mb-4 font-mono text-cp-cyan">You have swiped through the current batch.</p>
            <p className="text-sm font-mono text-gray-500 animate-pulse">Use the refresh button to build a new stack.</p>
            {canUndo && (
              <button
                type="button"
                onClick={() => onUndo?.()}
                className="cp-clip-btn mt-6 border border-gray-700 bg-black/55 px-4 py-3 text-gray-400 transition-colors hover:border-cp-yellow/50 hover:text-cp-yellow"
              >
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em]">
                  <Undo2 size={14} />
                  Undo Last Swipe
                </span>
              </button>
            )}
          </>
        )}
      </div>
    );
  }

  const visibleMods = mods.slice(currentIndex, currentIndex + 2).reverse();
  const topMod = mods[currentIndex];
  const shouldGhostTopCard = Boolean(outgoingSwipe && topMod && outgoingSwipe.mod.mod_id === topMod.mod_id);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col items-center">
      <div className="relative flex h-[65vh] w-full items-start justify-center perspective-[1100px]">
        <motion.div
          animate={introActive ? { opacity: 0, scale: 0.94 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.24 }}
          className="absolute inset-0"
        >
          <AnimatePresence mode="popLayout">
            {visibleMods.map((mod, index) => {
              const isTop = index === visibleMods.length - 1;
              const isCurrentCard = mods[currentIndex]?.mod_id === mod.mod_id;

              return (
                <ModCard
                  key={mod.mod_id}
                  mod={mod}
                  onSwipe={handleSwipe}
                  drag={isTop && !controlsLocked}
                  swipeSignal={isCurrentCard ? swipeSignal : null}
                  variant={isTop ? 'active' : 'preview'}
                  isGhosted={isTop ? shouldGhostTopCard : false}
                  style={{
                    zIndex: isTop ? 50 : 12,
                    scale: isTop ? 1 : 0.94,
                    y: isTop ? 0 : 26,
                  }}
                />
              );
            })}
          </AnimatePresence>
          {outgoingSwipe && <OutgoingSwipeOverlay swipe={outgoingSwipe} />}
        </motion.div>

        <DeckIntroOverlay active={introActive} mod={topMod} />
        {activeUndo && <UndoRecallOverlay mod={activeUndo.mod} />}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onUndo?.()}
          disabled={!canUndo || controlsLocked || swipeInProgress.current}
          className="cp-clip-btn border border-gray-700 bg-black/55 px-4 py-3 text-gray-400 transition-colors hover:border-cp-yellow/50 hover:text-cp-yellow disabled:cursor-not-allowed disabled:opacity-35"
        >
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em]">
            <Undo2 size={14} />
            Undo
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerSwipe('left')}
          disabled={controlsLocked || swipeInProgress.current}
          className="cp-clip-btn min-w-[8.75rem] border border-cp-red/45 bg-black/60 px-5 py-3 text-cp-red transition-all hover:border-cp-red hover:bg-cp-red/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="flex items-center justify-between gap-4 font-mono uppercase tracking-[0.24em]">
            <span className="flex items-center gap-2 text-sm font-bold"><XCircle size={18} /> Reject</span>
            <span className="text-[10px] text-gray-500">[A]</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => triggerSwipe('right')}
          disabled={controlsLocked || swipeInProgress.current}
          className="cp-clip-btn min-w-[8.75rem] border border-cp-cyan/45 bg-black/60 px-5 py-3 text-cp-cyan transition-all hover:border-cp-cyan hover:bg-cp-cyan/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span className="flex items-center justify-between gap-4 font-mono uppercase tracking-[0.24em]">
            <span className="flex items-center gap-2 text-sm font-bold"><CheckCircle size={18} /> Approve</span>
            <span className="text-[10px] text-gray-500">[D]</span>
          </span>
        </button>
      </div>
    </div>
  );
};

export default CardStack;
