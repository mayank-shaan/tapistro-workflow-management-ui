export const findChildNodes = (nodeId, edges, nodes = [], visited = new Set()) => {
  if (visited.has(nodeId)) {
    return [];
  }
  
  visited.add(nodeId);
  
  const directChildren = edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
  
  let allChildren = [...directChildren];
  
  directChildren.forEach(childId => {
    if (!visited.has(childId)) {
      const grandChildren = findChildNodes(childId, edges, nodes, new Set(visited));
      allChildren = [...allChildren, ...grandChildren];
    }
  });
  
  return [...new Set(allChildren)];
};

export const findAvailablePosition = (existingNodes, maxAttempts = 20) => {
  const existingPositions = existingNodes.map(node => node.position);
  let newPosition = { x: 400, y: 200 };
  
  let attempts = 0;
  while (attempts < maxAttempts) {
    const currentPosition = newPosition;
    const hasOverlap = existingPositions.some(pos => 
      Math.abs(pos.x - currentPosition.x) < 180 && 
      Math.abs(pos.y - currentPosition.y) < 140
    );
    
    if (!hasOverlap) break;
    
    newPosition = {
      x: 200 + (attempts % 4) * 200,
      y: 100 + Math.floor(attempts / 4) * 150
    };
    attempts++;
  }
  
  return newPosition;
};

export const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const getNodeTypeConfig = (nodeType) => {
  const configs = {
    startNode: {
      label: 'Start',
      color: '#4caf50',
      defaultConfig: {
        inputType: 'manual',
        description: 'Entry point for the workflow'
      }
    },
    actionNode: {
      label: 'Action',
      color: '#2196f3',
      defaultConfig: {
        actionType: 'transform',
        parameters: {},
        description: 'Perform an action or process data'
      }
    },
    decisionNode: {
      label: 'Decision',
      color: '#ff9800',
      defaultConfig: {
        condition: 'data.value > 0',
        trueBranchLabel: 'True',
        falseBranchLabel: 'False',
        description: 'Make a true/false decision'
      }
    },
    terminalNode: {
      label: 'Terminal',
      color: '#f44336',
      defaultConfig: {
        status: 'completed',
        returnValue: {},
        description: 'End of workflow'
      }
    }
  };
  
  return configs[nodeType] || configs.actionNode;
};

export const validateWorkflow = (nodes, edges) => {
  const errors = [];
  
  const startNodes = nodes.filter(node => node.type === 'startNode');
  if (startNodes.length === 0) {
    errors.push('Workflow must have at least one start node');
  }
  
  const terminalNodes = nodes.filter(node => node.type === 'terminalNode');
  if (terminalNodes.length === 0) {
    errors.push('Workflow must have at least one terminal node');
  }
  
  const connectedNodeIds = new Set();
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });
  
  const orphanedNodes = nodes.filter(node => 
    !connectedNodeIds.has(node.id) && node.type !== 'startNode'
  );
  
  if (orphanedNodes.length > 0) {
    errors.push(`Found ${orphanedNodes.length} orphaned node(s)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const exportWorkflow = (nodes, edges, metadata = {}) => {
  return {
    version: '1.0',
    metadata: {
      createdAt: new Date().toISOString(),
      ...metadata
    },
    nodes,
    edges
  };
};

export const importWorkflow = (workflowData) => {
  if (!workflowData.nodes || !workflowData.edges) {
    throw new Error('Invalid workflow data: missing nodes or edges');
  }
  
  return {
    nodes: workflowData.nodes,
    edges: workflowData.edges,
    metadata: workflowData.metadata || {}
  };
};