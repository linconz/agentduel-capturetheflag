import type { CSSProperties, ReactNode } from 'react';

export type CaptureTheFlagLocale = 'zh-CN' | 'en-US' | 'zh_CN' | 'en_US';
export type NormalizedCaptureTheFlagLocale = 'zh-CN' | 'en-US';
export type CaptureTheFlagI18nMode = 'bundled' | 'host';
export type CharacterClassId = 'warrior' | 'mage' | 'hunter';
export type ContentStatus = 'active' | 'name_violation' | 'description_violation' | 'all_violation' | 'suspended';
export type BattleType = 'practice' | 'ranked';
export type BattleStatus = 'pending' | 'running' | 'done' | 'error' | 'canceled';
export type BattleSide = 'red' | 'blue';
export type BattleResult = 'win' | 'loss' | 'draw' | 'unresolved';
export type BattleChallengeRole = 'challenger' | 'target';
export type BattleRecordResultFilter = 'win' | 'loss';

export interface ContentRemediationSummary {
  violation_type: 'name_violation' | 'description_violation' | 'all_violation';
  marked_at: string;
  submitted_at: string | null;
}

export interface TeamUnit {
  slot_no?: number;
  class_id: CharacterClassId;
}

export interface CaptureTheFlagTeam {
  public_id: string;
  name: string;
  description: string | null;
  status: ContentStatus;
  remediation: ContentRemediationSummary | null;
  units: TeamUnit[];
}

export interface TeamCreateContext {
  teamCount: number;
  maxTeamSlots: number;
}

export interface TeamCreateInput {
  name: string;
  units: Array<{ class_id: CharacterClassId }>;
}

export interface TeamUpdateInput {
  name?: string;
  description?: string;
}

export interface TeamCreateDataSource {
  loadContext(locale: NormalizedCaptureTheFlagLocale): Promise<TeamCreateContext>;
  createTeam(input: TeamCreateInput, locale: NormalizedCaptureTheFlagLocale): Promise<CaptureTheFlagTeam>;
  resolveErrorMessage?(error: unknown, locale: NormalizedCaptureTheFlagLocale): Promise<string | null>;
}

export interface TeamEditDataSource {
  loadTeam(teamPublicId: string, locale: NormalizedCaptureTheFlagLocale): Promise<CaptureTheFlagTeam>;
  updateTeam(
    teamPublicId: string,
    input: TeamUpdateInput,
    locale: NormalizedCaptureTheFlagLocale
  ): Promise<CaptureTheFlagTeam>;
}

export interface CaptureTheFlagBattleParticipant {
  side: BattleSide;
  kind: 'team';
  public_id: string;
  name: string;
  name_redacted?: boolean;
  units?: TeamUnit[];
  rating_delta: number | null;
}

export interface CaptureTheFlagBattle {
  public_id: string;
  share_path: string | null;
  battle_type: BattleType;
  match_source?: 'practice_random' | 'direct_challenge' | 'ranked_matchmaking';
  viewer_match_role?: 'initiator' | 'matched' | null;
  challenge_role?: BattleChallengeRole | null;
  can_revenge?: boolean;
  revenge_target?: { public_id: string; name: string } | null;
  game_mode_id: 'captureTheFlag';
  map_id: string;
  status: BattleStatus;
  participants: CaptureTheFlagBattleParticipant[];
  winner_side: BattleSide | 'draw' | null;
  replay_available: boolean;
  created_at: string;
}

export interface CaptureTheFlagBattleRecordsPage {
  battles: CaptureTheFlagBattle[];
  next_cursor: string | null;
}

export interface CaptureTheFlagBattleRecordFilters {
  battleTypes: BattleType[];
  challengeRoles: BattleChallengeRole[];
  results: BattleRecordResultFilter[];
}

export interface CaptureTheFlagBattleRecordsQuery extends CaptureTheFlagBattleRecordFilters {
  cursor?: string | null;
  limit?: number;
}

