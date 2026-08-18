import { isTeamNameLengthValid } from './teamModel';
import type { CaptureTheFlagTeam, TeamUpdateInput } from './types';

export type TeamEditValidationError =
  | 'invalidOrUnchangedName'
  | 'unchangedDescription'
  | 'invalidDescription';

export interface TeamEditFormState {
  requiresName: boolean;
  requiresDescription: boolean;
  isNameInvalid: boolean;
  isDescriptionInvalid: boolean;
  hasRequiredChange: boolean;
  isSuspended: boolean;
}

export function getTeamEditFormState(
  team: CaptureTheFlagTeam,
  name: string,
  description: string
): TeamEditFormState {
  const requiresName = team.status === 'name_violation' || team.status === 'all_violation';
  const requiresDescription = team.status === 'description_violation' || team.status === 'all_violation';
  return {
    requiresName,
    requiresDescription,
    isNameInvalid: requiresName && !isTeamNameLengthValid(name),
    isDescriptionInvalid: description.trim().length > 300,
    hasRequiredChange: team.status === 'active'
      ? description.trim() !== (team.description ?? '').trim()
      : (!requiresName || name.trim() !== team.name)
        && (!requiresDescription || description.trim() !== (team.description ?? '').trim()),
    isSuspended: team.status === 'suspended'
  };
}

export function createTeamUpdateInput(
  team: CaptureTheFlagTeam,
  name: string,
  description: string
): { input: TeamUpdateInput | null; error: TeamEditValidationError | null } {
  const normalizedName = name.trim();
  const normalizedDescription = description.trim();
  const state = getTeamEditFormState(team, name, description);
  if (state.requiresName && (!isTeamNameLengthValid(name) || normalizedName === team.name)) {
    return { input: null, error: 'invalidOrUnchangedName' };
  }
  if (state.requiresDescription && normalizedDescription === (team.description ?? '').trim()) {
    return { input: null, error: 'unchangedDescription' };
  }
  if (state.isDescriptionInvalid) {
    return { input: null, error: 'invalidDescription' };
  }

  const input: TeamUpdateInput = {};
  if (state.requiresName) input.name = normalizedName;
  if (state.requiresDescription || normalizedDescription !== (team.description ?? '').trim()) {
    input.description = normalizedDescription;
  }
  return { input, error: null };
}
