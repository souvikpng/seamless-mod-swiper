import { Game } from '../types';

export interface GamePresentation {
  code: string;
  name: string;
  primaryClass: string;
  secondaryClass: string;
  dangerClass: string;
  primaryBorderClass: string;
  secondaryBorderClass: string;
  primaryBgClass: string;
  secondaryBgClass: string;
  softPrimaryBgClass: string;
  softSecondaryBgClass: string;
  headerStatus: string;
  bootSystem: string;
  bootTitle: string;
  bootDescription: string;
  bootProgressLabel: string;
  bootStatusFallback: string;
  bootThroughputFallback: string;
  phaseLabels: Record<'auth' | 'pool' | 'fetching' | 'lists' | 'complete', string>;
  currentState: string;
  completeState: string;
  waitingState: string;
  introLabel: string;
  previewState: string;
  nextLabel: string;
  readyLabel: string;
  recallLabel: string;
  loadingTitle: string;
  loadingBody: string;
  loadingSubtext: string;
  emptyTitle: string;
  emptyBody: string;
  emptySubtext: string;
  approveLabel: string;
  rejectLabel: string;
  approveOverlayLabel: string;
  rejectOverlayLabel: string;
  approvedListTitle: string;
  emptyApprovedText: string;
  queueLabel: string;
  introStatus: string;
  refreshStatus: string;
  refreshTitle: string;
  refreshBody: string;
}

const cyberpunkPresentation: GamePresentation = {
  code: 'SMS',
  name: 'Cyberpunk 2077',
  primaryClass: 'text-cp-yellow',
  secondaryClass: 'text-cp-cyan',
  dangerClass: 'text-cp-red',
  primaryBorderClass: 'border-cp-yellow',
  secondaryBorderClass: 'border-cp-cyan',
  primaryBgClass: 'bg-cp-yellow',
  secondaryBgClass: 'bg-cp-cyan',
  softPrimaryBgClass: 'bg-cp-yellow/10',
  softSecondaryBgClass: 'bg-cp-cyan/10',
  headerStatus: 'NET_STATUS: ONLINE',
  bootSystem: 'Nexus Secure Uplink',
  bootTitle: 'JACKING IN...',
  bootDescription: 'Rebuilding your swipe deck, syncing cache shards, and priming the next batch before you hit the stack.',
  bootProgressLabel: 'Boot Sequence',
  bootStatusFallback: 'Standing by for handshake...',
  bootThroughputFallback: 'Awaiting telemetry',
  phaseLabels: {
    auth: 'Credential Handshake',
    pool: 'Scanning Mod Pool',
    fetching: 'Pulling Mod Packets',
    lists: 'Syncing Curated Feeds',
    complete: 'Deck Primed',
  },
  currentState: 'Live',
  completeState: 'Locked',
  waitingState: 'Standby',
  introLabel: 'DECK PRIMING',
  previewState: 'Buffered',
  nextLabel: 'Next In Queue',
  readyLabel: 'ready',
  recallLabel: 'RECALL CONFIRMED',
  loadingTitle: 'JACKING IN...',
  loadingBody: 'Rebuilding your queue from the Nexus uplink.',
  loadingSubtext: 'Hold tight - fresh cards are being assembled.',
  emptyTitle: 'Queue Depleted',
  emptyBody: 'You have swiped through the current batch.',
  emptySubtext: 'Use the refresh button to build a new stack.',
  approveLabel: 'Approve',
  rejectLabel: 'Reject',
  approveOverlayLabel: 'Install',
  rejectOverlayLabel: 'Skip',
  approvedListTitle: 'APPROVED_MODS_CACHE',
  emptyApprovedText: 'NO DATA FRAGMENTS FOUND. RETURN TO SCANNING.',
  queueLabel: 'buffered',
  introStatus: 'deck priming...',
  refreshStatus: 'refreshing buffer...',
  refreshTitle: 'Buffer Refresh',
  refreshBody: 'Fetching fresh packets from the Nexus uplink.',
};

const newVegasPresentation: GamePresentation = {
  code: 'MMS',
  name: 'Fallout: New Vegas',
  primaryClass: 'text-[#d9902f]',
  secondaryClass: 'text-[#6bbf59]',
  dangerClass: 'text-[#d45f3d]',
  primaryBorderClass: 'border-[#d9902f]',
  secondaryBorderClass: 'border-[#6bbf59]',
  primaryBgClass: 'bg-[#d9902f]',
  secondaryBgClass: 'bg-[#6bbf59]',
  softPrimaryBgClass: 'bg-[#d9902f]/10',
  softSecondaryBgClass: 'bg-[#6bbf59]/10',
  headerStatus: 'RADIO_STATUS: TUNED',
  bootSystem: 'Mojave Relay Station',
  bootTitle: 'TUNING RADIO...',
  bootDescription: 'Dialing into the Nexus signal, checking the local cache, and dealing a fresh stack for the Mojave run.',
  bootProgressLabel: 'Signal Lock',
  bootStatusFallback: 'Waiting for a clean frequency...',
  bootThroughputFallback: 'Listening for carrier wave',
  phaseLabels: {
    auth: 'Ranger Pass Check',
    pool: 'Sweeping the Mojave Band',
    fetching: 'Recovering Mod Broadcasts',
    lists: 'Checking Caravan Routes',
    complete: 'Hand Dealt',
  },
  currentState: 'On Air',
  completeState: 'Logged',
  waitingState: 'Static',
  introLabel: 'CARAVAN DEALING',
  previewState: 'Queued',
  nextLabel: 'Next Broadcast',
  readyLabel: 'armed',
  recallLabel: 'UNDO LOGGED',
  loadingTitle: 'TUNING RADIO...',
  loadingBody: 'Rebuilding your route from the Nexus relay.',
  loadingSubtext: 'Hold steady - fresh cards are coming over the wire.',
  emptyTitle: 'Trail Cleared',
  emptyBody: 'You have checked every mod in the current hand.',
  emptySubtext: 'Use refresh to tune another Mojave broadcast.',
  approveLabel: 'Keep',
  rejectLabel: 'Pass',
  approveOverlayLabel: 'Keep',
  rejectOverlayLabel: 'Pass',
  approvedListTitle: 'MOJAVE_KEEP_LEDGER',
  emptyApprovedText: 'NO KEEPERS LOGGED. RETURN TO THE TRAIL.',
  queueLabel: 'on frequency',
  introStatus: 'dealing hand...',
  refreshStatus: 'tuning relay...',
  refreshTitle: 'Relay Refresh',
  refreshBody: 'Tuning fresh broadcasts from the Nexus relay.',
};

export const getGamePresentation = (game: Game): GamePresentation => {
  if (game === Game.NEWVEGAS) {
    return newVegasPresentation;
  }

  return cyberpunkPresentation;
};

export const isNewVegas = (game: Game) => game === Game.NEWVEGAS;
