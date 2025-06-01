import React, { useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background
} from 'reactflow';
import { Box } from '@mui/material';
import { nodeTypes } from '../Nodes';
import { NodePalette } from '../UI';

const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  isEditMode,
  onAddNode,
  collapsedCount
}) => {
  const reactFlowWrapper = useRef(null);

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
          
          {isEditMode && (
            <NodePalette
              onAddNode={onAddNode}
              collapsedCount={collapsedCount}
            />
          )}
        </ReactFlow>
      </div>
    </Box>
  );
};

export default WorkflowCanvas;
