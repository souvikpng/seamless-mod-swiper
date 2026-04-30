import { Game, UserProgress } from '../types';
import { filterValidPersistedMods, filterValidSeenIds } from '../utils/validation';

const LEGACY_SEEN_KEY = 'seenModIds';
const LEGACY_APPROVED_KEY = 'approvedMods';

const getSeenKey = (game: Game) => `sms_seenModIds_${game}`;
const getApprovedKey = (game: Game) => `sms_approvedMods_${game}`;

const emptyProgress = (): UserProgress => ({
  seenIds: [],
  approvedMods: [],
});

const safeParse = (value: string | null): unknown => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Discarding malformed persisted progress:', error);
    return undefined;
  }
};

export const loadProgressForGame = (game: Game): { progress: UserProgress; migratedLegacy: boolean } => {
  const scopedSeen = localStorage.getItem(getSeenKey(game));
  const scopedApproved = localStorage.getItem(getApprovedKey(game));

  if (scopedSeen !== null || scopedApproved !== null) {
    return {
      progress: {
        seenIds: filterValidSeenIds(safeParse(scopedSeen)),
        approvedMods: filterValidPersistedMods(safeParse(scopedApproved)),
      },
      migratedLegacy: false,
    };
  }

  const legacySeen = localStorage.getItem(LEGACY_SEEN_KEY);
  const legacyApproved = localStorage.getItem(LEGACY_APPROVED_KEY);

  if (legacySeen !== null || legacyApproved !== null) {
    return {
      progress: {
        seenIds: filterValidSeenIds(safeParse(legacySeen)),
        approvedMods: filterValidPersistedMods(safeParse(legacyApproved)),
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
