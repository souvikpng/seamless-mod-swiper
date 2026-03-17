import React, { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate, AnimationPlaybackControls } from 'framer-motion';
import { Mod } from '../../types';
import { Panel } from '../UI/CyberComponents';
import { ThumbsUp, User, Calendar } from 'lucide-react';

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400?text=No+Image';

export interface SwipeSignal {
  direction: 'left' | 'right';
  modId: number;
  nonce: number;
}

interface ModCardProps {
  mod: Mod;
  onSwipe: (direction: 'left' | 'right', modId: number) => void;
  onSwipeStart?: () => void;
  style?: any;
  drag?: boolean | "x" | "y";
  swipeSignal?: SwipeSignal | null;
}

const SWIPE_THRESHOLD = 110;
const SWIPE_VELOCITY = 650;

const ModCard: React.FC<ModCardProps> = ({ mod, onSwipe, onSwipeStart, style, drag, swipeSignal }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  
  // Overlay colors for feedback
  const approveOpacity = useTransform(x, [40, 150], [0, 0.7]);
  const rejectOpacity = useTransform(x, [-150, -40], [0.7, 0]);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const isDismissingRef = useRef(false);

  const finishSwipe = useCallback((direction: 'left' | 'right') => {
    if (isDismissingRef.current) return;

    isDismissingRef.current = true;
    onSwipeStart?.();
    animationRef.current?.stop();

    const destination = direction === 'right' ? window.innerWidth * 0.95 : window.innerWidth * -0.95;

    animationRef.current = animate(x, destination, {
      type: 'spring',
      stiffness: 260,
      damping: 24,
      velocity: direction === 'right' ? 9 : -9,
      onComplete: () => {
        onSwipe(direction, mod.mod_id);
      },
    });
  }, [mod.mod_id, onSwipe, onSwipeStart, x]);

  useEffect(() => {
    animationRef.current?.stop();
    isDismissingRef.current = false;
    x.set(0);
  }, [mod.mod_id, x]);

  useEffect(() => {
    if (!swipeSignal || swipeSignal.modId !== mod.mod_id || isDismissingRef.current) {
      return;
    }

    finishSwipe(swipeSignal.direction);
  }, [finishSwipe, mod.mod_id, swipeSignal]);

  useEffect(() => () => {
    animationRef.current?.stop();
  }, []);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isDismissingRef.current) {
      return;
    }

    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Swipe if offset exceeds threshold or velocity is high enough
    if (offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
      finishSwipe('right');
    } else if (offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY) {
      finishSwipe('left');
    } else {
      // Snap back to center
      animationRef.current?.stop();
      animationRef.current = animate(x, 0, { type: 'spring', stiffness: 420, damping: 28, mass: 0.65 });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, WebkitUserDrag: 'none', touchAction: 'pan-y', ...style } as any}
      drag={drag ? "x" : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.18}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.97, opacity: 0, y: 18 }}
      animate={{ 
        scale: style?.scale ?? 1, 
        opacity: 1,
        y: style?.y ?? 0,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.72 }}
      className="absolute w-full max-w-md h-[65vh] cursor-grab active:cursor-grabbing select-none"
    >
      <Panel className="h-full flex flex-col p-0 border-l-4 border-cp-yellow bg-black overflow-hidden relative select-none">
        
        {/* Approve Overlay */}
        <motion.div 
          style={{ opacity: approveOpacity }} 
          className="absolute inset-0 bg-green-500/30 z-20 flex items-center justify-center pointer-events-none"
        >
          <div className="border-4 border-green-500 text-green-500 font-bold text-6xl px-8 py-4 -rotate-12 uppercase tracking-widest">
            Install
          </div>
        </motion.div>

        {/* Reject Overlay */}
        <motion.div 
          style={{ opacity: rejectOpacity }} 
          className="absolute inset-0 bg-red-500/30 z-20 flex items-center justify-center pointer-events-none"
        >
          <div className="border-4 border-red-500 text-red-500 font-bold text-6xl px-8 py-4 rotate-12 uppercase tracking-widest">
            Skip
          </div>
        </motion.div>

        {/* Image */}
        <div className="relative h-1/2 w-full overflow-hidden group">
          <img 
            src={mod.picture_url || FALLBACK_IMAGE} 
            alt={mod.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          
           <div className="absolute bottom-4 left-4 right-4 z-10">
            <h2 className="text-3xl font-bold text-white uppercase leading-none drop-shadow-md tracking-tighter line-clamp-2">
              {mod.name || 'Unknown Mod'}
            </h2>
            <div className="flex items-center gap-2 text-cp-yellow text-sm font-mono mt-1">
              <User size={14} />
              <span>{mod.author || mod.uploaded_by || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col justify-between relative bg-cp-dark" style={{ userSelect: 'none' }}>
          {/* Scanline overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-0" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
               <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                 <Calendar size={12} />
                 <span>
                   {mod.created_timestamp 
                     ? new Date(mod.created_timestamp * 1000).toLocaleDateString()
                     : mod.created_time || 'Unknown'}
                 </span>
               </div>
               <div className="flex items-center gap-2 text-cp-cyan text-sm font-bold">
                 <ThumbsUp size={14} />
                 <span>{(mod.endorsement_count ?? 0).toLocaleString()}</span>
               </div>
            </div>

             <div className="flex-1 overflow-hidden pr-2 mb-4">
               <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line font-mono line-clamp-6">
                 {mod.summary || "No summary provided."}
               </p>
             </div>

            <div className="flex gap-2 mt-auto">
               {/* Decorative footer bits */}
               <div className="h-1 flex-1 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-cp-yellow" />
               </div>
               {mod.version && (
                 <div className="text-[10px] text-gray-600 font-mono">V. {mod.version}</div>
               )}
            </div>
          </div>
        </div>
      </Panel>
    </motion.div>
  );
};

export default ModCard;
