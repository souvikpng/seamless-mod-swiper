import { Game, Mod } from '../types';

const knownGames = new Set<string>(Object.values(Game));

const isOptionalFiniteNumber = (value: unknown) => value === undefined || Number.isFinite(value);
const isOptionalString = (value: unknown) => value === undefined || typeof value === 'string';
const isOptionalBoolean = (value: unknown) => value === undefined || typeof value === 'boolean';

export const isValidPersistedMod = (value: unknown): value is Mod => {
  if (!value || typeof value !== 'object') return false;

  const mod = value as Partial<Mod>;

  if (!Number.isFinite(mod.mod_id)) return false;
  if (typeof mod.domain_name !== 'string' || !knownGames.has(mod.domain_name)) return false;

  if (!isOptionalString(mod.name)) return false;
  if (!isOptionalString(mod.summary)) return false;
  if (!isOptionalString(mod.description)) return false;
  if (!isOptionalString(mod.picture_url)) return false;
  if (!isOptionalString(mod.author)) return false;
  if (!isOptionalString(mod.uploaded_by)) return false;
  if (!isOptionalString(mod.version)) return false;
  if (!isOptionalString(mod.created_time)) return false;
  if (!isOptionalString(mod.updated_time)) return false;

  if (!isOptionalFiniteNumber(mod.category_id)) return false;
  if (!isOptionalFiniteNumber(mod.game_id)) return false;
  if (!isOptionalFiniteNumber(mod.created_timestamp)) return false;
  if (!isOptionalFiniteNumber(mod.updated_timestamp)) return false;
  if (!isOptionalFiniteNumber(mod.endorsement_count)) return false;
  if (!isOptionalFiniteNumber(mod.mod_downloads)) return false;
  if (!isOptionalFiniteNumber(mod.mod_unique_downloads)) return false;

  if (!isOptionalBoolean(mod.available)) return false;
  if (!isOptionalBoolean(mod.contains_adult_content)) return false;
  if (!isOptionalBoolean(mod.allow_rating)) return false;

  return true;
};

export const filterValidPersistedMods = (values: unknown): Mod[] => {
  return Array.isArray(values) ? values.filter(isValidPersistedMod) : [];
};

export const filterValidSeenIds = (values: unknown): number[] => {
  return Array.isArray(values) ? values.filter(Number.isFinite) : [];
};