export interface CaptureTheFlagRecentBattlesContext {
  ownedTeamPublicIds: string[];
}

export interface CaptureTheFlagRecentBattlesDataSource {
  loadContext(locale: NormalizedCaptureTheFlagLocale): Promise<CaptureTheFlagRecentBattlesContext>;
  loadBattles(
    query: CaptureTheFlagBattleRecordsQuery,
    locale: NormalizedCaptureTheFlagLocale
  ): Promise<CaptureTheFlagBattleRecordsPage>;
}

export interface CaptureTheFlagLinkProps {
  'aria-label'?: string;
  children: ReactNode;
  className?: string;
  href: string;
}

export type CaptureTheFlagLinkComponent = (props: CaptureTheFlagLinkProps) => ReactNode;

export interface CaptureTheFlagModuleProps {
  className?: string;
  i18nMode?: CaptureTheFlagI18nMode;
  linkComponent?: CaptureTheFlagLinkComponent;
  locale?: CaptureTheFlagLocale;
  onUnauthorized(): void;
  style?: CSSProperties;
}

export interface AgentDuelTeamCreateProps extends CaptureTheFlagModuleProps {
  assetBaseUrl?: string;
  backToDashboardHref?: string;
  dataSource: TeamCreateDataSource;
  onTeamCreated(team: CaptureTheFlagTeam): void;
}

export interface AgentDuelTeamEditProps extends CaptureTheFlagModuleProps {
  dashboardHref?: string;
  teamDetailHref?(teamPublicId: string): string;
  teamPublicId: string;
  dataSource: TeamEditDataSource;
  onTeamSaved(team: CaptureTheFlagTeam): void;
}

export interface AgentDuelCaptureTheFlagRecentBattlesProps extends CaptureTheFlagModuleProps {
  assetBaseUrl?: string;
  dashboardHref?: string;
  dataSource: CaptureTheFlagRecentBattlesDataSource;
  getTeamHref?(teamPublicId: string, view: 'owned' | 'public'): string | null;
  getReplayHref?(battle: CaptureTheFlagBattle): string | null;
  getRevengeHref?(battle: CaptureTheFlagBattle, ownTeamPublicId: string): string | null;
}

export type TeamListSubmissionStatus = 'pending_compile' | 'compiling' | 'compile_failed' | 'rejected';

export interface TeamListLatestSubmission {
  version_no: number;
  status: TeamListSubmissionStatus;
}

export interface TeamListActiveCode {
  version_no: number;
  ai_model: string | null;
}

export interface TeamListRankedResults {
  wins: number;
  draws: number;
  losses: number;
}

export interface CaptureTheFlagTeamListItem {
  public_id: string;
  name: string;
  status?: ContentStatus;
  units: TeamUnit[];
  created_at: string;
  active_code: TeamListActiveCode | null;
  ranked_rating: number;
  ranked_results: TeamListRankedResults;
  latest_submission: TeamListLatestSubmission | null;
}

export type AgentDuelTeamListProps = Omit<CaptureTheFlagModuleProps, 'onUnauthorized'> & {
  teams: CaptureTheFlagTeamListItem[];
  createTeamHref?: string;
  dashboardHref?: string;
  getTeamHref?(teamPublicId: string): string;
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
};

export class CaptureTheFlagApiError extends Error {
  readonly status: number;
  readonly code: string | null;

  constructor(
    status: number,
    code: string | null = null,
    message = `Capture-the-flag request failed with status ${status}`
  ) {
    super(message);
    this.name = 'CaptureTheFlagApiError';
    this.status = status;
    this.code = code;
  }
}

export function readCaptureTheFlagError(error: unknown): { status: number | null; code: string | null } {
  if (!error || typeof error !== 'object') {
    return { status: null, code: null };
  }
  const candidate = error as Record<string, unknown>;
  return {
    status: typeof candidate.status === 'number' ? candidate.status : null,
    code: typeof candidate.code === 'string' ? candidate.code : null
  };
}
