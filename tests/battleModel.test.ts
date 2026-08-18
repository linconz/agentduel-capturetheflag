import { describe, expect, it } from 'vitest';
import {
  createCaptureTheFlagBattleRecordRows,
  filterCaptureTheFlagBattleRecordRows,
  toggleBattleRecordFilter
} from '../src/battleModel';
import type { CaptureTheFlagBattle } from '../src/types';

const battle: CaptureTheFlagBattle = {
  public_id: 'battle-1',
  share_path: '/b/replay-1',
  battle_type: 'ranked',
  game_mode_id: 'captureTheFlag',
  map_id: 'bannerhold_heights',
  status: 'done',
  participants: [
    { side: 'red', kind: 'team', public_id: 'mine', name: 'Mine', rating_delta: 16 },
    { side: 'blue', kind: 'team', public_id: 'enemy', name: 'Enemy', rating_delta: -16 }
  ],
  winner_side: 'red',
  replay_available: true,
  created_at: '2026-08-18T00:00:00.000Z'
};

describe('capture-the-flag battle model', () => {
  it('builds owner-aware battle rows and replay links', () => {
    const [row] = createCaptureTheFlagBattleRecordRows([battle], new Set(['mine']));
    expect(row?.result).toBe('win');
    expect(row?.ownHref).toBe('/teams/mine');
    expect(row?.opponentHref).toBe('/teams/public/enemy');
    expect(row?.replayHref).toBe('/b/replay-1');
  });

  it('filters and toggles without a game-mode filter', () => {
    const filters = toggleBattleRecordFilter(
      { battleTypes: [], challengeRoles: [], results: [] },
      { kind: 'result', value: 'win' }
    );
    const rows = createCaptureTheFlagBattleRecordRows([battle], new Set(['mine']));
    expect(filterCaptureTheFlagBattleRecordRows(rows, filters)).toHaveLength(1);
  });

  it('builds capture-the-flag revenge links', () => {
    const revengeBattle: CaptureTheFlagBattle = {
      ...battle,
      battle_type: 'practice',
      can_revenge: true,
      revenge_target: { public_id: 'enemy', name: 'Enemy' }
    };
    const [row] = createCaptureTheFlagBattleRecordRows([revengeBattle], new Set(['mine']));
    expect(row?.revengeHref).toBe(
      '/battles/new?mode=captureTheFlag&battle_type=practice&challenger_team_public_id=mine&opponent=specified&target_name=Enemy&target_team_public_id=enemy&revenge_of_battle_public_id=battle-1'
    );
  });

  it('lets an embedded host replace every navigation target', () => {
    const [row] = createCaptureTheFlagBattleRecordRows([battle], new Set(['mine']), {
      getTeamHref: (publicId, view) => `/plugin/teams/${view}/${publicId}`,
      getReplayHref: (source) => `/plugin/replays/${source.public_id}`,
      getRevengeHref: () => null
    });
    expect(row?.ownHref).toBe('/plugin/teams/owned/mine');
    expect(row?.opponentHref).toBe('/plugin/teams/public/enemy');
    expect(row?.replayHref).toBe('/plugin/replays/battle-1');
    expect(row?.revengeHref).toBeNull();
  });
});
