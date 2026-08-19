import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonLink } from './components';
import { CaptureTheFlagI18nBoundary, normalizeLocale } from './i18n';
import {
  areTeamClassSlotsSelected,
  characterClassOrder,
  characterClassProfiles,
  getInitialTeamClassIdForSlot,
  getSelectedTeamClassSlots,
  getTeamNameHelpParams,
  isTeamNameLengthValid,
  joinAssetUrl,
  type TeamClassSlotSelection
} from './teamModel';
import type { AgentDuelTeamCreateProps, CharacterClassId, TeamCreateContext } from './types';
import { readCaptureTheFlagError } from './types';
import './styles.css';

type Status = 'loading' | 'ready' | 'error';

export function AgentDuelTeamCreate(props: AgentDuelTeamCreateProps) {
  const locale = normalizeLocale(props.locale ?? 'zh-CN');
  return (
    <CaptureTheFlagI18nBoundary locale={locale} mode={props.i18nMode}>
      <TeamCreateContent {...props} normalizedLocale={locale} />
    </CaptureTheFlagI18nBoundary>
  );
}

function TeamCreateContent({
  assetBaseUrl = 'https://www.agentduel.app',
  backToDashboardHref = '/dashboard',
  className,
  dataSource,
  linkComponent,
  normalizedLocale,
  onTeamCreated,
  onUnauthorized,
  style
}: AgentDuelTeamCreateProps & { normalizedLocale: 'zh-CN' | 'en-US' }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [context, setContext] = useState<TeamCreateContext | null>(null);
  const [slotOneClassId, setSlotOneClassId] = useState<TeamClassSlotSelection>(getInitialTeamClassIdForSlot(1));
  const [slotTwoClassId, setSlotTwoClassId] = useState<TeamClassSlotSelection>(getInitialTeamClassIdForSlot(2));
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setStatus('loading');
    setFormError(null);
    try {
      const nextContext = await dataSource.loadContext(normalizedLocale);
      setContext(nextContext);
      setSlotOneClassId(getInitialTeamClassIdForSlot(1));
      setSlotTwoClassId(getInitialTeamClassIdForSlot(2));
      setStatus('ready');
    } catch (error) {
      if (readCaptureTheFlagError(error).status === 401) {
        onUnauthorized();
        return;
      }
      setStatus('error');
    }
  }, [dataSource, normalizedLocale, onUnauthorized]);

  useEffect(() => {
    void load();
  }, [load]);

  const canCreateTeam = context !== null && context.teamCount < context.maxTeamSlots;
  const remainingSlots = context ? Math.max(0, context.maxTeamSlots - context.teamCount) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canCreateTeam) return;
    if (!isTeamNameLengthValid(name)) {
      setFormError(t('teams.create.form.errors.invalidName'));
      return;
    }
    const selectedClassSlots = getSelectedTeamClassSlots(slotOneClassId, slotTwoClassId);
    if (selectedClassSlots === null) {
      setFormError(t('teams.create.form.errors.missingClasses'));
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const team = await dataSource.createTeam({
        name: name.trim(),
        units: selectedClassSlots.map((classId) => ({ class_id: classId }))
      }, normalizedLocale);
      onTeamCreated(team);
    } catch (error) {
      if (readCaptureTheFlagError(error).status === 401) {
        onUnauthorized();
        return;
      }
      const localizedMessage = await dataSource.resolveErrorMessage?.(error, normalizedLocale);
      setFormError(localizedMessage ?? t('teams.create.form.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const rootClassName = [
    'agentduel-capturetheflag',
    'capturetheflag-team-create',
    className ?? ''
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} style={style}>
      {status === 'loading'
        ? <div className="dashboard-loading" role="status"><p>{t('teams.create.loading')}</p></div>
        : null}
      {status === 'error' ? (
        <section className="dashboard-error" aria-labelledby="team-create-error-title">
          <p className="dashboard-kicker">{t('teams.create.error.kicker')}</p>
          <h1 id="team-create-error-title">{t('teams.create.error.title')}</h1>
          <p>{t('teams.create.error.copy')}</p>
          <Button onClick={() => void load()} variant="secondary" tone="neutral">
            {t('teams.create.error.retry')}
          </Button>
        </section>
      ) : null}
      {status === 'ready' && context ? (
        <>
          <section className="character-create-hero" aria-labelledby="team-create-title">
            <div>
              <p className="dashboard-kicker">{t('teams.create.kicker')}</p>
              <h1 id="team-create-title">{t('teams.create.title')}</h1>
              <p>{t('teams.create.copy')}</p>
            </div>
            <dl className="character-create-slots" aria-label={t('teams.create.slotsAria')}>
              <div><dt>{t('teams.create.remainingSlots')}</dt><dd>{remainingSlots}</dd></div>
            </dl>
          </section>
          {!canCreateTeam ? (
            <section className="character-create-full" aria-labelledby="team-create-full-title">
              <h2 id="team-create-full-title">{t('teams.create.full.title')}</h2>
              <p>{t('teams.create.full.copy')}</p>
              <ButtonLink
                href={backToDashboardHref}
                linkComponent={linkComponent}
                size="sm"
                variant="secondary"
                tone="neutral"
              >
                {t('teams.create.full.backToDashboard')}
              </ButtonLink>
            </section>
          ) : (
            <form className="team-create-layout" onSubmit={handleSubmit}>
              <section className="dashboard-section" aria-labelledby="team-create-composition-title">
                <div className="dashboard-section-heading">
                  <h2 id="team-create-composition-title">{t('teams.create.compositionTitle')}</h2>
                </div>
                <TeamSlotSelector
                  assetBaseUrl={assetBaseUrl}
                  label={t('teams.create.slotLabel', { slot: 1 })}
                  onSelect={setSlotOneClassId}
                  selectedClassId={slotOneClassId}
                />
                <TeamSlotSelector
                  assetBaseUrl={assetBaseUrl}
                  label={t('teams.create.slotLabel', { slot: 2 })}
                  onSelect={setSlotTwoClassId}
                  selectedClassId={slotTwoClassId}
                />
              </section>
              <TeamCreateForm
                formError={formError}
                isSubmitting={isSubmitting}
                name={name}
                onNameChange={setName}
                slotOneClassId={slotOneClassId}
                slotTwoClassId={slotTwoClassId}
              />
            </form>
          )}
        </>
      ) : null}
    </div>
  );
}

