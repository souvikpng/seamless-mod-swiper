import React, { useState, useEffect, useCallback, useRef } from 'react';
import ThreeBackground from './components/ThreeBackground';
import LandingPage from './components/LandingPage';
import CardStack from './components/Swiper/CardStack';
import BootSequence from './components/UI/BootSequence';
import { CyberButton, Panel, GlitchText } from './components/UI/CyberComponents';
import { Mod, Game } from './types';
import { fetchModsBulk, fetchModDetail, validateApiKey, RateLimitInfo, FetchProgress } from './services/nexusService';
import { 
  getCachedMods, 
  appendToCachedMods,
  setCachedMods,
  filterUnseenMods, 
  getCacheAge,
  clearModCache,
  getUnseenCachedMods,
  getCachedModCount
} from './services/cacheService';
import { clearLegacyProgress, clearProgressForGame, loadProgressForGame, saveProgressForGame } from './services/progressService';
import { FALLBACK_IMAGE_URL, getModAuthorName, getModBodyText, getModExcerpt, needsDescriptionHydration } from './utils/modPresentation';
import { Download, List, LogOut, Zap, Trash2, Database, Settings, RotateCcw, RefreshCw } from 'lucide-react';

interface LoadOptions {
  background?: boolean;
  replaceQueue?: boolean;
  validateKey?: boolean;
  showBootSequence?: boolean;
  count?: number;
}

interface SwipeHistoryEntry {
  mod: Mod;
  direction: 'left' | 'right';
  index: number;
  wasApproved: boolean;
}

interface UndoSignal {
  mod: Mod;
  direction: 'left' | 'right';
  nonce: number;
}

// Configuration
const TARGET_BULK_FETCH_COUNT = 300; // Target mods to fetch per full preload
const LOW_QUEUE_THRESHOLD = 20; // Auto-refresh when queue drops below this
const AUTO_REFRESH_COOLDOWN = 60000; // Minimum time between auto-refreshes (ms)
const BACKGROUND_FETCH_COUNT = 120; // Background fetch target while swiping
const HISTORY_LIMIT = 40;

const dedupeMods = (entries: Mod[]) => Array.from(new Map(entries.map((mod) => [mod.mod_id, mod])).values());

const getRateLimitSeverity = (rateLimit: RateLimitInfo | null) => {
  if (!rateLimit || rateLimit.hourlyLimit <= 0) return 'normal';

  const ratio = rateLimit.hourlyRemaining / rateLimit.hourlyLimit;
  if (ratio <= 0.12) return 'critical';
  if (ratio <= 0.28) return 'warning';
  return 'normal';
};

const getInitialProgress = (game: Game) => {
  if (typeof window === 'undefined') {
    return { progress: { seenIds: [], approvedMods: [] }, migratedLegacy: false };
  }

  return loadProgressForGame(game);
};

