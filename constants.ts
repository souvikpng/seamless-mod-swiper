import { Game, GameTheme } from './types';

export const NEXUS_API_BASE = 'https://api.nexusmods.com/v1';

export const GAME_THEMES: Record<Game, GameTheme> = {
  [Game.CYBERPUNK]: {
    primary: '#fcee0a',
    secondary: '#00e5ff',
    accent: '#ff003c',
    font: 'Rajdhani',
    uiStyle: 'cyberpunk',
  },
  [Game.RDR2]: { primary: '#8a0f0f', secondary: '#000', accent: '#fff', font: 'serif', uiStyle: 'western' },
  [Game.NEWVEGAS]: {
    primary: '#d9902f',
    secondary: '#173f2a',
    accent: '#6bbf59',
    font: 'Share Tech Mono',
    uiStyle: 'retro',
  },
  [Game.BG3]: { primary: '#4a1a1a', secondary: '#1a1a1a', accent: '#gold', font: 'serif', uiStyle: 'fantasy' },
  [Game.STARDEW]: { primary: '#f2b84b', secondary: '#2f7d4b', accent: '#7fc8e8', font: 'Rajdhani', uiStyle: 'fantasy' },
};

export const MOCK_MODS: any[] = [
  {
    mod_id: 12345,
    name: "Arasaka Cyberarms",
    summary: "Replaces default arms with high-fidelity Arasaka cybernetics.",
    description: "Detailed description of Arasaka arms...",
    picture_url: "https://picsum.photos/600/400?random=1",
    author: "Aeda",
    endorsement_count: 5230,
    domain_name: "cyberpunk2077"
  },
  {
    mod_id: 67890,
    name: "Night City Alive",
    summary: "Overhauls traffic and pedestrian density for a more realistic city.",
    description: "Makes Night City feel truly alive with enhanced AI routines...",
    picture_url: "https://picsum.photos/600/400?random=2",
    author: "ModderX",
    endorsement_count: 12400,
    domain_name: "cyberpunk2077"
  },
  {
    mod_id: 11111,
    name: "Judy Romanced Enhanced",
    summary: "Adds new dialogue and interactions for Judy Alvarez.",
    description: "Expands the romance questline significantly...",
    picture_url: "https://picsum.photos/600/400?random=3",
    author: "StoryTeller",
    endorsement_count: 8900,
    domain_name: "cyberpunk2077"
  }
];