function TeamSlotSelector({
  assetBaseUrl,
  label,
  selectedClassId,
  onSelect
}: {
  assetBaseUrl: string;
  label: string;
  selectedClassId: TeamClassSlotSelection;
  onSelect(classId: CharacterClassId): void;
}) {
  const { t } = useTranslation();
  return (
    <div className="team-slot-row">
      <h3>{label}</h3>
      <div className="team-slot-options" role="radiogroup" aria-label={label}>
        {characterClassOrder.map((classId) => {
          const profile = characterClassProfiles[classId];
          return (
            <button
              aria-checked={selectedClassId === classId}
              className={selectedClassId === classId ? 'is-selected' : ''}
              key={classId}
              onClick={() => onSelect(classId)}
              role="radio"
              type="button"
            >
              <img src={joinAssetUrl(assetBaseUrl, profile.logoUrl)} alt="" />
              <span>{t(`replay.class.${profile.i18nKey}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TeamCreateForm({
  formError,
  isSubmitting,
  name,
  slotOneClassId,
  slotTwoClassId,
  onNameChange
}: {
  formError: string | null;
  isSubmitting: boolean;
  name: string;
  slotOneClassId: TeamClassSlotSelection;
  slotTwoClassId: TeamClassSlotSelection;
  onNameChange(value: string): void;
}) {
  const { t } = useTranslation();
  const nameHelp = getTeamNameHelpParams(name);
  const canSubmit = isTeamNameLengthValid(name)
    && areTeamClassSlotsSelected(slotOneClassId, slotTwoClassId)
    && !isSubmitting;

  return (
    <section className="dashboard-section character-create-form" aria-labelledby="team-create-form-title">
      <div>
        <p className="dashboard-kicker">{t('teams.create.form.kicker')}</p>
        <h2 id="team-create-form-title">{t('teams.create.form.title')}</h2>
      </div>
      <label className="character-create-field">
        <span>{t('teams.create.form.nameLabel')}</span>
        <input
          aria-invalid={nameHelp.isOverLimit}
          disabled={isSubmitting}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={t('teams.create.form.namePlaceholder')}
          value={name}
        />
        <small className={nameHelp.isOverLimit ? 'is-invalid' : undefined}>
          {t('teams.create.form.nameHelp', { count: nameHelp.count, max: nameHelp.max })}
        </small>
        <small>{t('teams.create.form.nameImmutableHelp')}</small>
      </label>
      {formError ? <p className="character-create-form-error" role="alert">{formError}</p> : null}
      <Button
        disabled={!canSubmit}
        loading={isSubmitting}
        loadingLabel={t('teams.create.form.creating')}
        type="submit"
        width="full"
      >
        {t('teams.create.form.create')}
      </Button>
    </section>
  );
}
