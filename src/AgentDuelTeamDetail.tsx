import {
  AgentDuelBadgeGallery,
  AgentDuelBattleMatchLabelBadge,
  AgentDuelBattleTypeBadge,
  AgentDuelOwnedBadgeGallery,
  type AgentDuelBadge,
  type AgentDuelOwnedBadge,
  type AgentDuelOwnedBadgeGalleryLabels
} from '@agentduel/component';
import { useId, useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLink, DefaultLink } from './components';
import { CaptureTheFlagI18nBoundary, normalizeLocale } from './i18n';
import type {
  BattleResult,
  BattleType,
  CaptureTheFlagBattle,
  CaptureTheFlagLinkComponent,
  TeamDetailBaseProps,
  TeamDetailCodeEditorProps,
  TeamDetailCodeVersion,
  TeamDetailCodeVersions,
  TeamDetailGuestProfile,
  TeamDetailGuestVersion,
  TeamDetailOptimizationTab,
  TeamDetailOwnerProfile,
  TeamDetailSectionStatus,
  TeamUnit
} from './types';
import './styles.css';

export interface AgentDuelTeamOwnerBasicProps extends TeamDetailBaseProps {
  activeBattleType: BattleType;
  canStartBattle: boolean;
  editHref: string;
  team: TeamDetailOwnerProfile;
  onBattleTypeChange(battleType: BattleType): void;
  onStartBattle(): void;
}

export interface AgentDuelTeamGuestBasicProps extends TeamDetailBaseProps {
  challengeHref: string;
  showRating?: boolean;
  team: TeamDetailGuestProfile;
}

export interface AgentDuelTeamOwnerBadgesProps extends TeamDetailBaseProps {
  badges: readonly AgentDuelOwnedBadge[];
  onSaveDisplay(equippedBadgeKeys: readonly string[], hiddenBadgeKeys: readonly string[]): Promise<void>;
}

export interface AgentDuelTeamGuestBadgesProps extends TeamDetailBaseProps {
  badges: readonly AgentDuelBadge[];
}

export interface AgentDuelTeamOwnerStatusProps extends TeamDetailBaseProps {
  team: TeamDetailOwnerProfile;
}

export interface AgentDuelTeamOwnerCodeSubmissionProps extends TeamDetailBaseProps {
  activeTab: TeamDetailOptimizationTab;
  agentToolNotice?: ReactNode;
  apiKey: string;
  apiKeyError: string | null;
  apiKeyVisible: boolean;
  copiedApiKey: boolean;
  copiedPrompt: boolean;
  isRotatingApiKey: boolean;
  isSubmitting: boolean;
  manualSourceCode: string;
  manualSubmitError: string | null;
  manualSubmitNotice: string | null;
  prompt: string;
  renderCodeEditor?(props: TeamDetailCodeEditorProps): ReactNode;
  showPromptGuide?: boolean;
  sourceStatus: TeamDetailSectionStatus;
  onCopyApiKey(): void;
  onCopyPrompt(): void;
  onManualSourceCodeChange(sourceCode: string): void;
  onRotateApiKey(): void;
  onSubmitManualCode(): void;
  onTabChange(tab: TeamDetailOptimizationTab): void;
  onToggleApiKey(): void;
}

export interface AgentDuelTeamOwnerCodeVersionsProps extends TeamDetailBaseProps {
  codeVersions: TeamDetailCodeVersions | null;
  error: string | null;
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
  settingVersionId: string | null;
  status: TeamDetailSectionStatus;
  onRetry(): void;
  onSetCurrentVersion(versionPublicId: string): void;
}

interface TeamBattleRecordsSectionProps extends TeamDetailBaseProps {
  battles: readonly CaptureTheFlagBattle[];
  error: string | null;
  getReplayHref?(battle: CaptureTheFlagBattle): string | null;
  getRevengeHref?(battle: CaptureTheFlagBattle): string | null;
  getTeamHref?(teamPublicId: string): string | null;
  hasMore: boolean;
  moreHref?: string;
  ownerTeamPublicId: string;
  status: TeamDetailSectionStatus;
  onLoadMore(): void;
  onRetry?(): void;
}

