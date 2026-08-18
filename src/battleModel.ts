import type {
  BattleChallengeRole,
  BattleRecordResultFilter,
  BattleResult,
  BattleSide,
  BattleType,
  CaptureTheFlagBattle,
  CaptureTheFlagBattleRecordFilters
} from './types';

export type BattleMatchLabelTone = 'challenger' | 'random' | 'system' | 'target';

export type BattleRecordFilterOption =
  | { kind: 'battleType'; value: BattleType }
  | { kind: 'challengeRole'; value: BattleChallengeRole }
  | { kind: 'result'; value: BattleRecordResultFilter };

export interface CaptureTheFlagBattleRecordRow {
  battleId: string;
  battleType: BattleType;
  challengeLabelKey: string | null;
  challengeRole: BattleChallengeRole | null;
  createdAt: string;
  mapId: string;
  matchLabelKey: string | null;
  matchLabelTone: BattleMatchLabelTone | null;
  matchLabelTooltipKey: string | null;
  ownHref: string | null;
  ownSide: BattleSide | null;
  opponentHref: string | null;
  opponentSide: BattleSide | null;
  ratingDelta: number | null;
  redName: string;
  replayHref: string | null;
  revengeHref: string | null;
  result: BattleResult;
  status: CaptureTheFlagBattle['status'];
  blueName: string;
}

export interface CaptureTheFlagBattleHrefResolvers {
  getTeamHref?(teamPublicId: string, view: 'owned' | 'public'): string | null;
  getReplayHref?(battle: CaptureTheFlagBattle): string | null;
  getRevengeHref?(battle: CaptureTheFlagBattle, ownTeamPublicId: string): string | null;
}

export const emptyCaptureTheFlagBattleRecordFilters: CaptureTheFlagBattleRecordFilters = {
  battleTypes: [],
  challengeRoles: [],
  results: []
};

export function createCaptureTheFlagBattleRecordRows(
  battles: readonly CaptureTheFlagBattle[],
  ownedPublicIds: ReadonlySet<string>,
  hrefResolvers: CaptureTheFlagBattleHrefResolvers = {}
): CaptureTheFlagBattleRecordRow[] {
  return battles.map((battle) => {
    const ownParticipant = battle.participants.find((participant) => ownedPublicIds.has(participant.public_id));
    const ownSide = ownParticipant?.side ?? null;
    const opponentSide = ownSide === 'red' ? 'blue' : ownSide === 'blue' ? 'red' : null;
    const opponentParticipant = opponentSide
      ? battle.participants.find((participant) => participant.side === opponentSide)
      : undefined;
    const matchLabel = getOwnerBattleMatchLabel(battle);
    const challengeRole = battle.match_source === 'direct_challenge' ? battle.challenge_role ?? null : null;
    return {
      battleId: battle.public_id,
      battleType: battle.battle_type,
      challengeLabelKey: challengeRole ? `dashboard.challenge.${challengeRole}` : null,
      challengeRole,
      createdAt: battle.created_at,
      mapId: battle.map_id,
      matchLabelKey: matchLabel?.key ?? null,
      matchLabelTone: matchLabel?.tone ?? null,
      matchLabelTooltipKey: matchLabel?.tooltipKey ?? null,
      ownHref: ownParticipant
        ? hrefResolvers.getTeamHref
          ? hrefResolvers.getTeamHref(ownParticipant.public_id, 'owned')
          : `/teams/${ownParticipant.public_id}`
        : null,
      ownSide,
      opponentHref: opponentParticipant && opponentParticipant.name_redacted !== true
        ? hrefResolvers.getTeamHref
          ? hrefResolvers.getTeamHref(opponentParticipant.public_id, 'public')
          : `/teams/public/${opponentParticipant.public_id}`
        : null,
      opponentSide,
      ratingDelta: battle.battle_type === 'ranked' ? ownParticipant?.rating_delta ?? null : null,
      redName: findParticipantName(battle, 'red'),
      replayHref: hrefResolvers.getReplayHref
        ? hrefResolvers.getReplayHref(battle)
        : getBattleRecordReplayHref(battle),
      revengeHref: ownParticipant
        ? hrefResolvers.getRevengeHref
          ? hrefResolvers.getRevengeHref(battle, ownParticipant.public_id)
          : getBattleRevengeHref(battle, ownedPublicIds)
        : null,
      result: getBattleRecordResult(battle, ownSide),
      status: battle.status,
      blueName: findParticipantName(battle, 'blue')
    };
  });
}

export function filterCaptureTheFlagBattleRecordRows(
  rows: readonly CaptureTheFlagBattleRecordRow[],
  filters: CaptureTheFlagBattleRecordFilters
): CaptureTheFlagBattleRecordRow[] {
  return rows.filter((row) => {
    if (filters.battleTypes.length > 0 && !filters.battleTypes.includes(row.battleType)) return false;
    if (filters.challengeRoles.length > 0 && (row.challengeRole === null || !filters.challengeRoles.includes(row.challengeRole))) return false;
    if (filters.results.length > 0) {
      return (row.result === 'win' || row.result === 'loss') && filters.results.includes(row.result);
    }
    return true;
  });
}

export function getActiveBattleRecordFilterCount(filters: CaptureTheFlagBattleRecordFilters): number {
  return filters.battleTypes.length + filters.challengeRoles.length + filters.results.length;
}

