import React from 'react';
import { Box } from '@mui/material';
import { WorkflowToolbar, NodeConfigDrawer } from '../UI';
import WorkflowCanvas from './WorkflowCanvas';
import useWorkflow from '../../hooks/useWorkflow';

const WorkflowManager = ({ 
  initialNodes = [], 
  initialEdges = [], 
  title 
}) => {
  const {
    nodes,
    edges,
    isEditMode,
    selectedNode,
    configDrawerOpen,
    collapsedNodes,
    validation,
    
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    
    toggleEditMode,
    addNode,
    saveNodeConfig,
    deleteNode,
    closeConfigDrawer,
    
    // Enhanced functionality
    autoLayout,
    validateWorkflow,
    undoLastAction,
    canUndo
  } = useWorkflow(initialNodes, initialEdges);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WorkflowToolbar
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onAddNode={addNode}
        onAutoLayout={autoLayout}
        onValidate={validateWorkflow}
        onUndo={undoLastAction}
        validation={validation}
        canUndo={canUndo}
        title={title}
      />

      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        isEditMode={isEditMode}
        collapsedCount={collapsedNodes.size}
      />

      <NodeConfigDrawer
        open={configDrawerOpen}
        node={selectedNode}
        onClose={closeConfigDrawer}
        onSave={saveNodeConfig}
        onDelete={deleteNode}
      />
    </Box>
  );
};

export default WorkflowManager;