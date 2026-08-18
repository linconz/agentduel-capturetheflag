import type { CharacterClassId } from './types';

export interface TeamClassProfile {
  classId: CharacterClassId;
  logoUrl: string;
  i18nKey: string;
}

export type TeamClassSlotSelection = CharacterClassId | null;

export const characterClassOrder: readonly CharacterClassId[] = ['warrior', 'mage', 'hunter'];
export const teamNameMaxLength = 30;

export const characterClassProfiles: Record<CharacterClassId, TeamClassProfile> = {
  warrior: {
    classId: 'warrior',
    logoUrl: '/resources/v1/character/class/warrior/logo.png',
    i18nKey: 'warrior'
  },
  mage: {
    classId: 'mage',
    logoUrl: '/resources/v1/character/class/mage/logo.png',
    i18nKey: 'mage'
  },
  hunter: {
    classId: 'hunter',
    logoUrl: '/resources/v1/character/class/hunter/logo.png',
    i18nKey: 'hunter'
  }
};

export function getInitialTeamClassIdForSlot(_slotNo: 1 | 2): TeamClassSlotSelection {
  return null;
}

export function areTeamClassSlotsSelected(
  slotOneClassId: TeamClassSlotSelection,
  slotTwoClassId: TeamClassSlotSelection
): boolean {
  return slotOneClassId !== null && slotTwoClassId !== null;
}

export function getSelectedTeamClassSlots(
  slotOneClassId: TeamClassSlotSelection,
  slotTwoClassId: TeamClassSlotSelection
): readonly [CharacterClassId, CharacterClassId] | null {
  if (slotOneClassId === null || slotTwoClassId === null) {
    return null;
  }
  return [slotOneClassId, slotTwoClassId];
}

export function getTeamNameLength(value: string): number {
  return value.trim().length;
}

export function isTeamNameLengthValid(value: string): boolean {
  const length = getTeamNameLength(value);
  return length >= 1 && length <= teamNameMaxLength;
}

export function getTeamNameHelpParams(value: string): {
  count: number;
  max: number;
  isOverLimit: boolean;
} {
  const count = getTeamNameLength(value);
  return {
    count,
    max: teamNameMaxLength,
    isOverLimit: count > teamNameMaxLength
  };
}

export function joinAssetUrl(assetBaseUrl: string, assetPath: string): string {
  if (!assetBaseUrl) return assetPath;
  return `${assetBaseUrl.replace(/\/$/, '')}/${assetPath.replace(/^\//, '')}`;
}