export function hasActiveBattleRecordFilters(filters: CaptureTheFlagBattleRecordFilters): boolean {
  return getActiveBattleRecordFilterCount(filters) > 0;
}

export function addBattleRecordFilter(
  filters: CaptureTheFlagBattleRecordFilters,
  option: BattleRecordFilterOption
): CaptureTheFlagBattleRecordFilters {
  return updateBattleRecordFilter(filters, option, true);
}

export function removeBattleRecordFilter(
  filters: CaptureTheFlagBattleRecordFilters,
  option: BattleRecordFilterOption
): CaptureTheFlagBattleRecordFilters {
  return updateBattleRecordFilter(filters, option, false);
}

export function toggleBattleRecordFilter(
  filters: CaptureTheFlagBattleRecordFilters,
  option: BattleRecordFilterOption
): CaptureTheFlagBattleRecordFilters {
  return hasBattleRecordFilter(filters, option)
    ? removeBattleRecordFilter(filters, option)
    : addBattleRecordFilter(filters, option);
}

function updateBattleRecordFilter(
  filters: CaptureTheFlagBattleRecordFilters,
  option: BattleRecordFilterOption,
  selected: boolean
): CaptureTheFlagBattleRecordFilters {
  switch (option.kind) {
    case 'battleType': return { ...filters, battleTypes: updateValues(filters.battleTypes, option.value, selected) };
    case 'challengeRole': return { ...filters, challengeRoles: updateValues(filters.challengeRoles, option.value, selected) };
    case 'result': return { ...filters, results: updateValues(filters.results, option.value, selected) };
  }
}

function hasBattleRecordFilter(filters: CaptureTheFlagBattleRecordFilters, option: BattleRecordFilterOption): boolean {
  switch (option.kind) {
    case 'battleType': return filters.battleTypes.includes(option.value);
    case 'challengeRole': return filters.challengeRoles.includes(option.value);
    case 'result': return filters.results.includes(option.value);
  }
}

function updateValues<T extends string>(values: T[], value: T, selected: boolean): T[] {
  if (selected) return values.includes(value) ? values : [...values, value];
  return values.filter((candidate) => candidate !== value);
}

function getOwnerBattleMatchLabel(battle: CaptureTheFlagBattle): {
  key: string;
  tone: BattleMatchLabelTone;
  tooltipKey: string;
} | null {
  if (battle.match_source === 'direct_challenge') {
    if (battle.challenge_role === 'challenger') return { key: 'dashboard.matchLabel.directChallengeStarted', tone: 'challenger', tooltipKey: 'dashboard.matchLabelTooltip.directChallengeStarted' };
    if (battle.challenge_role === 'target') return { key: 'dashboard.matchLabel.directChallengeReceived', tone: 'target', tooltipKey: 'dashboard.matchLabelTooltip.directChallengeReceived' };
    return null;
  }
  if (battle.match_source === 'practice_random' && battle.viewer_match_role === 'initiator') {
    return { key: 'dashboard.matchLabel.randomMatch', tone: 'random', tooltipKey: 'dashboard.matchLabelTooltip.practiceRandomStarted' };
  }
  if (battle.match_source === 'ranked_matchmaking') {
    if (battle.viewer_match_role === 'initiator') return { key: 'dashboard.matchLabel.randomMatch', tone: 'random', tooltipKey: 'dashboard.matchLabelTooltip.rankedRandomStarted' };
    if (battle.viewer_match_role === 'matched') return { key: 'dashboard.matchLabel.systemMatch', tone: 'system', tooltipKey: 'dashboard.matchLabelTooltip.rankedSystemMatched' };
  }
  return null;
}

function getBattleRecordReplayHref(battle: CaptureTheFlagBattle): string | null {
  if (battle.replay_available && battle.share_path) return battle.share_path;
  if (battle.status === 'pending' || battle.status === 'running') return `/battles/replay/${battle.public_id}`;
  return null;
}

function getBattleRevengeHref(battle: CaptureTheFlagBattle, ownedPublicIds: ReadonlySet<string>): string | null {
  if (!battle.can_revenge || !battle.revenge_target) return null;
  const ownParticipant = battle.participants.find((participant) => ownedPublicIds.has(participant.public_id));
  if (!ownParticipant) return null;
  const params = new URLSearchParams({ mode: 'captureTheFlag', battle_type: 'practice' });
  params.set('challenger_team_public_id', ownParticipant.public_id);
  params.set('opponent', 'specified');
  params.set('target_name', battle.revenge_target.name);
  params.set('target_team_public_id', battle.revenge_target.public_id);
  params.set('revenge_of_battle_public_id', battle.public_id);
  return `/battles/new?${params.toString()}`;
}

function findParticipantName(battle: CaptureTheFlagBattle, side: BattleSide): string {
  return battle.participants.find((participant) => participant.side === side)?.name ?? side;
}

function getBattleRecordResult(battle: CaptureTheFlagBattle, ownSide: BattleSide | null): BattleResult {
  if (battle.winner_side === 'draw') return 'draw';
  if (!battle.winner_side || !ownSide) return 'unresolved';
  return battle.winner_side === ownSide ? 'win' : 'loss';
}