export type AgentDuelTeamOwnerBattleRecordsProps = TeamBattleRecordsSectionProps;
export type AgentDuelTeamGuestBattleRecordsProps = TeamBattleRecordsSectionProps;

export interface AgentDuelTeamGuestCurrentVersionProps extends TeamDetailBaseProps {
  renderAiModel?(aiModel: string | null, fallbackLabel: string): ReactNode;
  version: TeamDetailGuestVersion | null;
}

export function AgentDuelTeamOwnerBasic(props: AgentDuelTeamOwnerBasicProps) { return <Boundary props={props}><OwnerBasic {...props} /></Boundary>; }
export function AgentDuelTeamGuestBasic(props: AgentDuelTeamGuestBasicProps) { return <Boundary props={props}><GuestBasic {...props} /></Boundary>; }
export function AgentDuelTeamOwnerBadges(props: AgentDuelTeamOwnerBadgesProps) { return <Boundary props={props}><Badges owned {...props} /></Boundary>; }
export function AgentDuelTeamGuestBadges(props: AgentDuelTeamGuestBadgesProps) { return <Boundary props={props}><Badges {...props} /></Boundary>; }
export function AgentDuelTeamOwnerStatus(props: AgentDuelTeamOwnerStatusProps) { return <Boundary props={props}><OwnerStatus {...props} /></Boundary>; }
export function AgentDuelTeamOwnerCodeSubmission(props: AgentDuelTeamOwnerCodeSubmissionProps) { return <Boundary props={props}><CodeSubmission {...props} /></Boundary>; }
export function AgentDuelTeamOwnerCodeVersions(props: AgentDuelTeamOwnerCodeVersionsProps) { return <Boundary props={props}><CodeVersions {...props} /></Boundary>; }
export function AgentDuelTeamOwnerBattleRecords(props: AgentDuelTeamOwnerBattleRecordsProps) { return <Boundary props={props}><BattleRecords owner {...props} /></Boundary>; }
export function AgentDuelTeamGuestBattleRecords(props: AgentDuelTeamGuestBattleRecordsProps) { return <Boundary props={props}><BattleRecords {...props} /></Boundary>; }
export function AgentDuelTeamGuestCurrentVersion(props: AgentDuelTeamGuestCurrentVersionProps) { return <Boundary props={props}><GuestVersion {...props} /></Boundary>; }

function Boundary({ children, props }: { children: ReactNode; props: TeamDetailBaseProps }) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <CaptureTheFlagI18nBoundary locale={locale} mode={props.i18nMode}>
      <div className={['agentduel-capturetheflag', 'team-detail-section', props.className ?? ''].filter(Boolean).join(' ')} style={props.style}>{children}</div>
    </CaptureTheFlagI18nBoundary>
  );
}

function OwnerBasic({ activeBattleType, canStartBattle, editHref, linkComponent, onBattleTypeChange, onStartBattle, team }: AgentDuelTeamOwnerBasicProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const Link = linkComponent ?? DefaultLink;
  return (
    <section className="team-detail-basic" aria-labelledby={titleId}>
      <div><p className="dashboard-kicker">{t('teams.detail.slot', { slot: team.slot_no })}</p><div className="team-detail-title-row"><h1 id={titleId}>{team.name}</h1><Link aria-label={t('teams.detail.editDescription')} className="team-detail-edit-link" href={editHref}><PencilIcon /></Link></div><p className="team-detail-composition">{formatComposition(team.units, t)}</p><p>{team.description || t('teams.detail.noDescription')}</p></div>
      <div className="team-detail-battle-launch" aria-label={t('teams.detail.battleLaunchAria')}><div className="team-detail-tabs" role="tablist" aria-label={t('teams.detail.battleTypeTabsAria')}>{(['practice', 'ranked'] as const).map((type) => <button aria-selected={activeBattleType === type} key={type} onClick={() => onBattleTypeChange(type)} role="tab" type="button">{t(`dashboard.battleType.${type}`)}</button>)}</div><Button className="team-detail-battle-button" disabled={!canStartBattle} onClick={onStartBattle}>{t('teams.detail.startBattle')}</Button>{!canStartBattle ? <p>{t('teams.detail.contentRestrictedBattle')}</p> : null}</div>
    </section>
  );
}

