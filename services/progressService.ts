import { Game, Mod, UserProgress } from '../types';

const LEGACY_SEEN_KEY = 'seenModIds';
const LEGACY_APPROVED_KEY = 'approvedMods';

const getSeenKey = (game: Game) => `sms_seenModIds_${game}`;
const getApprovedKey = (game: Game) => `sms_approvedMods_${game}`;

const emptyProgress = (): UserProgress => ({
  seenIds: [],
  approvedMods: [],
});

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(value) as T;

    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }

    return parsed;
  } catch (error) {
    console.error('Failed to parse persisted progress:', error);
    return fallback;
  }
};

export const loadProgressForGame = (game: Game): { progress: UserProgress; migratedLegacy: boolean } => {
  const scopedSeen = localStorage.getItem(getSeenKey(game));
  const scopedApproved = localStorage.getItem(getApprovedKey(game));

  if (scopedSeen !== null || scopedApproved !== null) {
    return {
      progress: {
        seenIds: safeParse<number[]>(scopedSeen, []),
        approvedMods: safeParse<Mod[]>(scopedApproved, []),
      },
      migratedLegacy: false,
    };
  }

  const legacySeen = localStorage.getItem(LEGACY_SEEN_KEY);
  const legacyApproved = localStorage.getItem(LEGACY_APPROVED_KEY);

  if (legacySeen !== null || legacyApproved !== null) {
    return {
      progress: {
        seenIds: safeParse<number[]>(legacySeen, []),
        approvedMods: safeParse<Mod[]>(legacyApproved, []),
      },
      migratedLegacy: true,
    };
  }

  return {
    progress: emptyProgress(),
    migratedLegacy: false,
  };
};

export const saveProgressForGame = (game: Game, progress: UserProgress) => {
  localStorage.setItem(getSeenKey(game), JSON.stringify(progress.seenIds));
  localStorage.setItem(getApprovedKey(game), JSON.stringify(progress.approvedMods));
};

export const clearProgressForGame = (game: Game) => {
  localStorage.removeItem(getSeenKey(game));
  localStorage.removeItem(getApprovedKey(game));
};

export const clearLegacyProgress = () => {
  localStorage.removeItem(LEGACY_SEEN_KEY);
  localStorage.removeItem(LEGACY_APPROVED_KEY);
};
