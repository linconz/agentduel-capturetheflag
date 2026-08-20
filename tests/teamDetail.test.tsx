import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  AgentDuelTeamGuestBasic,
  AgentDuelTeamGuestBattleRecords,
  AgentDuelTeamOwnerBasic,
  AgentDuelTeamOwnerCodeSubmission,
  AgentDuelTeamOwnerCodeVersions,
  AgentDuelTeamOwnerStatus
} from '../src/team-detail';

const owner = {
  public_id: 'team-1', slot_no: 1, name: 'Flag Ops', description: 'Owner description', status: 'active' as const,
  units: [{ slot_no: 1, class_id: 'warrior' as const }, { slot_no: 2, class_id: 'mage' as const }],
  api_key: 'secret', code_source: 'custom' as const, ranked_rating: 930, ranked_matches: 10,
  ranked_wins: 6, ranked_losses: 3, ranked_draws: 1, updated_at: '2026-08-01T00:00:00.000Z'
};

describe('team detail sections', () => {
  it('renders owner edit action, composition, and battle tabs', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelTeamOwnerBasic, {
      activeBattleType: 'practice', canStartBattle: true, editHref: '/edit', team: owner,
      onBattleTypeChange: () => undefined, onStartBattle: () => undefined
    }));
    expect(html).toContain('/edit');
    expect(html).toContain('战士 / 法师');
    expect(html).toContain('aria-selected="true"');
  });

  it('renders guest rating and challenge action separately', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelTeamGuestBasic, {
      challengeHref: '/challenge', locale: 'en-US', team: owner
    }));
    expect(html).toContain('/challenge');
    expect(html).toContain('930');
    expect(html).toContain('Challenge');
    expect(html).toContain('team-detail-battle-button');
  });

  it('renders detailed owner match statistics', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelTeamOwnerStatus, { team: owner }));
    expect(html).toContain('60%');
    expect(html).toContain('10');
    expect(html).toContain('6');
  });

  it('uses a host editor and caps available versions at ten newest records', () => {
    const editorHtml = renderToStaticMarkup(createElement(AgentDuelTeamOwnerCodeSubmission, {
      activeTab: 'manual', apiKey: 'secret-key', apiKeyError: null, apiKeyVisible: false,
      copiedApiKey: false, copiedPrompt: false, isRotatingApiKey: false, isSubmitting: false,
      manualSourceCode: 'export default 1', manualSubmitError: null, manualSubmitNotice: null,
      prompt: 'First line\nSecond line', sourceStatus: 'ready', locale: 'en-US',
      onCopyApiKey: () => undefined, onCopyPrompt: () => undefined,
      onManualSourceCodeChange: () => undefined, onRotateApiKey: () => undefined,
      onSubmitManualCode: () => undefined, onTabChange: () => undefined, onToggleApiKey: () => undefined,
      renderCodeEditor: ({ value }) => createElement('div', { 'data-host-editor': true }, value)
    }));
    expect(editorHtml).toContain('data-host-editor="true"');
    expect(editorHtml).toContain('Submit code');

    const versions = Array.from({ length: 12 }, (_, index) => ({
      public_id: `version-${index}`, version_no: index + 1, status: 'compiled' as const, diagnostics: [],
      ai_model: null, change_summary: `Summary ${index + 1}`, completed_at: null,
      created_at: `2026-08-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`, is_current: false, is_available: true
    }));
    const versionsHtml = renderToStaticMarkup(createElement(AgentDuelTeamOwnerCodeVersions, {
      codeVersions: { compiled_versions: versions, latest_submission: null, latest_problem_submission: null },
      error: null, settingVersionId: null, status: 'ready',
      onRetry: () => undefined, onSetCurrentVersion: () => undefined
    }));
    expect((versionsHtml.match(/team-detail-version-card/g) ?? []).length).toBe(10);
    expect(versionsHtml).toContain('Summary 12');
    expect(versionsHtml).not.toContain('>Summary 1<');
    expect(versionsHtml).not.toContain('可用版本');
  });

  it('reuses the recent battle row and map tooltip presentation', () => {
    const html = renderToStaticMarkup(createElement(AgentDuelTeamGuestBattleRecords, {
      battles: [{
        public_id: 'battle-1', share_path: '/b/one', battle_type: 'ranked', game_mode_id: 'captureTheFlag',
        map_id: 'bannerhold_heights', status: 'done', winner_side: 'blue', replay_available: true,
        created_at: '2026-08-01T00:00:00.000Z', participants: [
          { side: 'red', kind: 'team', public_id: 'team-1', name: 'Flag Ops', rating_delta: -8 },
          { side: 'blue', kind: 'team', public_id: 'team-2', name: 'Banner Guard', rating_delta: 8 }
        ]
      }],
      error: null, hasMore: true, ownerTeamPublicId: 'team-1', status: 'ready',
      getReplayHref: () => '/replays/one', getTeamHref: (publicId) => `/teams/${publicId}`,
      onLoadMore: () => undefined
    }));
    expect(html).toContain('dashboard-battle-row battle-record-row');
    expect(html).toContain('battle-map-label');
    expect(html).toContain('battle-map-tooltip');
    expect(html).toContain('character-battle-record-actions');
  });

  it('keeps prompt line breaks and fixes only the manual editor at 400px', () => {
    const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    expect(styles).toMatch(/\.team-detail-prompt\s*\{[^}]*white-space:\s*pre-wrap/s);
    expect(styles).toMatch(/\.team-detail-code-editor\s*\{[^}]*height:\s*400px/s);
  });

  it('keeps the guest challenge link the same compact brown button as start battle', () => {
    const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
    expect(styles).toMatch(/\.team-detail-guest-action\s*\{[^}]*width:\s*max-content[^}]*min-width:\s*0/s);
    expect(styles).toMatch(/\.team-detail-guest-action\s*>\s*a\.duel-button\.team-detail-battle-button\s*\{[^}]*width:\s*auto[^}]*color:\s*var\(--duel-surface\)/s);
  });
});
