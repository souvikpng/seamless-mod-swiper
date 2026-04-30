import { Mod } from '../types';

export const FALLBACK_IMAGE_URL = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 600 400%22%3E%3Crect width=%22600%22 height=%22400%22 fill=%22%23050505%22/%3E%3Cpath d=%22M0 0h600v400H0z%22 fill=%22%230d0d0d%22/%3E%3Cg fill=%22none%22 stroke=%22%23fcee0a%22 stroke-width=%222%22 opacity=%22.55%22%3E%3Cpath d=%22M160 150h280v100H160z%22/%3E%3Cpath d=%22m160 250 80-70 60 45 55-50 85 75%22/%3E%3C/g%3E%3Ctext x=%22300%22 y=%22315%22 text-anchor=%22middle%22 fill=%22%23fcee0a%22 font-family=%22monospace%22 font-size=%2228%22%3ENO IMAGE%3C/text%3E%3C/svg%3E';

const ALLOWED_IMAGE_HOSTS = new Set([
  'staticdelivery.nexusmods.com',
  'static.nexusmods.com',
]);

export const safeImageUrl = (value?: string, fallback = FALLBACK_IMAGE_URL): string => {
  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.hostname.toLowerCase())) {
      return url.toString();
    }
  } catch {
    // Invalid external image URLs fall back to a known placeholder.
  }

  return fallback;
};

const decodeHtmlEntities = (value: string) => {
  if (typeof DOMParser === 'undefined') {
    return value
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(value, 'text/html');
  return parsed.documentElement.textContent || '';
};

export const sanitizeModText = (value?: string) => {
  if (!value) {
    return '';
  }

  const prepared = value
    .replace(/\[img\][\s\S]*?\[\/img\]/gi, ' ')
    .replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/gi, '$2')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<[^>]*>/g, ' ');

  return decodeHtmlEntities(prepared)
    .replace(/\[(?:\/?[a-z*]+(?:=[^\]]+)?)\]/gi, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/\r/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

export const getModBodyText = (mod: Mod) => {
  const description = sanitizeModText(mod.description);
  const summary = sanitizeModText(mod.summary);

  if (description && (!summary || description.length >= Math.max(140, summary.length * 0.75))) {
    return description;
  }

  return summary || description || 'No summary provided.';
};

export const getModExcerpt = (mod: Mod, maxLength: number = 180) => {
  const text = getModBodyText(mod);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
};

export const getModAuthorName = (mod: Mod) => mod.author || mod.uploaded_by || 'Unknown';

export const needsDescriptionHydration = (mod: Mod) => {
  const description = sanitizeModText(mod.description);
  const summary = sanitizeModText(mod.summary);

  if (!description) {
    return true;
  }

  return summary.length > description.length && description.length < 220;
};
