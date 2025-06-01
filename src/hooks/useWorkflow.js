import { useState, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState, addEdge } from 'reactflow';
import { 
  findChildNodes, 
  findAvailablePosition, 
  generateNodeId, 
  getNodeTypeConfig 
} from '../utils/workflowUtils';

export const useWorkflow = (initialNodes = [], initialEdges = []) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

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
    
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  const saveNodeConfig = useCallback((nodeId, newConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
              label: newConfig.label || node.data.label,
            },
          };
        }
        return node;
      })
    );
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, [setNodes]);

  const deleteNode = useCallback((nodeId) => {
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
  }, [setNodes, setEdges]);

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

  const processedNodes = useMemo(() => {
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
    
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    
    toggleEditMode,
    addNode,
    saveNodeConfig,
    deleteNode,
    toggleNodeCollapse,
    closeConfigDrawer,
    
    rawNodes: nodes,
    rawEdges: edges,
    setNodes,
    setEdges
  };
};

export default useWorkflow;
