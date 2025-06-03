import dagre from 'dagre';

export const autoLayoutWorkflow = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.type === 'decisionNode' ? 200 : 150, 
      height: 80 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const validateConnection = (connection, nodes, edges) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  if (!sourceNode || !targetNode) {
    return false;
  }
  
  if (connection.source === connection.target) {
    return false;
  }
  
  const connectionExists = edges.some(edge => 
    edge.source === connection.source && edge.target === connection.target
  );
  if (connectionExists) {
    return false;
  }

  if (sourceNode.type === 'terminalNode') {
    return false;
  }

  if (targetNode.type === 'startNode') {
    return false;
  }

  const incomingEdges = edges.filter(e => e.target === connection.target);
  const maxInputs = getMaxInputsForNodeType(targetNode.type);
  
  if (incomingEdges.length >= maxInputs) {
    return false;
  }

  return true;
};

const getMaxInputsForNodeType = (nodeType) => {
  switch (nodeType) {
    case 'startNode':
      return 0;
    case 'decisionNode':
      return 5;
    case 'actionNode':
      return 5;
    case 'terminalNode':
      return 5;
    default:
      return 5;
  }
};


export const updateEdgeConnection = (oldEdge, newConnection, nodes, edges) => {
  if (!validateConnection(newConnection, nodes, edges)) {
    return null;
  }
  
  const updatedEdge = {
    ...oldEdge,
    source: newConnection.source,
    target: newConnection.target,
    sourceHandle: newConnection.sourceHandle,
    targetHandle: newConnection.targetHandle,
    id: `${newConnection.source}-${newConnection.target}`
  };
  
  return updatedEdge;
};

export class WorkflowValidator {
  static validateWorkflow(nodes, edges) {
    const errors = [];
    const warnings = [];

    const startNodes = nodes.filter(n => n.type === 'startNode');
    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one start node');
    }
    if (startNodes.length > 1) {
      warnings.push('Multiple start nodes detected');
    }

    const reachableNodes = this.findReachableNodes(nodes, edges, startNodes);
    const unreachableNodes = nodes.filter(n => 
      !reachableNodes.has(n.id) && n.type !== 'startNode'
    );
    
    if (unreachableNodes.length > 0) {
      warnings.push(`${unreachableNodes.length} unreachable nodes found`);
    }

    const pathsWithoutTerminals = this.findPathsWithoutTerminals(nodes, edges);
    if (pathsWithoutTerminals.length > 0) {
      warnings.push('Some execution paths may not have terminal nodes');
    }

    const incompleteDecisions = nodes
      .filter(n => n.type === 'decisionNode')
      .filter(n => {
        const outgoingEdges = edges.filter(e => e.source === n.id);
        return outgoingEdges.length < 2;
      });

    if (incompleteDecisions.length > 0) {
      warnings.push('Some decision nodes have insufficient branches');
    }

    const isolatedNodes = nodes.filter(n => {
      const hasIncoming = edges.some(e => e.target === n.id);
      const hasOutgoing = edges.some(e => e.source === n.id);
      return !hasIncoming && !hasOutgoing && n.type !== 'startNode';
    });

    if (isolatedNodes.length > 0) {
      warnings.push(`${isolatedNodes.length} isolated nodes found`);
    }

    return { errors, warnings, isValid: errors.length === 0 };
  }

  static findReachableNodes(nodes, edges, startNodes) {
    const reachable = new Set();
    const queue = [...startNodes.map(n => n.id)];

    while (queue.length > 0) {
      const current = queue.shift();
      if (reachable.has(current)) continue;
      
      reachable.add(current);
      
      const outgoingEdges = edges.filter(e => e.source === current);
      outgoingEdges.forEach(edge => {
        if (!reachable.has(edge.target)) {
          queue.push(edge.target);
        }
      });
    }

    return reachable;
  }

  static findPathsWithoutTerminals(nodes, edges) {
    const terminalNodes = nodes.filter(n => n.type === 'terminalNode');
    const leafNodes = nodes.filter(n => {
      const outgoingEdges = edges.filter(e => e.source === n.id);
      return outgoingEdges.length === 0;
    });

    return leafNodes.filter(n => !terminalNodes.includes(n));
  }
}

export const NodeFactory = {
  createStartNode: (position, data = {}) => ({
    id: `start_${Date.now()}`,
    type: 'startNode',
    position,
    data: {
      label: 'Start',
      config: {
        inputType: 'manual',
        description: 'Workflow entry point'
      },
      ...data
    }
  }),

  createActionNode: (position, data = {}) => ({
    id: `action_${Date.now()}`,
    type: 'actionNode',
    position,
    data: {
      label: 'Action',
      config: {
        actionType: 'transform',
        parameters: {},
        description: 'Process data or perform action'
      },
      ...data
    }
  }),

  createDecisionNode: (position, data = {}) => ({
    id: `decision_${Date.now()}`,
    type: 'decisionNode',
    position,
    data: {
      label: 'Decision',
      config: {
        condition: 'data.value > 0',
        trueBranchLabel: 'True',
        falseBranchLabel: 'False',
        description: 'Evaluate condition and branch'
      },
      ...data
    }
  }),

  createTerminalNode: (position, data = {}) => ({
    id: `terminal_${Date.now()}`,
    type: 'terminalNode',
    position,
    data: {
      label: 'End',
      config: {
        status: 'completed',
        returnValue: {},
        description: 'Workflow completion'
      },
      ...data
    }
  })
};