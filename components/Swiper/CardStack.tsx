import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Mod } from '../../types';
import ModCard, { SwipeSignal } from './ModCard';
import { GlitchText } from '../UI/CyberComponents';
import { LoaderCircle, XCircle, CheckCircle } from 'lucide-react';

interface CardStackProps {
  mods: Mod[];
  onApprove: (mod: Mod) => void;
  onReject: (mod: Mod) => void;
  isRefreshing?: boolean;
  onQueueChange?: (remaining: number) => void;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

const CardStack: React.FC<CardStackProps> = ({ mods, onApprove, onReject, isRefreshing = false, onQueueChange, currentIndex, onIndexChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeSignal, setSwipeSignal] = useState<SwipeSignal | null>(null);
  
  // Ref to prevent double-swipes
  const swipeInProgress = useRef(false);
  
  // Reset animation state when component mounts (view switch)
  useEffect(() => {
    setIsAnimating(false);
    setSwipeSignal(null);
    swipeInProgress.current = false;
  }, []);

  useEffect(() => {
    if (currentIndex >= mods.length) {
      setIsAnimating(false);
      setSwipeSignal(null);
      swipeInProgress.current = false;
    }
  }, [currentIndex, mods.length]);

  // Report queue changes
  useEffect(() => {
    const remaining = Math.max(0, mods.length - currentIndex - 1);
    onQueueChange?.(remaining);
  }, [currentIndex, mods.length, onQueueChange]);

  // Complete the swipe (called after animation or from drag)
  const completeSwipe = useCallback((direction: 'left' | 'right', modId: number) => {
    const currentMod = mods[currentIndex];
    const resolvedMod = currentMod?.mod_id === modId ? currentMod : mods.find((mod) => mod.mod_id === modId);

    if (!resolvedMod) {
      setIsAnimating(false);
      setSwipeSignal(null);
      swipeInProgress.current = false;
      return;
    }

    if (direction === 'left') {
      onReject(resolvedMod);
    } else {
      onApprove(resolvedMod);
    }
    
    onIndexChange(Math.min(currentIndex + 1, mods.length));
    setIsAnimating(false);
    setSwipeSignal(null);
    swipeInProgress.current = false;
  }, [currentIndex, mods, onReject, onApprove, onIndexChange]);

  // Trigger a swipe animation (for keyboard/button use)
  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (isAnimating || currentIndex >= mods.length || swipeInProgress.current) return;

    const currentMod = mods[currentIndex];
    if (!currentMod) return;
    
    swipeInProgress.current = true;
    setIsAnimating(true);
    setSwipeSignal({ direction, modId: currentMod.mod_id, nonce: Date.now() });
  }, [currentIndex, mods, isAnimating]);

  // Handle swipe from drag gesture (animation handled in ModCard)
  const handleSwipe = useCallback((direction: 'left' | 'right', modId: number) => {
    swipeInProgress.current = true;
    completeSwipe(direction, modId);
  }, [completeSwipe]);

  const handleSwipeStart = useCallback(() => {
    swipeInProgress.current = true;
    setIsAnimating(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating || currentIndex >= mods.length) return;
      
      if (e.key.toLowerCase() === 'a' || e.key === 'ArrowLeft') {
        triggerSwipe('left');
      } else if (e.key.toLowerCase() === 'd' || e.key === 'ArrowRight') {
        triggerSwipe('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mods, isAnimating, triggerSwipe]);

  if (currentIndex >= mods.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto p-8 bg-cp-dark/80 border border-cp-gray backdrop-blur-md cp-clip-box">
        {isRefreshing ? (
          <>
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cp-cyan/40 bg-black/50">
              <div className="absolute inset-0 rounded-full border border-cp-yellow/20 animate-spin" style={{ animationDuration: '2.8s' }} />
              <LoaderCircle className="h-8 w-8 animate-spin text-cp-cyan" />
            </div>
            <GlitchText active text="JACKING IN..." className="mb-3 text-3xl font-black uppercase tracking-[0.24em] text-white" />
            <p className="mb-2 font-mono text-cp-cyan">Rebuilding your queue from the Nexus uplink.</p>
            <p className="text-sm font-mono text-gray-500">Hold tight - fresh cards are being assembled.</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">🏁</div>
            <h2 className="text-3xl font-bold text-white mb-2 font-sans uppercase">Queue Depleted</h2>
            <p className="text-cp-cyan font-mono mb-4">You have swiped through the current batch.</p>
            <p className="text-gray-500 font-mono text-sm animate-pulse">Use the refresh button to build a new stack.</p>
          </>
        )}
      </div>
    );
  }

  // We render the top card and the one below it for visual stacking
  const visibleMods = mods.slice(currentIndex, currentIndex + 2).reverse();

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center">
      {/* Card container */}
      <div className="relative w-full h-[65vh] flex items-start justify-center perspective-[1000px]">
        <AnimatePresence mode="popLayout">
          {visibleMods.map((mod, index) => {
            const isTop = index === visibleMods.length - 1;
            const isCurrentCard = mods[currentIndex]?.mod_id === mod.mod_id;
            return (
              <ModCard
                key={mod.mod_id}
                mod={mod}
                onSwipe={handleSwipe}
                onSwipeStart={handleSwipeStart}
                drag={isTop && !isAnimating}
                swipeSignal={isCurrentCard ? swipeSignal : null}
                style={{
                  zIndex: isTop ? 50 : 10,
                  scale: isTop ? 1 : 0.95,
                  y: isTop ? 0 : 20,
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Visual Controls - now below the card with proper spacing */}
      <div className="flex gap-8 mt-6">
         <button 
           onClick={() => triggerSwipe('left')}
           disabled={isAnimating}
           className="w-14 h-14 rounded-full border-2 border-cp-red text-cp-red hover:bg-cp-red hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
         >
           <XCircle size={28} />
         </button>
         <button 
           onClick={() => triggerSwipe('right')}
           disabled={isAnimating}
           className="w-14 h-14 rounded-full border-2 border-cp-cyan text-cp-cyan hover:bg-cp-cyan hover:text-black transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
         >
           <CheckCircle size={28} />
         </button>
      </div>
    </div>
  );
};

export default CardStack;