function GuestBasic({ challengeHref, linkComponent, showRating = true, team }: AgentDuelTeamGuestBasicProps) {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className="team-detail-basic" aria-labelledby={titleId}><div><h1 id={titleId}>{team.name}</h1><p className="team-detail-composition">{formatComposition(team.units, t)}</p><p>{team.description || t('teams.detail.noDescription')}</p></div><div className="team-detail-guest-action">{showRating ? <div><span>{t('teams.detail.rating')}</span><strong>{team.ranked_rating}</strong></div> : null}<ButtonLink href={challengeHref} linkComponent={linkComponent}>{t('teams.detail.challengeTeam')}</ButtonLink></div></section>
  );
}

function Badges(props: (AgentDuelTeamOwnerBadgesProps & { owned: true }) | (AgentDuelTeamGuestBadgesProps & { owned?: false })) {
  const { t } = useTranslation();
  const labels = badgeLabels(t);
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return props.owned ? <AgentDuelOwnedBadgeGallery badges={props.badges} labels={labels} locale={locale} onSave={props.onSaveDisplay} /> : <AgentDuelBadgeGallery badges={props.badges} labels={labels} locale={locale} />;
}

function OwnerStatus({ locale, team }: AgentDuelTeamOwnerStatusProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const winRate = team.ranked_matches === 0 ? '0%' : `${Math.round(team.ranked_wins / team.ranked_matches * 100)}%`;
  const fields = [[t('teams.detail.composition'), formatComposition(team.units, t)], [t('teams.detail.codeSource'), t(`dashboard.codeSource.${team.code_source}`)], [t('teams.detail.rating'), String(team.ranked_rating)], [t('teams.detail.matches'), String(team.ranked_matches)], [t('teams.detail.wins'), String(team.ranked_wins)], [t('teams.detail.draws'), String(team.ranked_draws)], [t('teams.detail.losses'), String(team.ranked_losses)], [t('teams.detail.winRate'), winRate], [t('teams.detail.updatedAt'), formatDate(team.updated_at, normalizeLocale(locale ?? 'zh-CN'))]];
  return <section aria-labelledby={titleId}><Heading id={titleId} title={t('teams.detail.summaryTitle')} /><dl className="team-detail-stats">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>;
}

