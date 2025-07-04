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

  const edgeTypes = useMemo(() => ({
    custom: CustomEdgeWithAddButton,
    default: CustomEdgeWithAddButton
  }), []);

  const handleConnect = useCallback((params) => {
    if (validateConnection(params, nodes, edges)) {
      const newEdge = {
        ...params,
        id: `${params.source}-${params.target}`,
        type: 'custom'
      };
      onConnect?.(newEdge);
    }
  }, [nodes, edges, onConnect]);

  const handleReconnect = useCallback((oldEdge, newConnection) => {
    const updatedEdges = reconnectEdge(oldEdge, newConnection, edges);
    
    const newEdge = updatedEdges.find(edge => 
      edge.source === newConnection.source && 
      edge.target === newConnection.target &&
      edge.sourceHandle === oldEdge.sourceHandle
    );
    
    if (newEdge) {
      onEdgesChange?.([
        { type: 'remove', id: oldEdge.id },
        { type: 'add', item: newEdge }
      ]);
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
            edgesReconnectable={isEditMode}
            nodesDraggable={true}
            nodesConnectable={true}
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
