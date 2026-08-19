import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonLink, DefaultLink } from './components';
import { CaptureTheFlagI18nBoundary, normalizeLocale } from './i18n';
import type {
  AgentDuelTeamListProps,
  CaptureTheFlagLinkComponent,
  CaptureTheFlagTeamListItem,
  TeamListLatestSubmission
} from './types';
import './styles.css';

export function AgentDuelTeamList(props: AgentDuelTeamListProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <CaptureTheFlagI18nBoundary locale={locale} mode={props.i18nMode}>
      <TeamListContent {...props} normalizedLocale={locale} />
    </CaptureTheFlagI18nBoundary>
  );
}

function TeamListContent({
  className,
  createTeamHref = '/teams/new',
  getTeamHref = defaultTeamHref,
  linkComponent,
  normalizedLocale,
  renderAiModel,
  style,
  teams
}: AgentDuelTeamListProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const pending = teams.filter(isPendingSubmission);
  const problems = teams.filter(isProblemSubmission);
  const rootClassName = ['agentduel-capturetheflag', 'capturetheflag-team-list', className ?? ''].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} style={style}>
      <section className="mode-list-heading" aria-labelledby="capturetheflag-team-list-title">
        <div>
          <p className="dashboard-kicker">{t('dashboard.sidebar.captureTheFlag')}</p>
          <h1 id="capturetheflag-team-list-title">{t('dashboard.sidebar.teams')}</h1>
          <p>{t('dashboard.modePage.teamsCopy')}</p>
        </div>
        <ButtonLink href={createTeamHref} linkComponent={linkComponent} variant="secondary">
          {t('dashboard.teams.create')}
        </ButtonLink>
      </section>
      {pending.length > 0 ? (
        <SubmissionSection
          getTeamHref={getTeamHref}
          linkComponent={linkComponent}
          teams={pending}
          title={t('dashboard.modePage.compiling')}
        />
      ) : null}
      {problems.length > 0 ? (
        <SubmissionSection
          getTeamHref={getTeamHref}
          linkComponent={linkComponent}
          problem
          teams={problems}
          title={t('dashboard.attention.title')}
        />
      ) : null}
      <section className="mode-list-section" aria-labelledby="capturetheflag-team-list-section-title">
        <div className="dashboard-section-heading">
          <h2 id="capturetheflag-team-list-section-title">{t('dashboard.sidebar.teams')}</h2>
          <span className="mode-list-count">{teams.length}</span>
        </div>
        {teams.length === 0 ? (
          <div className="mode-list-empty"><p>{t('dashboard.teams.empty')}</p></div>
        ) : (
          <div className="mode-list-rows">
            {teams.map((team) => (
              <TeamRow
                dateLocale={normalizedLocale}
                getTeamHref={getTeamHref}
                key={team.public_id}
                linkComponent={linkComponent}
                renderAiModel={renderAiModel}
                team={team}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SubmissionSection({
  getTeamHref,
  linkComponent: Link = DefaultLink,
  problem = false,
  teams,
  title
}: {
  getTeamHref(teamPublicId: string): string;
  linkComponent?: CaptureTheFlagLinkComponent;
  problem?: boolean;
  teams: CaptureTheFlagTeamListItem[];
  title: string;
}) {
  const { t } = useTranslation();
  return (
    <section className={`mode-list-submission-section${problem ? ' is-problem' : ''}`} aria-label={title}>
      <div className="dashboard-section-heading"><h2>{title}</h2></div>
      <div className="mode-list-submission-rows">
        {teams.map((team) => {
          const submission = team.latest_submission;
          if (!submission) return null;
          return (
            <Link className="mode-list-submission-row" href={getTeamHref(team.public_id)} key={team.public_id}>
              <span>{team.name}</span>
              <span>v{submission.version_no}</span>
              <strong>{t(`dashboard.submission.${submission.status}`)}</strong>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function TeamRow({
  dateLocale,
  getTeamHref,
  linkComponent: Link = DefaultLink,
  renderAiModel,
  team
}: {
  dateLocale: 'zh-CN' | 'en-US';
  getTeamHref(teamPublicId: string): string;
  linkComponent?: CaptureTheFlagLinkComponent;
  renderAiModel?: AgentDuelTeamListProps['renderAiModel'];
  team: CaptureTheFlagTeamListItem;
}) {
  const { t } = useTranslation();
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }),
    [dateLocale]
  );
  const results = team.ranked_results;
  const roles = team.units.map((unit) => t(`replay.class.${unit.class_id}`)).join(' / ');
  const fallbackModelLabel = t('dashboard.modePage.unknownModel');

  return (
    <Link
      className="mode-list-row"
      href={getTeamHref(team.public_id)}
      aria-label={t('dashboard.teams.openDetail', { name: team.name })}
    >
      <div className="mode-list-identity">
        <h3>{team.name}</h3>
        <p>{roles} · {dateFormatter.format(new Date(team.created_at))}</p>
      </div>
      <div className="mode-list-metrics">
        <div className="mode-list-state">
          <span>{t('dashboard.modePage.status')}</span>
          {team.status !== undefined && team.status !== 'active' ? (
            <strong className="mode-list-content-status">{t(`dashboard.remediation.status.${team.status}`)}</strong>
          ) : team.active_code ? (
            <strong className="mode-list-active-code">
              <span>v{team.active_code.version_no}</span>
              {renderAiModel
                ? renderAiModel(team.active_code.ai_model, fallbackModelLabel)
                : <span>{team.active_code.ai_model?.trim() || fallbackModelLabel}</span>}
            </strong>
          ) : <strong>{t('dashboard.codeSource.none')}</strong>}
        </div>
        <div>
          <span>{t('dashboard.modePage.record')}</span>
          <strong>{results.wins}/{results.draws}/{results.losses}</strong>
        </div>
        <div>
          <span>{t('dashboard.stats.rating')}</span>
          <strong>{team.ranked_rating}</strong>
        </div>
      </div>
      <svg className="mode-list-arrow" viewBox="0 0 10 12" aria-hidden="true" focusable="false">
        <path d="M2 1.5L8 6L2 10.5Z" fill="currentColor" />
      </svg>
    </Link>
  );
}

function defaultTeamHref(teamPublicId: string): string {
  return `/teams/${teamPublicId}`;
}

function isPendingSubmission(team: CaptureTheFlagTeamListItem): boolean {
  const submission = team.latest_submission;
  return submission !== null
    && (submission.status === 'pending_compile' || submission.status === 'compiling')
    && isNewerThanActive(submission, team);
}

function isProblemSubmission(team: CaptureTheFlagTeamListItem): boolean {
  const submission = team.latest_submission;
  return submission !== null
    && (submission.status === 'compile_failed' || submission.status === 'rejected')
    && isNewerThanActive(submission, team);
}

function isNewerThanActive(
  submission: TeamListLatestSubmission,
  team: CaptureTheFlagTeamListItem
): boolean {
  return team.active_code === null || submission.version_no > team.active_code.version_no;
}
