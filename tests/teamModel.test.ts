import { describe, expect, it } from 'vitest';
import {
  areTeamClassSlotsSelected,
  characterClassOrder,
  getSelectedTeamClassSlots,
  getTeamNameHelpParams,
  isTeamNameLengthValid
} from '../src/teamModel';

describe('team model', () => {
  it('keeps the three classes in a stable order and starts with empty slots', () => {
    expect(characterClassOrder).toEqual(['warrior', 'mage', 'hunter']);
    expect(areTeamClassSlotsSelected(null, null)).toBe(false);
    expect(getSelectedTeamClassSlots('warrior', 'hunter')).toEqual(['warrior', 'hunter']);
  });

  it('uses the frontend team-name length rule', () => {
    expect(isTeamNameLengthValid('Flag Ops')).toBe(true);
    expect(isTeamNameLengthValid('')).toBe(false);
    expect(isTeamNameLengthValid('x'.repeat(31))).toBe(false);
    expect(getTeamNameHelpParams('  Flag Ops  ').count).toBe(8);
  });
});