function CodeSubmission(props: AgentDuelTeamOwnerCodeSubmissionProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const masked = props.apiKey.length <= 8 ? '••••••••' : `${props.apiKey.slice(0, 4)}••••••••${props.apiKey.slice(-4)}`;
  return (
    <section aria-labelledby={titleId}>
      <Heading id={titleId} title={t('teams.detail.submitCodeTitle')} />
      <div className="team-detail-code-layout">
        <div className="team-detail-api-key">
          <div className="team-detail-api-key-label-row">
            <label>{t('teams.detail.apiKeyLabel')}</label>
            <button aria-label={props.apiKeyVisible ? t('teams.detail.hideApiKey') : t('teams.detail.showApiKey')} aria-pressed={props.apiKeyVisible} className="team-detail-api-key-eye" onClick={props.onToggleApiKey} type="button"><EyeIcon /></button>
          </div>
          <input aria-label={t('teams.detail.apiKeyLabel')} readOnly value={props.apiKeyVisible ? props.apiKey : masked} />
          <div className="team-detail-actions">
            <Button onClick={props.onCopyApiKey} size="sm" tone="neutral" variant="secondary">{props.copiedApiKey ? t('teams.detail.copied') : t('teams.detail.copyApiKey')}</Button>
            <Button loading={props.isRotatingApiKey} loadingLabel={t('teams.detail.rotatingApiKey')} onClick={props.onRotateApiKey} size="sm" tone="neutral" variant="secondary">{t('teams.detail.rotateApiKey')}</Button>
          </div>
          {props.apiKeyError ? <p className="team-detail-error">{props.apiKeyError}</p> : null}
        </div>
        <div className="team-detail-editor-panel">
          {props.showPromptGuide && props.activeTab === 'auto' ? <div className="team-detail-notice"><span>{t('teams.detail.promptGuide.badge')}</span><strong>{t('teams.detail.promptGuide.title')}</strong><p>{t('teams.detail.promptGuide.copy')}</p></div> : null}
          {props.activeTab === 'auto' ? props.agentToolNotice : null}
          <div className="team-detail-editor-toolbar">
            <div className="team-detail-tabs" role="tablist" aria-label={t('teams.detail.optimizationTabsAria')}>{(['auto', 'manual'] as const).map((tab) => <button aria-selected={props.activeTab === tab} key={tab} onClick={() => props.onTabChange(tab)} role="tab" type="button">{t(`teams.detail.${tab === 'auto' ? 'autoOptimization' : 'manualOptimization'}`)}</button>)}</div>
            {props.activeTab === 'auto' ? <Button onClick={props.onCopyPrompt} size="sm" tone="neutral" variant="secondary">{props.copiedPrompt ? t('teams.detail.promptCopied') : t('teams.detail.copyPrompt')}</Button> : <Button disabled={props.sourceStatus !== 'ready' || !props.manualSourceCode.trim()} loading={props.isSubmitting} loadingLabel={t('teams.detail.submittingManual')} onClick={props.onSubmitManualCode} size="sm" tone="neutral" variant="secondary">{t('teams.detail.submitManual')}</Button>}
          </div>
          {props.activeTab === 'auto' ? <pre className="team-detail-prompt">{props.prompt}</pre> : <TeamEditor {...props} />}
        </div>
      </div>
    </section>
  );
}

function TeamEditor(props: AgentDuelTeamOwnerCodeSubmissionProps) {
  const { t } = useTranslation();
  if (props.sourceStatus === 'loading') return <p>{t('teams.detail.sourceLoading')}</p>;
  if (props.sourceStatus === 'error') return <p className="team-detail-error">{t('teams.detail.sourceFailed')}</p>;
  if (props.sourceStatus !== 'ready') return <p>{t('teams.detail.noCurrentSource')}</p>;
  const editor: TeamDetailCodeEditorProps = { ariaLabel: t('teams.detail.manualOptimization'), onChange: props.onManualSourceCodeChange, readOnly: false, value: props.manualSourceCode };
  return <><div className="team-detail-code-editor">{props.renderCodeEditor ? props.renderCodeEditor(editor) : <textarea aria-label={editor.ariaLabel} onChange={(event) => editor.onChange(event.target.value)} value={editor.value} />}</div>{props.manualSubmitNotice ? <p className="team-detail-success">{props.manualSubmitNotice}</p> : null}{props.manualSubmitError ? <p className="team-detail-error">{props.manualSubmitError}</p> : null}</>;
}

