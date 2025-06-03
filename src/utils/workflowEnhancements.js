import dagre from 'dagre';

// Auto-layout using Dagre
export const autoLayoutWorkflow = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.type === 'decisionNode' ? 200 : 150, 
      height: 80 
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply calculated positions
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

// Simplified and more permissive connection validation
export const validateConnection = (connection, nodes, edges) => {
  console.log('🔍 Validating connection:', {
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle
  });

  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  // Check if nodes exist
  if (!sourceNode || !targetNode) {
    console.log('❌ Validation failed: Source or target node not found');
    return false;
  }

  console.log('📝 Node types:', {
    source: `${sourceNode.type} (${sourceNode.data?.label})`,
    target: `${targetNode.type} (${targetNode.data?.label})`
  });
  
  // Prevent self-connections
  if (connection.source === connection.target) {
    console.log('❌ Validation failed: Self-connection not allowed');
    return false;
  }
  
  // Check if connection already exists (ignore handles for this check)
  const connectionExists = edges.some(edge => 
    edge.source === connection.source && edge.target === connection.target
  );
  if (connectionExists) {
    console.log('❌ Validation failed: Connection already exists');
    return false;
  }

  // Basic node type validation - only block clearly invalid connections
  if (sourceNode.type === 'terminalNode') {
    console.log('❌ Validation failed: Terminal nodes cannot have outgoing connections');
    return false;
  }

  if (targetNode.type === 'startNode') {
    console.log('❌ Validation failed: Start nodes cannot have incoming connections');
    return false;
  }

  // More permissive input limits
  const incomingEdges = edges.filter(e => e.target === connection.target);
  const maxInputs = getMaxInputsForNodeType(targetNode.type);
  
  if (incomingEdges.length >= maxInputs) {
    console.log(`❌ Validation failed: Target node already has maximum inputs (${maxInputs})`);
    return false;
  }

  console.log('✅ Connection validation passed');
  return true;
};

// More permissive input limits for the 4 core node types
const getMaxInputsForNodeType = (nodeType) => {
  switch (nodeType) {
    case 'startNode':
      return 0; // Start nodes should not have inputs
    case 'decisionNode':
      return 5; // Decision nodes can have multiple inputs
    case 'actionNode':
      return 5; // Action nodes can have multiple inputs
    case 'terminalNode':
      return 5; // Terminal nodes can have multiple inputs
    default:
      return 5; // Default to permissive
  }
};

// Enhanced Edge Update Helper
export const updateEdgeConnection = (oldEdge, newConnection, nodes, edges) => {
  // Validate the new connection
  if (!validateConnection(newConnection, nodes, edges)) {
    return null;
  }
  
  // Create updated edge
  const updatedEdge = {
    ...oldEdge,
    source: newConnection.source,
    target: newConnection.target,
    sourceHandle: newConnection.sourceHandle,
    targetHandle: newConnection.targetHandle,
    // Update the ID to reflect new connection
    id: `${newConnection.source}-${newConnection.target}`
  };
  
  return updatedEdge;
};

// Workflow Validation Class (Enhanced)
export class WorkflowValidator {
  static validateWorkflow(nodes, edges) {
    const errors = [];
    const warnings = [];

    // Check for start nodes
    const startNodes = nodes.filter(n => n.type === 'startNode');
    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one start node');
    }
    if (startNodes.length > 1) {
      warnings.push('Multiple start nodes detected');
    }

    // Check for unreachable nodes
    const reachableNodes = this.findReachableNodes(nodes, edges, startNodes);
    const unreachableNodes = nodes.filter(n => 
      !reachableNodes.has(n.id) && n.type !== 'startNode'
    );
    
    if (unreachableNodes.length > 0) {
      warnings.push(`${unreachableNodes.length} unreachable nodes found`);
    }

    // Check for terminal nodes in each path
    const pathsWithoutTerminals = this.findPathsWithoutTerminals(nodes, edges);
    if (pathsWithoutTerminals.length > 0) {
      warnings.push('Some execution paths may not have terminal nodes');
    }

    // Check decision nodes have multiple outputs
    const incompleteDecisions = nodes
      .filter(n => n.type === 'decisionNode')
      .filter(n => {
        const outgoingEdges = edges.filter(e => e.source === n.id);
        return outgoingEdges.length < 2;
      });

    if (incompleteDecisions.length > 0) {
      warnings.push('Some decision nodes have insufficient branches');
    }

    // Check for isolated nodes
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

// Node Factory for Creating the 4 Core Node Types
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