import BaseNode from './BaseNode';
import StartNode from './StartNode';
import ActionNode from './ActionNode';
import DecisionNode from './DecisionNode';
import TerminalNode from './TerminalNode';

export { BaseNode, StartNode, ActionNode, DecisionNode, TerminalNode };

export const nodeTypes = {
  startNode: StartNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  terminalNode: TerminalNode,
};