function CodeVersions(props: AgentDuelTeamOwnerCodeVersionsProps) {
  const { t } = useTranslation();
  const titleId = useId();
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  const versions = useMemo(() => [...(props.codeVersions?.compiled_versions ?? [])].filter((item) => item.is_available).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 10), [props.codeVersions]);
  return <section aria-labelledby={titleId}><Heading id={titleId} title={t('teams.detail.codeVersionsTitle')} />{props.status === 'loading' ? <p>{t('teams.detail.codeVersionsLoading')}</p> : null}{props.status === 'error' ? <ErrorRetry message={t('teams.detail.codeVersionsFailed')} onRetry={props.onRetry} /> : null}{props.status === 'ready' ? <>{props.codeVersions?.latest_submission ? <Submission locale={locale} title={t('teams.detail.latestSubmission')} version={props.codeVersions.latest_submission} /> : null}{props.codeVersions?.latest_problem_submission ? <Submission locale={locale} title={t('teams.detail.latestProblemSubmission')} version={props.codeVersions.latest_problem_submission} /> : null}<h3>{t('teams.detail.compiledVersions')}</h3>{versions.length === 0 ? <p>{t('teams.detail.noCompiledVersions')}</p> : <ol className="team-detail-version-grid">{versions.map((version) => <li key={version.public_id}><VersionCard {...props} locale={locale} version={version} /></li>)}</ol>}{props.error ? <p className="team-detail-error">{props.error}</p> : null}</> : null}</section>;
}

function Submission({ locale, title, version }: { locale: string; title: string; version: TeamDetailCodeVersion }) {
  const { t } = useTranslation();
  return <article className="team-detail-submission"><div><span>{title}</span><strong>{t('teams.detail.versionNo', { version: version.version_no })}</strong><p>{version.change_summary || t('teams.detail.noChangeSummary')}</p></div><div><span>{t(`teams.detail.codeVersionStatus.${version.status}`)}</span><time>{formatDate(version.completed_at ?? version.created_at, locale)}</time></div>{version.diagnostics.length > 0 ? <details><summary>{t('teams.detail.viewDiagnostics', { count: version.diagnostics.length })}</summary><ol>{version.diagnostics.map((item, index) => <li key={`${item.stage}:${item.code}:${index}`}>{item.line ? `L${item.line} ` : ''}{item.message}</li>)}</ol></details> : null}</article>;
}

function VersionCard(props: AgentDuelTeamOwnerCodeVersionsProps & { locale: string; version: TeamDetailCodeVersion }) {
  const { t } = useTranslation();
  const v = props.version;
  return <article className={`team-detail-version-card${v.is_current ? ' is-current' : ''}`}><div className="character-version-card-header"><strong>{t('teams.detail.versionNo', { version: v.version_no })}</strong>{v.is_current ? <span>{t('teams.detail.currentVersion')}</span> : null}</div><p>{v.change_summary || t('teams.detail.noChangeSummary')}</p><div className="team-detail-version-meta">{props.renderAiModel?.(v.ai_model, t('teams.detail.unknownModel')) ?? <span>{v.ai_model || t('teams.detail.unknownModel')}</span>}<time>{formatDate(v.completed_at ?? v.created_at, props.locale)}</time></div><Button disabled={v.is_current} loading={props.settingVersionId === v.public_id} loadingLabel={t('teams.detail.settingCurrent')} onClick={() => props.onSetCurrentVersion(v.public_id)} size="sm" variant="secondary" width="full">{v.is_current ? t('teams.detail.currentVersion') : t('teams.detail.setCurrentVersion')}</Button></article>;
}

function GuestVersion({ renderAiModel, version }: AgentDuelTeamGuestCurrentVersionProps) {
  const { t } = useTranslation();
  const titleId = useId();
  if (!version) return null;
  return <section aria-labelledby={titleId}><Heading id={titleId} title={t('teams.detail.publicVersionTitle')} /><article className="team-detail-public-version"><div><strong>{t('teams.detail.versionNo', { version: version.version_no })}</strong>{renderAiModel?.(version.ai_model, t('teams.detail.unknownModel')) ?? <span>{version.ai_model || t('teams.detail.unknownModel')}</span>}</div><p>{version.change_summary || t('teams.detail.noChangeSummary')}</p></article></section>;
}

