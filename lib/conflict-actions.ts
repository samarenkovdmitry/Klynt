// Labels describe stored states/actions, never inferred values from prose.
export function conflictActions(currentState?: string | null, proposedAction?: string | null, conflictType?: string) {
  const aliases: Record<string, string> = {
    approve: 'approved', confirmed: 'approved',
    add: 'added', remove: 'removed', modify: 'modified',
    reject: 'out_of_scope', rejected: 'out_of_scope',
  };
  const current = currentState ? aliases[currentState] || currentState : '';
  const proposed = proposedAction ? aliases[proposedAction] || proposedAction : '';
  const scope = conflictType === 'scope_change' || conflictType === 'scope_question';
  const acceptLabels: Record<string, string> = {
    added: scope ? 'includeScope' : 'acceptAddition',
    removed: scope ? 'excludeScope' : 'remove',
    modified: 'acceptChange',
    approved: 'approveDecision',
    out_of_scope: 'excludeScope',
    in_progress: 'startWork',
  };
  const canKeep = ['approved', 'added', 'removed', 'out_of_scope', 'in_progress'].includes(current);
  const stateLabels: Record<string, string> = {
    approved: 'approved', added: 'added', removed: scope ? 'outOfScope' : 'removed',
    out_of_scope: 'outOfScope', in_progress: 'inProgress', modified: 'needsDecision',
  };
  return {
    acceptKey: proposed !== current && acceptLabels[proposed] ? `decisionAction.${acceptLabels[proposed]}` : null,
    keepKey: canKeep ? 'decisionAction.keepCurrent' : null,
    currentKey: `decisionAction.state.${stateLabels[current] || 'needsDecision'}`,
    proposedKey: acceptLabels[proposed] ? `decisionAction.${acceptLabels[proposed]}` : null,
  };
}