const App: React.FC = () => {
  const initialProgressRef = useRef<ReturnType<typeof getInitialProgress> | null>(null);
  if (!initialProgressRef.current) {
    initialProgressRef.current = getInitialProgress(Game.CYBERPUNK);
  }
  const initialProgress = initialProgressRef.current;
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game>(Game.CYBERPUNK);
  
  const [mods, setMods] = useState<Mod[]>([]);
  const [approvedMods, setApprovedMods] = useState<Mod[]>(initialProgress.progress.approvedMods);
  const [seenModIds, setSeenModIds] = useState<Set<number>>(new Set(initialProgress.progress.seenIds));
  
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState<FetchProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [landingError, setLandingError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const [view, setView] = useState<'landing' | 'swiping' | 'list'>('landing');
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [queueRemaining, setQueueRemaining] = useState(0);
  const [cachedCount, setCachedCount] = useState(0);
  const [cacheAge, setCacheAge] = useState<number | null>(null);
  const [currentModIndex, setCurrentModIndex] = useState(0);
  const [hydratedProgressGame, setHydratedProgressGame] = useState<Game | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryEntry[]>([]);
  const [undoSignal, setUndoSignal] = useState<UndoSignal | null>(null);
  const [introNonce, setIntroNonce] = useState(0);
  const [swipePhase, setSwipePhase] = useState<'boot' | 'intro' | 'ready'>('ready');
  
  const settingsRef = useRef<HTMLDivElement>(null);
  const lastAutoRefresh = useRef<number>(0);
  const isAutoRefreshing = useRef<boolean>(false);
  const seenModIdsRef = useRef<Set<number>>(seenModIds);
  const modsRef = useRef<Mod[]>(mods);
  const requestTokenRef = useRef(0);
  const detailHydrationRef = useRef<Set<string>>(new Set());

  const queueDeckIntro = useCallback(() => {
    setSwipePhase('intro');
    setIntroNonce((prev) => prev + 1);
  }, []);

  const resetDeckSessionState = useCallback(() => {
    setSwipeHistory([]);
    setUndoSignal(null);
  }, []);

  useEffect(() => {
    if (initialProgress.migratedLegacy) {
      saveProgressForGame(Game.CYBERPUNK, initialProgress.progress);
      clearLegacyProgress();
    }
  }, []);

  useEffect(() => {
    const { progress, migratedLegacy } = loadProgressForGame(selectedGame);
    const seenSet = new Set(progress.seenIds);

    setSeenModIds(seenSet);
    seenModIdsRef.current = seenSet;
    setApprovedMods(progress.approvedMods);
    setHydratedProgressGame(selectedGame);
    setCurrentModIndex(0);
    setQueueRemaining(0);
    detailHydrationRef.current.clear();
    resetDeckSessionState();

    if (migratedLegacy) {
      saveProgressForGame(selectedGame, progress);
      clearLegacyProgress();
    }
  }, [resetDeckSessionState, selectedGame]);

  useEffect(() => {
    seenModIdsRef.current = seenModIds;
  }, [seenModIds]);

  useEffect(() => {
    if (hydratedProgressGame !== selectedGame) {
      return;
    }

    saveProgressForGame(selectedGame, {
      seenIds: Array.from(seenModIds),
      approvedMods,
    });
  }, [approvedMods, hydratedProgressGame, seenModIds, selectedGame]);

  useEffect(() => {
    modsRef.current = mods;
  }, [mods]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  const updateCacheStats = useCallback(async (game: Game) => {
    const count = await getCachedModCount(game);
    const age = await getCacheAge(game);
    setCachedCount(count);
    setCacheAge(age);
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    updateCacheStats(selectedGame);
    const interval = setInterval(() => {
      updateCacheStats(selectedGame);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedGame, updateCacheStats]);

  useEffect(() => {
    if (!apiKey || view !== 'swiping' || mods.length === 0) {
      return;
    }

    let isCancelled = false;
    const candidates = mods.slice(currentModIndex, currentModIndex + 2).filter((mod) => needsDescriptionHydration(mod));

    candidates.forEach((mod) => {
      const hydrateKey = `${selectedGame}_${mod.mod_id}`;
      if (detailHydrationRef.current.has(hydrateKey)) {
        return;
      }

      detailHydrationRef.current.add(hydrateKey);

      fetchModDetail(apiKey, selectedGame, mod.mod_id)
        .then(async ({ mod: detailedMod, rateLimit: detailRateLimit }) => {
          if (!detailedMod || isCancelled) {
            return;
          }

          if (detailRateLimit) {
            setRateLimit(detailRateLimit);
          }

          setMods((prev) => prev.map((entry) => (entry.mod_id === detailedMod.mod_id ? { ...entry, ...detailedMod } : entry)));
          setApprovedMods((prev) => prev.map((entry) => (entry.mod_id === detailedMod.mod_id ? { ...entry, ...detailedMod } : entry)));

          try {
            await setCachedMods(selectedGame, [detailedMod]);
          } catch (cacheError) {
            console.warn('Failed to cache hydrated mod details:', cacheError);
          }
        })
        .catch((hydrateError) => {
          detailHydrationRef.current.delete(hydrateKey);
          console.warn('Failed to hydrate mod description:', hydrateError);
        });
    });

    return () => {
      isCancelled = true;
    };
  }, [apiKey, currentModIndex, mods, selectedGame, view]);

  // Auto-refresh when queue runs low
  useEffect(() => {
    const checkAndAutoRefresh = async () => {
      if (
        !apiKey || 
        !view || 
        view !== 'swiping' ||
        isLoading || 
        isBulkLoading ||
        isAutoRefreshing.current ||
        queueRemaining >= LOW_QUEUE_THRESHOLD
      ) {
        return;
      }

      // Check cooldown
      const now = Date.now();
      if (now - lastAutoRefresh.current < AUTO_REFRESH_COOLDOWN) {
        return;
      }

      console.log(`Queue low (${queueRemaining}), auto-refreshing...`);
      isAutoRefreshing.current = true;
      lastAutoRefresh.current = now;

      try {
        // Try to load from cache first (use ref for current value)
        const unseenFromCache = await getUnseenCachedMods(selectedGame, seenModIdsRef.current);
        
        if (unseenFromCache.length >= LOW_QUEUE_THRESHOLD) {
          // We have enough in cache, just load more into the queue
          setMods(prev => {
            const currentIds = new Set(prev.map(m => m.mod_id));
            const newMods = unseenFromCache.filter(m => !currentIds.has(m.mod_id));
            return [...prev, ...newMods.slice(0, 50)]; // Add up to 50 more
          });
        } else {
          // Cache is running low, fetch more in background
          await loadModsBulk(apiKey, selectedGame, {
            background: true,
            replaceQueue: false,
            count: BACKGROUND_FETCH_COUNT,
          });
        }
      } finally {
        isAutoRefreshing.current = false;
      }
    };

    checkAndAutoRefresh();
  }, [queueRemaining, apiKey, view, isLoading, isBulkLoading, selectedGame, seenModIds.size]);

  /**
   * Bulk load mods with progress indicator
   */
  const loadModsBulk = useCallback(async (
    key: string, 
    game: Game, 
    options: LoadOptions = {}
  ) => {
    const {
      background = false,
      replaceQueue = !background,
      validateKey = false,
      showBootSequence = false,
      count = background ? BACKGROUND_FETCH_COUNT : TARGET_BULK_FETCH_COUNT,
    } = options;

    const normalizedKey = key.trim();
    const requestToken = ++requestTokenRef.current;

    if (!normalizedKey) {
      const message = 'Enter your Nexus Mods API key to begin.';
      setLandingError(message);
      throw new Error(message);
    }

    if (showBootSequence) {
      setIsLoading(true);
      setSwipePhase('boot');
    }

    setIsBulkLoading(true);
    setLandingError(null);
    setError(null);
    setLoadProgress(null);
    let validationComplete = !validateKey;
    
    try {
      if (validateKey) {
        setLoadProgress({
          phase: 'auth',
          current: 0,
          total: 1,
          message: 'Validating access token...',
        });

        const isValidKey = await validateApiKey(normalizedKey);
        if (!isValidKey) {
          throw new Error('Invalid API key. Please verify your Nexus Mods API key and try again.');
        }

        validationComplete = true;
      }

      // First, check if we have unseen mods in cache (use ref for current value)
      const currentSeenIds = seenModIdsRef.current;
      const cachedMods = await getCachedMods(game);
      const unseenCached = filterUnseenMods(cachedMods, currentSeenIds);
      const queuedIds = new Set(modsRef.current.map((mod) => mod.mod_id));

      if (requestTokenRef.current !== requestToken) {
        return;
      }
      
      if (replaceQueue && unseenCached.length >= Math.floor(count / 2)) {
        // Use cache if we have a good amount
        console.log(`Using ${unseenCached.length} unseen mods from cache`);
        resetDeckSessionState();
        setMods(unseenCached);
        setCurrentModIndex(0); // Reset to start for new batch
        await updateCacheStats(game);

        if (showBootSequence && unseenCached.length > 0) {
          queueDeckIntro();
        } else if (replaceQueue) {
          setSwipePhase('ready');
        }

        return;
      }

      // Fetch bulk mods with progress
      const alreadyCachedIds = new Set(cachedMods.map(m => m.mod_id));
      const excludeIds = new Set([...currentSeenIds, ...alreadyCachedIds]);

      if (!replaceQueue) {
        queuedIds.forEach((id) => excludeIds.add(id));
      }

      const response = await fetchModsBulk(
        normalizedKey, 
        game, 
        count,
        (progress) => setLoadProgress(progress),
        excludeIds
      );

      if (requestTokenRef.current !== requestToken) {
        return;
      }

      // Update rate limit
      if (response.rateLimit) {
        setRateLimit(response.rateLimit);
      }

      // Add new mods to cache
      if (response.mods.length > 0) {
        try {
          await appendToCachedMods(game, response.mods);
        } catch (cacheError) {
          console.warn('Failed to update cache after fetch:', cacheError);
        }
      }

      // Filter and set mods for display
      const unseenMods = filterUnseenMods(response.mods, currentSeenIds);
      
      if (replaceQueue) {
        // Also include unseen from cache
        const uniqueUnseen = dedupeMods([...unseenCached, ...unseenMods]);
        resetDeckSessionState();
        setMods(uniqueUnseen);
        setCurrentModIndex(0); // Reset to start for new batch

        if (showBootSequence && uniqueUnseen.length > 0) {
          queueDeckIntro();
        } else {
          setSwipePhase('ready');
        }
      } else {
        // Background refresh: append to existing queue without disturbing the active card
        const refillPool = dedupeMods([...unseenCached.slice(0, LOW_QUEUE_THRESHOLD), ...unseenMods]);
        setMods(prev => {
          const currentIds = new Set(prev.map(m => m.mod_id));
          const newMods = refillPool.filter(m => !currentIds.has(m.mod_id));
          return [...prev, ...newMods];
        });
      }

      // Update cache stats
      await updateCacheStats(game);

      if (replaceQueue && unseenMods.length === 0 && unseenCached.length === 0) {
        setError("No new mods found. You may have seen most available mods!");
        setSwipePhase('ready');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch mods. Check console.";

      if (requestTokenRef.current !== requestToken) {
        return;
      }

      if (validateKey && !validationComplete) {
        setLandingError(message);
        setMods([]);
        setCurrentModIndex(0);
        setApiKey(null);
        setView('landing');
      } else {
        setError(message);
      }

      if (replaceQueue) {
        setSwipePhase('ready');
      }

      console.error("Failed to fetch mods:", err);
    } finally {
      if (requestTokenRef.current !== requestToken) {
        return;
      }

      if (showBootSequence) {
        setIsLoading(false);
      }
      setIsBulkLoading(false);
      setLoadProgress(null);
    }
  }, [queueDeckIntro, resetDeckSessionState, updateCacheStats]);

  const handleStart = async (key: string, game: Game) => {
    const normalizedKey = key.trim();

    if (!normalizedKey) {
      setLandingError('Enter your Nexus Mods API key to begin.');
      return;
    }

    setLandingError(null);
    setApiKey(normalizedKey);
    setSelectedGame(game);
    setSwipePhase('boot');
    setView('swiping');
    setMods([]);
    setCurrentModIndex(0);
    detailHydrationRef.current.clear();
    resetDeckSessionState();
    setQueueRemaining(0);
    await loadModsBulk(normalizedKey, game, {
      replaceQueue: true,
      validateKey: true,
      showBootSequence: true,
      count: TARGET_BULK_FETCH_COUNT,
    });
  };

  const handleApprove = (mod: Mod) => {
    const wasAlreadyApproved = approvedMods.some((entry) => entry.mod_id === mod.mod_id);

    setSwipeHistory((prev) => [
      ...prev.slice(-(HISTORY_LIMIT - 1)),
      { mod, direction: 'right', index: currentModIndex, wasApproved: !wasAlreadyApproved },
    ]);
    setApprovedMods(prev => prev.some((entry) => entry.mod_id === mod.mod_id) ? prev : [...prev, mod]);
    setSeenModIds(prev => new Set(prev).add(mod.mod_id));
  };

  const handleReject = (mod: Mod) => {
    setSwipeHistory((prev) => [
      ...prev.slice(-(HISTORY_LIMIT - 1)),
      { mod, direction: 'left', index: currentModIndex, wasApproved: false },
    ]);
    setSeenModIds(prev => new Set(prev).add(mod.mod_id));
  };

  const handleUndo = () => {
    if (swipePhase !== 'ready') {
      return;
    }

    const lastSwipe = swipeHistory[swipeHistory.length - 1];
    if (!lastSwipe) {
      return;
    }

    setSwipeHistory((prev) => prev.slice(0, -1));
    setSeenModIds((prev) => {
      const next = new Set(prev);
      next.delete(lastSwipe.mod.mod_id);
      return next;
    });

    if (lastSwipe.wasApproved) {
      setApprovedMods((prev) => prev.filter((entry) => entry.mod_id !== lastSwipe.mod.mod_id));
    }

    setCurrentModIndex(Math.max(lastSwipe.index, 0));
    setUndoSignal({ mod: lastSwipe.mod, direction: lastSwipe.direction, nonce: Date.now() });
    setError(null);
  };

  const handleIntroComplete = useCallback(() => {
    setSwipePhase('ready');
  }, []);

  const handleRemoveApproved = (modId: number) => {
    setApprovedMods(prev => prev.filter(m => m.mod_id !== modId));
  };

  const handleExport = () => {
    const content = approvedMods.map(m => 
      `${m.name || 'Unknown Mod'}\nURL: https://www.nexusmods.com/${m.domain_name}/mods/${m.mod_id}\n-------------------`
    ).join('\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus_mod_list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetProgress = async () => {
    requestTokenRef.current += 1;

    try {
      await clearModCache(selectedGame);
    } catch (err) {
      console.error('Failed to clear mod cache:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      // Always perform cleanup even if cache clear fails
      setSeenModIds(new Set());
      setApprovedMods([]);
      setMods([]);
      setCurrentModIndex(0);
      detailHydrationRef.current.clear();
      clearProgressForGame(selectedGame);
      resetDeckSessionState();
      setSwipePhase('ready');
      setShowResetConfirm(false);
      setShowSettings(false);
      setCachedCount(0);
      setCacheAge(null);
      setQueueRemaining(0);
      // Reload mods
      if (apiKey) {
        loadModsBulk(apiKey, selectedGame, {
          replaceQueue: true,
          showBootSequence: true,
          count: TARGET_BULK_FETCH_COUNT,
        });
      }
    }
  };

  const rateLimitSeverity = getRateLimitSeverity(rateLimit);
  const rateLimitClassName =
    rateLimitSeverity === 'critical'
      ? 'text-cp-red'
      : rateLimitSeverity === 'warning'
        ? 'text-cp-yellow'
        : 'text-gray-400';
  const backgroundProgressPercent = loadProgress && loadProgress.total > 0
    ? Math.min((loadProgress.current / loadProgress.total) * 100, 100)
    : 0;
  const canUndo = swipeHistory.length > 0 && swipePhase === 'ready';
  const isIntroPlaying = swipePhase === 'intro';

  return (
    <div className="relative min-h-screen text-white font-sans overflow-hidden">
      <ThreeBackground />

      {/* Header / HUD */}
      {view !== 'landing' && (
        <header className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <div className="text-cp-yellow font-bold text-xl tracking-widest uppercase">
               SMS <span className="text-white text-xs align-top">v1.0</span>
             </div>
             <div className="text-[10px] text-cp-cyan font-mono">
                NET_STATUS: ONLINE
              </div>
              {rateLimit && (
                <div className="flex items-center gap-1 text-[10px] font-mono mt-1">
                  <Zap size={10} className={rateLimitSeverity === 'critical' ? 'text-cp-red' : rateLimitSeverity === 'warning' ? 'text-cp-yellow' : 'text-cp-cyan'} />
                  <span className={rateLimitClassName}>
                    API: {rateLimit.hourlyRemaining}/{rateLimit.hourlyLimit} hr
                  </span>
                </div>
              )}
             {cachedCount > 0 && (
               <div className="flex items-center gap-1 text-[10px] font-mono mt-1">
                 <Database size={10} className="text-cp-cyan" />
                 <span className="text-gray-400">
                   Cache: {cachedCount} mods {cacheAge !== null && `(${cacheAge}min old)`}
                 </span>
               </div>
             )}
          </div>

          <div className="pointer-events-auto flex gap-2">
            {/* Refresh Button */}
            <button 
              type="button"
              onClick={() => apiKey && loadModsBulk(apiKey, selectedGame, {
                background: true,
                replaceQueue: false,
                count: BACKGROUND_FETCH_COUNT,
              })}
              disabled={isBulkLoading}
              className={`bg-black/50 border p-2 transition-colors ${
                isBulkLoading 
                  ? 'border-cp-cyan text-cp-cyan' 
                  : 'border-gray-600 text-gray-400 hover:border-cp-cyan hover:text-cp-cyan'
              }`}
              title="Fetch more mods"
            >
              <RefreshCw size={20} className={isBulkLoading ? 'animate-spin' : ''} />
            </button>

            {/* Settings Button */}
            <div className="relative" ref={settingsRef}>
              <button 
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`bg-black/50 border p-2 transition-colors ${showSettings ? 'border-cp-cyan text-cp-cyan' : 'border-gray-600 text-gray-400 hover:border-cp-cyan hover:text-cp-cyan'}`}
              >
                <Settings size={20} />
              </button>
              
              {/* Settings Dropdown */}
              {showSettings && (
                <div className="absolute right-0 top-12 bg-black/95 border border-cp-gray p-4 min-w-[200px] z-50">
                  <h3 className="text-cp-yellow font-bold text-sm mb-3 uppercase tracking-wider">Settings</h3>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full flex items-center gap-2 p-2 text-left text-gray-300 hover:text-cp-red hover:bg-cp-red/10 transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span className="text-sm">Reset Progress</span>
                   </button>
                   <p className="text-[10px] text-gray-600 mt-2 px-2">
                     Clears seen mods and approved list for this game
                   </p>
                 </div>
               )}
            </div>

            {/* Approved List Button */}
            <button 
              type="button"
              onClick={() => setView(view === 'list' ? 'swiping' : 'list')}
              className="bg-black/50 border border-cp-yellow p-2 hover:bg-cp-yellow hover:text-black transition-colors"
            >
              <div className="relative">
                <List size={20} />
                {approvedMods.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cp-red text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {approvedMods.length}
                  </span>
                )}
              </div>
            </button>

            {/* Logout Button */}
              <button 
                type="button"
                onClick={() => {
                  requestTokenRef.current += 1;
                  setApiKey(null);
                  setError(null);
                  setLandingError(null);
                  setIsLoading(false);
                  setIsBulkLoading(false);
                  setLoadProgress(null);
                  setSwipePhase('ready');
                  detailHydrationRef.current.clear();
                  resetDeckSessionState();
                  setQueueRemaining(0);
                  setView('landing');
                  setShowSettings(false);
                }}
              className="bg-black/50 border border-red-500 p-2 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>
      )}

      {view === 'swiping' && isBulkLoading && !isLoading && loadProgress && (
        <div className="fixed left-1/2 top-20 z-40 w-[min(92vw,24rem)] -translate-x-1/2 pointer-events-none">
          <div className="cp-clip-box border border-cp-cyan/30 bg-black/80 px-4 py-3 shadow-[0_0_30px_rgba(0,229,255,0.08)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.24em] text-cp-cyan">
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" />
                Buffer Refresh
              </span>
              <span className="text-gray-500">{Math.round(backgroundProgressPercent)}%</span>
            </div>
            <p className="mt-2 text-xs font-mono text-gray-400">{loadProgress.message}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-900">
              <div
                className="h-full bg-gradient-to-r from-cp-yellow via-cp-cyan to-cp-red transition-all duration-300"
                style={{ width: `${backgroundProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 pt-16 px-4 h-screen flex flex-col">
        {view === 'landing' && (
          <div className="flex-1 flex items-center justify-center">
            <LandingPage onStart={handleStart} error={landingError} />
          </div>
        )}

        {view === 'swiping' && (
          <div className="flex-1 flex flex-col items-center justify-center">
             {error && !isBulkLoading && (
                <div className="mb-4 p-3 bg-cp-red/20 border border-cp-red text-cp-red font-mono text-xs max-w-md text-center">
                  {error}
                </div>
              )}
              
              <CardStack 
                 mods={mods} 
                  onApprove={handleApprove} 
                  onReject={handleReject} 
                  isRefreshing={isBulkLoading && !isLoading}
                  onQueueChange={setQueueRemaining}
                  currentIndex={currentModIndex}
                  onIndexChange={setCurrentModIndex}
                  canUndo={canUndo}
                  onUndo={handleUndo}
                  undoSignal={undoSignal}
                  isIntroPlaying={isIntroPlaying}
                  introNonce={introNonce}
                  onIntroComplete={handleIntroComplete}
                />
              
              {/* Controls info - positioned at bottom with no overlap */}
              <div className="mt-4 text-center text-[10px] text-gray-600 font-mono">
                <span className="text-gray-500">[A] REJECT</span>
                 <span className="mx-4 text-gray-700">|</span>
                 <span className="text-gray-500">[D] APPROVE</span>
                 <span className="mx-4 text-gray-700">|</span>
                 <span className="text-gray-500">[Z] UNDO</span>
                 {queueRemaining > 0 && (
                   <span className="ml-4 text-cp-cyan">({queueRemaining} buffered)</span>
                 )}
                 {isIntroPlaying && (
                   <span className="ml-4 text-cp-yellow animate-pulse">(deck priming...)</span>
                 )}
                 {isBulkLoading && !isLoading && (
                   <span className="ml-4 text-cp-yellow animate-pulse">(refreshing buffer...)</span>
                 )}
               </div>
           </div>
        )}

        {view === 'list' && (
          <div className="flex-1 max-w-4xl mx-auto w-full overflow-hidden flex flex-col pb-4 -mt-4">
            <Panel className="flex-1 flex flex-col overflow-hidden bg-black/90">
              <div className="border-b border-gray-800 p-6 flex justify-between items-center">
                <GlitchText text="APPROVED_MODS_CACHE" className="text-2xl font-bold text-white" />
                <CyberButton 
                  label="Export List" 
                  variant="success" 
                  onClick={handleExport}
                  disabled={approvedMods.length === 0}
                />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 cp-scrollbar">
                {approvedMods.length === 0 ? (
                  <div className="text-center text-gray-500 py-20 font-mono">
                    NO DATA FRAGMENTS FOUND. RETURN TO SCANNING.
                  </div>
                ) : (
                  approvedMods.map((mod) => (
                    <div key={mod.mod_id} className="flex gap-4 p-4 border border-gray-800 bg-gray-900/50 hover:border-cp-cyan transition-colors group">
                      <img
                        src={mod.picture_url || FALLBACK_IMAGE_URL}
                        alt={mod.name || 'Mod artwork'}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_IMAGE_URL;
                        }}
                        className="w-24 h-24 object-cover border border-gray-700 bg-black"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-cp-cyan">{mod.name}</h3>
                        <p className="text-sm text-gray-400 font-mono mb-2">{getModAuthorName(mod)}</p>
                        <p className="text-xs text-gray-500 line-clamp-3">{getModExcerpt(mod, 240)}</p>
                      </div>
                      <div className="flex flex-col gap-2 self-center">
                        <a 
                          href={`https://www.nexusmods.com/${mod.domain_name}/mods/${mod.mod_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-cp-yellow hover:text-white transition-colors"
                          title="View on Nexus Mods"
                        >
                          <Download size={24} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveApproved(mod.mod_id)}
                          className="p-2 text-gray-500 hover:text-cp-red transition-colors"
                          title="Remove from list"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        )}
      </main>

      {isLoading && <BootSequence progress={loadProgress} rateLimit={rateLimit} />}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 border border-cp-red p-6 max-w-sm mx-4">
            <h3 className="text-cp-red font-bold text-lg mb-4 uppercase tracking-wider">
              Confirm Reset
            </h3>
             <p className="text-gray-300 text-sm mb-6">
               This will clear your progress for the active game, including:
             </p>
            <ul className="text-gray-400 text-xs mb-6 space-y-1 ml-4">
              <li>- All seen mods ({seenModIds.size} mods)</li>
              <li>- Approved mods list ({approvedMods.length} mods)</li>
              <li>- Local mod cache ({cachedCount} mods)</li>
            </ul>
            <p className="text-cp-yellow text-xs mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                className="flex-1 px-4 py-2 bg-cp-red border border-cp-red text-white hover:bg-cp-red/80 transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    </div>
  );
};

export default App;
