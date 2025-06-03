import React, { useRef, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ConnectionMode,
  reconnectEdge
} from 'reactflow';
import { Box } from '@mui/material';
import { nodeTypes } from '../Nodes';
import { CustomEdgeWithAddButton, WorkflowEditContext } from '../Edges/EnhancedCustomEdge';
import { NodePalette } from '../UI';
import { validateConnection } from '../../utils/workflowEnhancements';

const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  isEditMode,
  collapsedCount
}) => {
  const reactFlowWrapper = useRef(null);

  // Create edge types - simplified since React Flow handles reconnection
  const edgeTypes = useMemo(() => ({
    custom: CustomEdgeWithAddButton,
    default: CustomEdgeWithAddButton
  }), []);

  const handleConnect = useCallback((params) => {
    // Validate connection before adding
    if (validateConnection(params, nodes, edges)) {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'custom'
      };
      onConnect?.(newEdge);
    }
  }, [nodes, edges, onConnect]);

  // FIXED: Use React Flow's built-in edge reconnection properly
  const handleReconnect = useCallback((oldEdge, newConnection) => {
    console.log('🔄 React Flow onReconnect:', { oldEdge, newConnection });
    console.log('🎯 Preserving sourceHandle:', oldEdge.sourceHandle);
    
    // Use React Flow's reconnectEdge utility to get the updated edges array
    const updatedEdges = reconnectEdge(oldEdge, newConnection, edges);
    
    // Find the new edge that was created
    const newEdge = updatedEdges.find(edge => 
      edge.source === newConnection.source && 
      edge.target === newConnection.target &&
      edge.sourceHandle === oldEdge.sourceHandle // This should be preserved
    );
    
    if (newEdge) {
      console.log('✅ New edge with preserved sourceHandle:', newEdge);
      
      // Apply the changes using standard React Flow change format
      onEdgesChange?.([
        { type: 'remove', id: oldEdge.id },
        { type: 'add', item: newEdge }
      ]);
    } else {
      console.error('❌ Failed to create new edge during reconnection');
    }
  }, [edges, onEdgesChange]);

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
        <WorkflowEditContext.Provider value={isEditMode}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onReconnect={handleReconnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            multiSelectionKeyCode="Shift"
            deleteKeyCode="Delete"
            snapToGrid
            snapGrid={[15, 15]}
            // Enable edge reconnection (this is the key setting!)
            edgesReconnectable={isEditMode}
            // Allow interactions in both edit and view modes
            nodesDraggable={true} // Always allow node dragging
            nodesConnectable={true} // Always allow node connections
            // Only restrict node deletion and selection to edit mode
            nodesDeletable={isEditMode}
            edgesDeletable={isEditMode}
          >
            <Controls showInteractive={false} />
            <MiniMap 
              nodeStrokeColor={(n) => {
                if (n.type === 'startNode') return '#4caf50';
                if (n.type === 'decisionNode') return '#ff9800';
                if (n.type === 'terminalNode') return '#f44336';
                return '#2196f3';
              }}
              nodeColor={(n) => {
                if (n.type === 'startNode') return '#4caf50';
                if (n.type === 'decisionNode') return '#ff9800';
                if (n.type === 'terminalNode') return '#f44336';
                return '#2196f3';
              }}
            />
            <Background variant="dots" gap={12} size={1} />
            
            {isEditMode && (
              <NodePalette
                collapsedCount={collapsedCount}
              />
            )}
          </ReactFlow>
        </WorkflowEditContext.Provider>
      </div>
    </Box>
  );
};

export default WorkflowCanvas;
