import { describe, expect, it } from 'vitest';
import { createTeamUpdateInput, getTeamEditFormState } from '../src/teamEditModel';
import type { CaptureTheFlagTeam } from '../src/types';

function team(status: CaptureTheFlagTeam['status']): CaptureTheFlagTeam {
  return {
    public_id: 'team-1',
    name: 'Flag Ops',
    description: 'Old description',
    status,
    remediation: status === 'active' || status === 'suspended'
      ? null
      : { violation_type: status, marked_at: '2026-08-18T00:00:00.000Z', submitted_at: null },
    units: [
      { slot_no: 1, class_id: 'warrior' },
      { slot_no: 2, class_id: 'hunter' }
    ]
  };
}

describe('team edit model', () => {
  it('updates only the active team description', () => {
    expect(createTeamUpdateInput(team('active'), 'Flag Ops', 'New description')).toEqual({
      input: { description: 'New description' },
      error: null
    });
  });

  it('requires every flagged field to change', () => {
    expect(createTeamUpdateInput(team('all_violation'), 'Flag Ops', 'New description').error).toBe('invalidOrUnchangedName');
    expect(createTeamUpdateInput(team('all_violation'), 'New Ops', 'Old description').error).toBe('unchangedDescription');
    expect(createTeamUpdateInput(team('all_violation'), 'New Ops', 'New description')).toEqual({
      input: { name: 'New Ops', description: 'New description' },
      error: null
    });
  });

  it('keeps suspended teams disabled', () => {
    expect(getTeamEditFormState(team('suspended'), 'Flag Ops', 'New description').isSuspended).toBe(true);
  });
});