function BattleRecords(props: TeamBattleRecordsSectionProps & { owner?: boolean }) {
  const { t } = useTranslation();
  const titleId = useId();
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return <section aria-labelledby={titleId}><Heading action={props.moreHref ? <ButtonLink href={props.moreHref} linkComponent={props.linkComponent} size="sm" variant="secondary">{t('dashboard.recent.more')}</ButtonLink> : null} id={titleId} title={t('teams.detail.battleRecordsTitle')} />{props.status === 'loading' && props.battles.length === 0 ? <p>{t('teams.detail.battleRecordsLoading')}</p> : null}{props.status === 'error' && props.battles.length === 0 ? <ErrorRetry message={t('teams.detail.battleRecordsFailed')} onRetry={props.onRetry} /> : null}{props.status !== 'loading' && props.battles.length === 0 ? <p>{t('teams.detail.noBattleRecords')}</p> : null}<div className="team-detail-battle-list">{props.battles.map((battle) => <BattleRow battle={battle} key={battle.public_id} locale={locale} owner={props.owner === true} props={props} />)}</div>{props.error ? <p className="team-detail-error">{props.error}</p> : null}{props.hasMore ? <Button loading={props.status === 'loading'} loadingLabel={t('teams.detail.loadingMoreBattleRecords')} onClick={props.onLoadMore} size="sm" variant="secondary">{t('teams.detail.loadMoreBattleRecords')}</Button> : null}</section>;
}

function BattleRow({ battle, locale, owner, props }: { battle: CaptureTheFlagBattle; locale: string; owner: boolean; props: TeamBattleRecordsSectionProps }) {
  const { t } = useTranslation();
  const own = battle.participants.find((item) => item.public_id === props.ownerTeamPublicId);
  const red = battle.participants.find((item) => item.side === 'red');
  const blue = battle.participants.find((item) => item.side === 'blue');
  const result = getResult(battle, own?.side ?? null);
  const replay = props.getReplayHref?.(battle) ?? null;
  const revenge = props.getRevengeHref?.(battle) ?? null;
  const match = owner ? getMatchLabel(battle) : null;
  return <article className="team-detail-battle-row"><div><h3><Participant participant={red} props={props} /> <span>{t('dashboard.recent.vsSeparator')}</span> <Participant participant={blue} props={props} /></h3><p><time>{formatDate(battle.created_at, locale)}</time> · {t(`battleMap.names.${battle.map_id}`, { defaultValue: battle.map_id })}</p></div><div className="team-detail-battle-meta"><AgentDuelBattleTypeBadge battleType={battle.battle_type} label={t(`dashboard.battleType.${battle.battle_type}`)} />{match ? <AgentDuelBattleMatchLabelBadge label={t(match.key)} tone={match.tone} tooltip={t(match.tooltip)} /> : null}<strong className={`is-${result}`}>{t(`dashboard.result.${result}`)}</strong>{battle.battle_type === 'ranked' && own?.rating_delta !== null && own?.rating_delta !== undefined ? <strong className={own.rating_delta >= 0 ? 'is-rating-gain' : 'is-rating-loss'}>{t('dashboard.recent.ratingDelta', { delta: own.rating_delta > 0 ? `+${own.rating_delta}` : own.rating_delta })}</strong> : null}</div><div className="team-detail-actions">{revenge ? <ButtonLink className="team-detail-revenge-button" href={revenge} linkComponent={props.linkComponent} size="sm" variant="secondary">{t('dashboard.challenge.revenge')}</ButtonLink> : null}{replay ? <ButtonLink href={replay} linkComponent={props.linkComponent} size="sm" variant="secondary">{t('dashboard.actions.viewReplay')}</ButtonLink> : <span>{t('dashboard.recent.replayUnavailable')}</span>}</div></article>;
}

function Participant({ participant, props }: { participant: CaptureTheFlagBattle['participants'][number] | undefined; props: TeamBattleRecordsSectionProps }) {
  const { t } = useTranslation();
  const Link = props.linkComponent ?? DefaultLink;
  if (!participant) return <span>{t('teams.detail.unknownOpponent')}</span>;
  const href = participant.name_redacted ? null : props.getTeamHref?.(participant.public_id) ?? null;
  return href ? <Link className="team-detail-name-link" href={href}>{participant.name}</Link> : <span>{participant.name}</span>;
}

