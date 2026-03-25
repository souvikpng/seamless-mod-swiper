import React, { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, animate, AnimationPlaybackControls } from 'framer-motion';
import { Mod } from '../../types';
import { Panel } from '../UI/CyberComponents';
import { ThumbsUp, User, Calendar } from 'lucide-react';
import { FALLBACK_IMAGE_URL, getModAuthorName, getModBodyText } from '../../utils/modPresentation';

export interface SwipeSignal {
  direction: 'left' | 'right';
  modId: number;
  nonce: number;
}

interface ModCardProps {
  mod: Mod;
  onSwipe: (direction: 'left' | 'right', modId: number) => void;
  style?: any;
  drag?: boolean | 'x' | 'y';
  swipeSignal?: SwipeSignal | null;
  variant?: 'active' | 'preview';
  isGhosted?: boolean;
}

const SWIPE_THRESHOLD = 110;
const SWIPE_VELOCITY = 650;

const preloadImage = (src?: string) => {
  if (!src) return;
  const image = new Image();
  image.src = src;
};

const ModCard: React.FC<ModCardProps> = ({ mod, onSwipe, style, drag, swipeSignal, variant = 'active', isGhosted = false }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const isPreview = variant === 'preview';

  const approveOpacity = useTransform(x, [40, 150], [0, 0.7]);
  const rejectOpacity = useTransform(x, [-150, -40], [0.7, 0]);
  const animationRef = useRef<AnimationPlaybackControls | null>(null);
  const isDismissingRef = useRef(false);

  useEffect(() => {
    preloadImage(mod.picture_url || FALLBACK_IMAGE_URL);
  }, [mod.picture_url]);

  const triggerSwipe = useCallback((direction: 'left' | 'right') => {
    if (isDismissingRef.current) return;

    isDismissingRef.current = true;
    animationRef.current?.stop();
    onSwipe(direction, mod.mod_id);
  }, [mod.mod_id, onSwipe]);

  useEffect(() => {
    animationRef.current?.stop();
    isDismissingRef.current = false;
    x.set(0);
  }, [mod.mod_id, x]);

  useEffect(() => {
    if (!swipeSignal || swipeSignal.modId !== mod.mod_id || isDismissingRef.current) {
      return;
    }

    triggerSwipe(swipeSignal.direction);
  }, [mod.mod_id, swipeSignal, triggerSwipe]);

  useEffect(() => () => {
    animationRef.current?.stop();
  }, []);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (isDismissingRef.current) {
      return;
    }

    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
      triggerSwipe('right');
    } else if (offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY) {
      triggerSwipe('left');
    } else {
      animationRef.current?.stop();
      animationRef.current = animate(x, 0, { type: 'spring', stiffness: 420, damping: 28, mass: 0.65 });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, WebkitUserDrag: 'none', touchAction: 'pan-y', ...style } as any}
      drag={!isPreview && drag ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.14}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.97, opacity: 0, y: 18 }}
      animate={{
        scale: style?.scale ?? 1,
        opacity: isGhosted ? 0 : 1,
        y: style?.y ?? 0,
      }}
      transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.62 }}
      className={`absolute h-[65vh] w-full max-w-md select-none ${isPreview ? '' : 'cursor-grab active:cursor-grabbing'} ${isGhosted ? 'pointer-events-none' : ''}`}
    >
      {isPreview ? (
        <Panel className="h-full overflow-hidden border border-cp-cyan/15 bg-black/65 p-0 select-none shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
          <div className="absolute inset-0">
            <img
              src={mod.picture_url || FALLBACK_IMAGE_URL}
              alt=""
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE_URL;
              }}
              loading="eager"
              decoding="async"
              className="h-full w-full scale-105 object-cover opacity-38"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/38 to-black/90" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,229,255,0.07),transparent_35%,rgba(252,238,10,0.04)_85%,transparent)]" />
          </div>

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cp-cyan/70 to-transparent" />
          <div className="absolute inset-x-6 top-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
            <span>Buffered</span>
            <span className="text-cp-cyan/70">Standby</span>
          </div>

          <div className="absolute inset-x-6 bottom-6 border border-cp-cyan/20 bg-black/55 px-4 py-4 backdrop-blur-sm">
            <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-cp-cyan/80">Next In Queue</div>
            <h3 className="mt-2 line-clamp-2 text-xl font-black uppercase leading-tight tracking-tight text-white">
              {mod.name || 'Unknown Mod'}
            </h3>
            <div className="mt-3 flex items-center justify-between gap-4 text-[11px] font-mono text-gray-400">
              <span className="truncate">{getModAuthorName(mod)}</span>
              <span className="shrink-0 text-cp-yellow/80">ready</span>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel className="relative h-full overflow-hidden border-l-4 border-cp-yellow bg-black p-0 select-none shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <motion.div
            style={{ opacity: approveOpacity }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-green-500/30"
          >
            <div className="-rotate-12 border-4 border-green-500 px-8 py-4 text-6xl font-bold uppercase tracking-widest text-green-500">
              Install
            </div>
          </motion.div>

          <motion.div
            style={{ opacity: rejectOpacity }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-red-500/30"
          >
            <div className="rotate-12 border-4 border-red-500 px-8 py-4 text-6xl font-bold uppercase tracking-widest text-red-500">
              Skip
            </div>
          </motion.div>

          <div className="relative h-1/2 w-full overflow-hidden group">
            <img
              src={mod.picture_url || FALLBACK_IMAGE_URL}
              alt={mod.name}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE_URL;
              }}
              loading="eager"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <h2 className="line-clamp-2 text-3xl font-bold uppercase leading-none tracking-tighter text-white drop-shadow-md">
                {mod.name || 'Unknown Mod'}
              </h2>
              <div className="mt-1 flex items-center gap-2 font-mono text-sm text-cp-yellow">
                <User size={14} />
                <span>{getModAuthorName(mod)}</span>
              </div>
            </div>
          </div>

          <div className="relative flex h-1/2 flex-col bg-cp-dark px-6 py-5" style={{ userSelect: 'none' }}>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <div className="relative z-10 flex items-center justify-between border-b border-gray-800 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
                <Calendar size={12} />
                <span>
                  {mod.created_timestamp
                    ? new Date(mod.created_timestamp * 1000).toLocaleDateString()
                    : mod.created_time || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-cp-cyan">
                <ThumbsUp size={14} />
                <span>{(mod.endorsement_count ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex-1 overflow-hidden">
              <p
                className="text-sm leading-relaxed whitespace-pre-line font-mono text-gray-300"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 11,
                  overflow: 'hidden',
                }}
              >
                {getModBodyText(mod)}
              </p>
            </div>

            {mod.version && (
              <div className="relative z-10 mt-4 text-right font-mono text-[10px] text-gray-600">V. {mod.version}</div>
            )}
          </div>
        </Panel>
      )}
    </motion.div>
  );
};

export default ModCard;
