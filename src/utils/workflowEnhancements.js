import dagre from 'dagre';

// Auto-layout using Dagre
export const autoLayoutWorkflow = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { 
      width: node.type === 'decisionNode' ? 200 : node.type === 'groupNode' ? 250 : 150, 
      height: node.type === 'groupNode' ? 120 : 80 
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

// Enhanced Connection validation
export const validateConnection = (connection, nodes, edges) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  // Prevent self-connections
  if (connection.source === connection.target) {
    return false;
  }
  
  // Check if nodes exist
  if (!sourceNode || !targetNode) {
    return false;
  }
  
  // Check if connection already exists
  const connectionExists = edges.some(edge => 
    edge.source === connection.source && edge.target === connection.target
  );
  if (connectionExists) {
    return false;
  }

  // Enhanced validation based on node types
  if (sourceNode.type === 'terminalNode') {
    return false;
  }

  if (targetNode.type === 'startNode') {
    return false;
  }

  // Check for decision node branch limits
  if (sourceNode.type === 'decisionNode') {
    const existingOutgoingEdges = edges.filter(e => e.source === connection.source);
    const maxBranches = sourceNode.data?.config?.maxBranches || 2;
    
    if (existingOutgoingEdges.length >= maxBranches) {
      return false;
    }
  }

  // Check for circular references (prevent infinite loops)
  if (wouldCreateCycle(connection, edges)) {
    return false;
  }

  // Check target node input limits
  const incomingEdges = edges.filter(e => e.target === connection.target);
  const maxInputs = getMaxInputsForNodeType(targetNode.type);
  
  if (incomingEdges.length >= maxInputs) {
    return false;
  }

  return true;
};

// Helper function to detect cycles
const wouldCreateCycle = (newConnection, existingEdges) => {
  // Create a temporary edge list with the new connection
  const allEdges = [...existingEdges, newConnection];
  
  // Build adjacency list
  const graph = {};
  allEdges.forEach(edge => {
    if (!graph[edge.source]) graph[edge.source] = [];
    graph[edge.source].push(edge.target);
  });
  
  // DFS to detect cycle starting from the new connection's target
  const visited = new Set();
  const recursionStack = new Set();
  
  const hasCycle = (node) => {
    if (recursionStack.has(node)) return true;
    if (visited.has(node)) return false;
    
    visited.add(node);
    recursionStack.add(node);
    
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) return true;
    }
    
    recursionStack.delete(node);
    return false;
  };
  
  return hasCycle(newConnection.target);
};

// Get maximum allowed inputs for each node type
const getMaxInputsForNodeType = (nodeType) => {
  switch (nodeType) {
    case 'startNode':
      return 0; // Start nodes should not have inputs
    case 'decisionNode':
    case 'actionNode':
    case 'terminalNode':
      return 1; // These typically have one input
    case 'groupNode':
      return 5; // Groups can have multiple inputs
    default:
      return 1;
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

// Node Factory for Creating Different Node Types (Enhanced)
export const NodeFactory = {
  createStartNode: (position, data = {}) => ({
    id: `start_${Date.now()}`,
    type: 'startNode',
    position,
    data: {
      label: 'Start',
      type: 'webhook',
      config: {},
      ...data
    }
  }),

  createActionNode: (position, data = {}) => ({
    id: `action_${Date.now()}`,
    type: 'actionNode',
    position,
    data: {
      label: 'Action',
      actionType: 'http_request',
      config: {},
      ...data
    }
  }),

  createDecisionNode: (position, data = {}) => ({
    id: `decision_${Date.now()}`,
    type: 'decisionNode',
    position,
    data: {
      label: 'Decision',
      condition: '',
      branches: ['Yes', 'No'],
      config: { maxBranches: 2 },
      ...data
    }
  }),

  createTerminalNode: (position, data = {}) => ({
    id: `terminal_${Date.now()}`,
    type: 'terminalNode',
    position,
    data: {
      label: 'End',
      action: 'success',
      config: {},
      ...data
    }
  }),

  createGroupNode: (position, childNodes = [], data = {}) => ({
    id: `group_${Date.now()}`,
    type: 'groupNode',
    position,
    data: {
      label: 'Group',
      childNodes: childNodes.map(n => n.id),
      expanded: true,
      ...data
    }
  })
};

// Group management utilities
export const createGroupFromSelection = (selectedNodes, nodes, edges) => {
  if (selectedNodes.length < 2) return null;
  
  const minX = Math.min(...selectedNodes.map(n => n.position.x));
  const minY = Math.min(...selectedNodes.map(n => n.position.y));
  const maxX = Math.max(...selectedNodes.map(n => n.position.x + 150));
  const maxY = Math.max(...selectedNodes.map(n => n.position.y + 80));
  
  const groupNode = NodeFactory.createGroupNode(
    { x: minX - 20, y: minY - 20 },
    selectedNodes,
    {
      label: 'New Group',
      description: `Group of ${selectedNodes.length} nodes`,
      bounds: { minX, minY, maxX, maxY }
    }
  );

  return groupNode;
};

export const expandGroup = (groupNode, nodes) => {
  const childNodeIds = groupNode.data.childNodes || [];
  return nodes.map(node => {
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        hidden: false,
        style: { ...node.style, opacity: 1, pointerEvents: 'all' }
      };
    }
    return node;
  });
};

export const collapseGroup = (groupNode, nodes) => {
  const childNodeIds = groupNode.data.childNodes || [];
  return nodes.map(node => {
    if (childNodeIds.includes(node.id)) {
      return {
        ...node,
        hidden: true,
        style: { ...node.style, opacity: 0, pointerEvents: 'none' }
      };
    }
    return node;
  });
};