function Heading({ action, id, title }: { action?: ReactNode; id: string; title: string }) { return <div className="team-detail-heading"><h2 id={id}>{title}</h2>{action}</div>; }
function ErrorRetry({ message, onRetry }: { message: string; onRetry?(): void }) { const { t } = useTranslation(); return <div><p className="team-detail-error">{message}</p>{onRetry ? <Button onClick={onRetry} size="sm" variant="secondary">{t('teams.detail.error.retry')}</Button> : null}</div>; }

function PencilIcon() {
  return <svg aria-hidden="true" fill="none" focusable="false" viewBox="0 0 24 24"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function EyeIcon() {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
}

function badgeLabels(t: ReturnType<typeof useTranslation>['t']): AgentDuelOwnedBadgeGalleryLabels {
  return { title: t('badges.title'), equippedTitle: t('badges.visibility.equippedTitle'), hiddenTitle: t('badges.visibility.hiddenTitle'), count: (count) => t('badges.count', { count }), awardedAt: (date) => t('badges.awardedAt', { date }), edit: t('badges.visibility.edit'), save: t('badges.visibility.save'), cancel: t('badges.visibility.cancel'), saving: t('common.processing'), hide: t('badges.visibility.hide'), show: t('badges.visibility.show'), visitorHint: t('badges.visibility.visitorHint'), equippedDropEmpty: t('badges.visibility.equippedDropEmpty'), hiddenDropEmpty: t('badges.visibility.hiddenDropEmpty'), saveFailed: t('badges.visibility.saveFailed'), dragInstructions: t('badges.visibility.dragInstructions'), dragStarted: (name) => t('badges.visibility.dragStarted', { name }), dragOverEquipped: (name) => t('badges.visibility.dragOverEquipped', { name }), dragOverHidden: (name) => t('badges.visibility.dragOverHidden', { name }), draggedToEquipped: (name) => t('badges.visibility.draggedToEquipped', { name }), draggedToHidden: (name) => t('badges.visibility.draggedToHidden', { name }), dragCancelled: t('badges.visibility.dragCancelled') };
}

function formatComposition(units: readonly TeamUnit[], t: ReturnType<typeof useTranslation>['t']): string { return [...units].sort((a, b) => (a.slot_no ?? 0) - (b.slot_no ?? 0)).map((unit) => t(`replay.class.${unit.class_id}`)).join(' / '); }
function formatDate(value: string, locale: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date); }
function getResult(battle: CaptureTheFlagBattle, ownSide: 'red' | 'blue' | null): BattleResult { if (battle.winner_side === 'draw') return 'draw'; if (!battle.winner_side || !ownSide) return 'unresolved'; return battle.winner_side === ownSide ? 'win' : 'loss'; }
function getMatchLabel(battle: CaptureTheFlagBattle): { key: string; tooltip: string; tone: 'challenger' | 'random' | 'system' | 'target' } | null { if (battle.match_source === 'direct_challenge') return battle.challenge_role === 'target' ? { key: 'dashboard.matchLabel.directChallengeReceived', tooltip: 'dashboard.matchLabelTooltip.directChallengeReceived', tone: 'target' } : { key: 'dashboard.matchLabel.directChallengeStarted', tooltip: 'dashboard.matchLabelTooltip.directChallengeStarted', tone: 'challenger' }; if (battle.match_source === 'ranked_matchmaking' && battle.viewer_match_role === 'matched') return { key: 'dashboard.matchLabel.systemMatch', tooltip: 'dashboard.matchLabelTooltip.rankedSystemMatched', tone: 'system' }; if (battle.match_source === 'practice_random' || battle.match_source === 'ranked_matchmaking') return { key: 'dashboard.matchLabel.randomMatch', tooltip: battle.battle_type === 'ranked' ? 'dashboard.matchLabelTooltip.rankedRandomStarted' : 'dashboard.matchLabelTooltip.practiceRandomStarted', tone: 'random' }; return null; }
