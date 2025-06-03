import { useState, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { 
  findChildNodes, 
  findAvailablePosition, 
  generateNodeId, 
  getNodeTypeConfig 
} from '../utils/workflowUtils';
import { 
  autoLayoutWorkflow, 
  WorkflowValidator, 
  validateConnection 
} from '../utils/workflowEnhancements';

export const useWorkflow = (initialNodes = [], initialEdges = []) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [validation, setValidation] = useState({ errors: [], warnings: [], isValid: true });

  // Enhanced onConnect with better error handling and history tracking
  const onConnect = useCallback(
    (params) => {
      if (validateConnection(params, nodes, edges)) {
        // Add to history before making changes
        setWorkflowHistory(prev => [...prev, { nodes, edges }]);
        
        const newEdge = {
          ...params,
          id: `${params.source}-${params.target}`,
          type: 'custom'
        };
        
        setEdges((eds) => addEdge(newEdge, eds));
      }
    },
    [setEdges, nodes, edges]
  );

  // Enhanced onNodesChange to track position changes for undo/redo
  const handleNodesChange = useCallback((changes) => {
    // Check if there are position changes that should be tracked
    const hasPositionChanges = changes.some(change => 
      change.type === 'position' && change.dragging === false // Only track when drag ends
    );
    
    // Check if there are important structural changes
    const hasStructuralChanges = changes.some(change => 
      change.type === 'add' || change.type === 'remove'
    );
    
    // Add to history for structural changes or completed position changes
    if (hasStructuralChanges || hasPositionChanges) {
      setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    }
    
    // Apply the changes
    onNodesChange(changes);
  }, [onNodesChange, nodes, edges]);

  // Enhanced onEdgesChange to handle all edge operations properly
  const handleEdgesChange = useCallback((changes) => {
    // Add to history before making changes (for non-trivial changes)
    const hasImportantChanges = changes.some(change => 
      change.type === 'add' || change.type === 'remove'
    );
    
    if (hasImportantChanges) {
      setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    }
    
    // Apply the changes
    onEdgesChange(changes);
  }, [onEdgesChange, nodes, edges]);

  const onNodeClick = useCallback((event, node) => {
    if (isEditMode) {
      setSelectedNode(node);
      setConfigDrawerOpen(true);
    }
  }, [isEditMode]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    if (configDrawerOpen) {
      setConfigDrawerOpen(false);
      setSelectedNode(null);
    }
  }, [configDrawerOpen]);

  const addNode = useCallback((nodeType) => {
    const config = getNodeTypeConfig(nodeType);
    const position = findAvailablePosition(nodes);
    
    const newNode = {
      id: generateNodeId(),
      type: nodeType,
      position,
      data: { 
        label: `New ${config.label}`,
        config: { ...config.defaultConfig }
      },
    };
    
    // Add to history
    setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes, edges]);

  const saveNodeConfig = useCallback((nodeId, newConfig) => {
    // Add to history
    setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
              label: newConfig.label || node.data.label,
            },
          };

          // Special handling for decision nodes - sync branches
          if (node.type === 'decisionNode' && newConfig.branches) {
            updatedNode.data.branches = newConfig.branches;
          }

          return updatedNode;
        }
        return node;
      })
    );
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, [setNodes, nodes, edges]);

  const deleteNode = useCallback((nodeId) => {
    // Add to history
    setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    
    setCollapsedNodes((prev) => {
      const newCollapsed = new Set(prev);
      newCollapsed.delete(nodeId);
      return newCollapsed;
    });
    
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, [setNodes, setEdges, nodes, edges]);

  // Enhanced delete edge function
  const deleteEdge = useCallback((edgeId) => {
    // Add to history
    setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges, nodes, edges]);

  const toggleNodeCollapse = useCallback((nodeId) => {
    setCollapsedNodes((prev) => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(nodeId)) {
        newCollapsed.delete(nodeId);
      } else {
        newCollapsed.add(nodeId);
      }
      return newCollapsed;
    });
  }, []);

  const closeConfigDrawer = useCallback(() => {
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, []);

  // Enhanced functionality
  const autoLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = autoLayoutWorkflow(nodes, edges);
    setWorkflowHistory(prev => [...prev, { nodes, edges }]);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const validateWorkflow = useCallback(() => {
    const validationResult = WorkflowValidator.validateWorkflow(nodes, edges);
    setValidation(validationResult);
    return validationResult;
  }, [nodes, edges]);

  const undoLastAction = useCallback(() => {
    if (workflowHistory.length > 0) {
      const lastState = workflowHistory[workflowHistory.length - 1];
      setNodes(lastState.nodes);
      setEdges(lastState.edges);
      setWorkflowHistory(prev => prev.slice(0, -1));
    }
  }, [workflowHistory, setNodes, setEdges]);

  // Clear history when needed (to prevent memory leaks)
  const clearHistory = useCallback(() => {
    setWorkflowHistory([]);
  }, []);

  const processedNodes = useMemo(() => {
    try {
      const nodesWithChildren = nodes.map(node => {
        const childNodes = findChildNodes(node.id, edges, nodes);
        return {
          ...node,
          data: {
            ...node.data,
            isEditMode,
            isCollapsed: collapsedNodes.has(node.id),
            onToggleCollapse: () => toggleNodeCollapse(node.id),
            hasChildren: childNodes.length > 0,
            childCount: childNodes.length,
          }
        };
      });

      const visibleNodes = nodesWithChildren.filter(node => {
        const isChildOfCollapsed = nodes.some(parentNode => {
          if (collapsedNodes.has(parentNode.id)) {
            const children = findChildNodes(parentNode.id, edges, nodes);
            return children.includes(node.id);
          }
          return false;
        });
        return !isChildOfCollapsed;
      });

      return visibleNodes;
    } catch (error) {
      console.error('Error processing nodes:', error);
      // Return basic nodes without child processing if there's an error
      return nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          isEditMode,
          isCollapsed: false,
          hasChildren: false,
          childCount: 0,
        }
      }));
    }
  }, [nodes, edges, isEditMode, collapsedNodes, toggleNodeCollapse]);

  const processedEdges = useMemo(() => {
    const visibleNodeIds = new Set(processedNodes.map(node => node.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, processedNodes]);

  return {
    nodes: processedNodes,
    edges: processedEdges,
    isEditMode,
    selectedNode,
    configDrawerOpen,
    collapsedNodes,
    validation,
    
    onNodesChange: handleNodesChange, // Use enhanced version
    onEdgesChange: handleEdgesChange, // Use enhanced version
    onConnect,
    onNodeClick,
    
    toggleEditMode,
    addNode,
    saveNodeConfig,
    deleteNode,
    deleteEdge,
    toggleNodeCollapse,
    closeConfigDrawer,
    
    // Enhanced functionality
    autoLayout,
    validateWorkflow,
    undoLastAction,
    clearHistory,
    canUndo: workflowHistory.length > 0,
    historyCount: workflowHistory.length,
    
    rawNodes: nodes,
    rawEdges: edges,
    setNodes,
    setEdges
  };
};

export default useWorkflow;