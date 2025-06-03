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

// Workflow Validation Class
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

// Node Factory for Creating Different Node Types
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
      config: {},
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

// Connection validation
export const validateConnection = (connection, nodes, edges) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);
  
  // Prevent self-connections
  if (connection.source === connection.target) return false;
  
  // Check if connection already exists
  const connectionExists = edges.some(edge => 
    edge.source === connection.source && edge.target === connection.target
  );
  if (connectionExists) return false;

  // Validate based on node types
  if (sourceNode?.type === 'terminalNode') {
    // Terminal nodes cannot have outgoing connections
    return false;
  }

  if (targetNode?.type === 'startNode') {
    // Start nodes cannot have incoming connections
    return false;
  }

  return true;
};

// Group management utilities
export const createGroupFromSelection = (selectedNodes, nodes, edges) => {
  if (selectedNodes.length < 2) return null;
  
  // Calculate group bounds
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