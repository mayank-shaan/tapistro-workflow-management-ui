import React, { useState } from 'react';
import { Position, useReactFlow } from 'reactflow';
import { Typography, Chip, IconButton, Box } from '@mui/material';
import { CallSplit, Add, Remove } from '@mui/icons-material';
import BaseNode from './BaseNode';

const DecisionNode = ({ data, id }) => {
  const { setNodes } = useReactFlow();
  const [branches, setBranches] = useState(data.branches || ['Yes', 'No']);

  const addBranch = () => {
    const newBranch = `Option ${branches.length + 1}`;
    const updatedBranches = [...branches, newBranch];
    setBranches(updatedBranches);
    
    // Update node data
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, branches: updatedBranches } }
          : node
      )
    );
  };

  const removeBranch = (index) => {
    if (branches.length <= 2) return; // Keep minimum 2 branches
    
    const updatedBranches = branches.filter((_, i) => i !== index);
    setBranches(updatedBranches);
    
    setNodes(nodes => 
      nodes.map(node => 
        node.id === id 
          ? { ...node, data: { ...node.data, branches: updatedBranches } }
          : node
      )
    );
  };

  // Generate dynamic handles for each branch
  const customHandles = branches.map((branch, index) => ({
    type: 'source',
    position: Position.Bottom,
    id: branch.toLowerCase().replace(/\s+/g, '_'),
    style: {
      left: `${(100 / (branches.length + 1)) * (index + 1)}%`,
      transform: 'translateX(-50%)',
      backgroundColor: index === 0 ? '#4caf50' : index === 1 ? '#f44336' : '#9c27b0'
    }
  }));

  return (
    <BaseNode 
      data={data} 
      color="#ff9800" 
      icon={<CallSplit sx={{ color: '#ff9800', fontSize: '1rem' }} />}
      showSourceHandle={false}
      customHandles={customHandles}
    >
      <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', mb: 1 }}>
        Condition: {data.config?.condition || 'Configure condition...'}
      </Typography>
      
      {data.isEditMode && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
          {branches.map((branch, index) => (
            <Chip 
              key={index}
              label={branch}
              size="small"
              onDelete={branches.length > 2 ? () => removeBranch(index) : undefined}
              deleteIcon={<Remove fontSize="small" />}
              sx={{ fontSize: '0.6rem', height: '20px' }}
            />
          ))}
          <IconButton size="small" onClick={addBranch} sx={{ width: 20, height: 20 }}>
            <Add fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {!data.isEditMode && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {branches.map((branch, index) => (
            <Chip 
              key={index}
              label={branch}
              size="small"
              sx={{ fontSize: '0.6rem', height: '18px' }}
            />
          ))}
        </Box>
      )}
    </BaseNode>
  );
};

export default DecisionNode;
