import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLink } from './components';
import { CaptureTheFlagI18nBoundary, normalizeLocale } from './i18n';
import { createTeamUpdateInput, getTeamEditFormState } from './teamEditModel';
import type { AgentDuelTeamEditProps, CaptureTheFlagTeam } from './types';
import { readCaptureTheFlagError } from './types';
import './styles.css';

type Status = 'loading' | 'ready' | 'error';

export function AgentDuelTeamEdit(props: AgentDuelTeamEditProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <CaptureTheFlagI18nBoundary locale={locale} mode={props.i18nMode}>
      <TeamEditContent {...props} normalizedLocale={locale} />
    </CaptureTheFlagI18nBoundary>
  );
}

function TeamEditContent({
  className,
  dataSource,
  linkComponent,
  normalizedLocale,
  onTeamSaved,
  onUnauthorized,
  style,
  teamDetailHref = (publicId) => `/teams/${publicId}`,
  teamPublicId
}: AgentDuelTeamEditProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [team, setTeam] = useState<CaptureTheFlagTeam | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!teamPublicId) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setFormError(null);
    try {
      const nextTeam = await dataSource.loadTeam(teamPublicId, normalizedLocale);
      setTeam(nextTeam);
      setName(nextTeam.name);
      setDescription(nextTeam.description ?? '');
      setStatus('ready');
    } catch (error) {
      if (readCaptureTheFlagError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setStatus('error');
    }
  }, [dataSource, normalizedLocale, onUnauthorized, teamPublicId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!team) return;

    const submission = createTeamUpdateInput(team, name, description);
    if (submission.error || !submission.input) {
      setFormError(t(`teams.edit.errors.${submission.error ?? 'saveFailed'}`));
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      const nextTeam = await dataSource.updateTeam(team.public_id, submission.input, normalizedLocale);
      onTeamSaved(nextTeam);
    } catch (error) {
      if (readCaptureTheFlagError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setFormError(t('teams.edit.errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  }

  const rootClassName = [
    'agentduel-capturetheflag',
    'capturetheflag-team-edit',
    className ?? ''
  ].filter(Boolean).join(' ');

  if (status === 'loading') {
    return (
      <div className={rootClassName} style={style}>
        <div className="dashboard-loading" role="status"><p>{t('teams.detail.loading')}</p></div>
      </div>
    );
  }
  if (status === 'error' || !team) {
    return (
      <div className={rootClassName} style={style}>
        <section className="dashboard-error" aria-labelledby="team-detail-error-title">
          <p className="dashboard-kicker">{t('teams.detail.error.kicker')}</p>
          <h1 id="team-detail-error-title">{t('teams.detail.error.title')}</h1>
          <p>{t('teams.detail.error.copy')}</p>
          <Button onClick={() => void load()} variant="secondary" tone="neutral">
            {t('teams.detail.error.retry')}
          </Button>
        </section>
      </div>
    );
  }

  return (
    <div className={rootClassName} style={style}>
      <TeamEditForm
        description={description}
        formError={formError}
        isSaving={isSaving}
        linkComponent={linkComponent}
        name={name}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onSubmit={handleSubmit}
        team={team}
        teamDetailHref={teamDetailHref(team.public_id)}
      />
    </div>
  );
}

function TeamEditForm({
  description,
  formError,
  isSaving,
  linkComponent,
  name,
  onDescriptionChange,
  onNameChange,
  onSubmit,
  team,
  teamDetailHref
}: {
  description: string;
  formError: string | null;
  isSaving: boolean;
  linkComponent: AgentDuelTeamEditProps['linkComponent'];
  name: string;
  onDescriptionChange(value: string): void;
  onNameChange(value: string): void;
  onSubmit(event: FormEvent<HTMLFormElement>): void;
  team: CaptureTheFlagTeam;
  teamDetailHref: string;
}) {
  const { t } = useTranslation();
  const {
    hasRequiredChange,
    isDescriptionInvalid,
    isNameInvalid,
    isSuspended,
    requiresName
  } = getTeamEditFormState(team, name, description);

  return (
    <>
      <section className="character-detail-hero" aria-labelledby="team-edit-title">
        <div>
          <p className="dashboard-kicker">{t('teams.edit.kicker')}</p>
          <h1 id="team-edit-title">{t('teams.edit.title')}</h1>
          <p>{t('teams.edit.copy')}</p>
          {team.status !== 'active' ? (
            <p className="content-remediation-inline-notice" role="status">
              {isSuspended
                ? t('teams.edit.suspendedNotice')
                : team.remediation?.submitted_at
                  ? t('teams.edit.submittedNotice')
                  : t('teams.edit.requiredNotice')}
            </p>
          ) : null}
        </div>
      </section>
      <section className="dashboard-section character-edit-section" aria-labelledby="team-edit-form-title">
        <div className="dashboard-section-heading">
          <h2 id="team-edit-form-title">{t('teams.edit.formTitle')}</h2>
        </div>
        <form className="character-edit-form" onSubmit={onSubmit}>
          <label className="character-create-field">
            <span>{t('teams.edit.nameLabel')}</span>
            <input
              disabled={isSaving || isSuspended}
              maxLength={30}
              onChange={(event) => onNameChange(event.target.value)}
              readOnly={!requiresName}
              required={requiresName}
              value={name}
            />
            <small className={isNameInvalid ? 'is-invalid' : undefined}>
              {requiresName ? t('teams.edit.nameRemediationHelp') : t('teams.edit.nameImmutableHelp')}
            </small>
          </label>
          <label className="character-create-field">
            <span>{t('teams.edit.descriptionLabel')}</span>
            <textarea
              disabled={isSaving || isSuspended}
              maxLength={300}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={6}
              value={description}
            />
            <small className={isDescriptionInvalid ? 'is-invalid' : undefined}>
              {t('teams.edit.descriptionHelp', { count: description.length })}
            </small>
          </label>
          {formError ? <p className="character-create-form-error" role="alert">{formError}</p> : null}
          <div className="character-edit-actions">
            <ButtonLink
              href={teamDetailHref}
              linkComponent={linkComponent}
              variant="secondary"
              tone="neutral"
            >
              {t('teams.edit.cancel')}
            </ButtonLink>
            <Button
              disabled={isDescriptionInvalid || isNameInvalid || !hasRequiredChange || isSuspended}
              loading={isSaving}
              loadingLabel={t('teams.edit.saving')}
              type="submit"
            >
              {team.status === 'active' ? t('teams.edit.save') : t('teams.edit.submitRemediation')}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
