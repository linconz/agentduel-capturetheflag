import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AgentDuelTeamList } from '../src/AgentDuelTeamList';
import type { CaptureTheFlagTeamListItem } from '../src/types';

function createTeam(overrides: Partial<CaptureTheFlagTeamListItem> = {}): CaptureTheFlagTeamListItem {
  return {
    public_id: 'team-1',
    name: 'Flag Ops',
    units: [{ slot_no: 1, class_id: 'warrior' }, { slot_no: 2, class_id: 'hunter' }],
    created_at: '2026-08-19T00:00:00.000Z',
    active_code: { version_no: 3, ai_model: 'GPT-5' },
    ranked_rating: 880,
    ranked_results: { wins: 4, draws: 2, losses: 1 },
    latest_submission: null,
    ...overrides
  };
}

describe('AgentDuelTeamList', () => {
  it('renders bundled Chinese list copy, team composition, ranked results, and newer failed submissions', () => {
    const html = renderToStaticMarkup(
      <AgentDuelTeamList
        locale="zh-CN"
        renderAiModel={(aiModel) => <span>模型：{aiModel}</span>}
        teams={[
          createTeam({
            latest_submission: { version_no: 4, status: 'compile_failed' }
          })
        ]}
      />
    );

    expect(html).toContain('团队列表');
    expect(html).toContain('需要处理');
    expect(html).toContain('编译失败');
    expect(html).toContain('战士 / 猎人');
    expect(html).toContain('模型：GPT-5');
    expect(html).toContain('4/2/1');
    expect(html).toContain('880');
    expect(html).toContain('aria-label="查看队伍 Flag Ops"');
    expect(html).not.toContain('duel-breadcrumbs');
  });

  it('leaves breadcrumb navigation to the host page', () => {
    const packageRoot = resolve(import.meta.dirname, '..');
    const componentSources = [
      'src/AgentDuelCaptureTheFlagRecentBattles.tsx',
      'src/AgentDuelTeamCreate.tsx',
      'src/AgentDuelTeamEdit.tsx',
      'src/AgentDuelTeamList.tsx'
    ].map((file) => readFileSync(resolve(packageRoot, file), 'utf8'));
    const styles = readFileSync(resolve(packageRoot, 'src/styles.css'), 'utf8');

    expect(componentSources.join('\n')).not.toContain('Breadcrumbs');
    expect(styles).not.toContain('.duel-breadcrumbs');
  });

  it('shows the no-code state without an active team version', () => {
    const html = renderToStaticMarkup(
      <AgentDuelTeamList
        locale="en-US"
        teams={[createTeam({ active_code: null })]}
      />
    );

    expect(html).toContain('No code submitted');
    expect(html).not.toContain('Unspecified model');
  });

  it('renders the shared model logo by default', () => {
    const html = renderToStaticMarkup(
      <AgentDuelTeamList locale="en-US" teams={[createTeam()]} />
    );

    expect(html).toContain('class="ai-model-logo-badge has-logo"');
    expect(html).toContain('src="https://www.agentduel.app/model/logos/chatgpt.svg"');
    expect(html).toContain('<span>GPT-5</span>');
  });
});
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
