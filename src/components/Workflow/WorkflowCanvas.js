import React, { useRef, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ConnectionMode
} from 'reactflow';
import { Box } from '@mui/material';
import { nodeTypes } from '../Nodes';
import { CustomEdgeWithAddButton, WorkflowEditContext } from '../Edges/EnhancedCustomEdge';
import { NodePalette } from '../UI';
import { validateConnection } from '../../utils/workflowEnhancements';

const edgeTypes = {
  custom: CustomEdgeWithAddButton,
  default: CustomEdgeWithAddButton
};

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

  // Fixed: Proper edge update handler
  const handleEdgeUpdate = useCallback((oldEdge, newConnection) => {
    // Validate the new connection
    if (validateConnection(newConnection, nodes, edges)) {
      // Update the edge with new source/target
      const updatedEdge = {
        ...oldEdge,
        source: newConnection.source,
        target: newConnection.target,
        sourceHandle: newConnection.sourceHandle,
        targetHandle: newConnection.targetHandle,
      };
      
      // Use onEdgesChange to update the edge in the state
      onEdgesChange?.([
        {
          type: 'remove',
          id: oldEdge.id
        },
        {
          type: 'add',
          item: updatedEdge
        }
      ]);
    }
  }, [nodes, edges, onEdgesChange]);

  // New: Edge update start handler
  const handleEdgeUpdateStart = useCallback((evt, edge) => {
    // Optional: Add visual feedback when edge update starts
  }, []);

  // New: Edge update end handler
  const handleEdgeUpdateEnd = useCallback((evt, edge) => {
    // Optional: Add visual feedback when edge update ends
  }, []);

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
            onNodeClick={onNodeClick}
            onEdgeUpdate={handleEdgeUpdate}
            onEdgeUpdateStart={handleEdgeUpdateStart}
            onEdgeUpdateEnd={handleEdgeUpdateEnd}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionMode={ConnectionMode.Loose}
            edgeUpdaterRadius={10} // Added: Controls the radius for edge update handles
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            multiSelectionKeyCode="Shift"
            deleteKeyCode="Delete"
            snapToGrid
            snapGrid={[15, 15]}
            // Enable edge updates only in edit mode
            edgesUpdatable={isEditMode}
            edgesFocusable={isEditMode}
            // Also enable node dragging updates
            nodesDraggable={isEditMode}
            nodesConnectable={isEditMode}
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