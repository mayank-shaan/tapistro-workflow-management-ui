import React from 'react';
import { Position } from 'reactflow';
import { Typography, Chip, Box } from '@mui/material';
import { CallSplit } from '@mui/icons-material';
import BaseNode from './BaseNode';

const DecisionNode = ({ data, id }) => {
  // Decision nodes should always have exactly 2 branches: True and False
  const trueBranch = data.config?.trueBranchLabel || 'True';
  const falseBranch = data.config?.falseBranchLabel || 'False';

  // Generate exactly 2 handles for True/False branches
  const customHandles = [
    {
      type: 'source',
      position: Position.Bottom,
      id: 'true',
      style: {
        left: '33%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4caf50' // Green for True
      }
    },
    {
      type: 'source',
      position: Position.Bottom,
      id: 'false',
      style: {
        left: '67%',
        transform: 'translateX(-50%)',
        backgroundColor: '#f44336' // Red for False
      }
    }
  ];

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
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Chip 
          label={trueBranch}
          size="small"
          sx={{ 
            fontSize: '0.6rem', 
            height: '18px',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiChip-label': {
              color: 'white'
            }
          }}
        />
        <Chip 
          label={falseBranch}
          size="small"
          sx={{ 
            fontSize: '0.6rem', 
            height: '18px',
            backgroundColor: '#f44336',
            color: 'white',
            '& .MuiChip-label': {
              color: 'white'
            }
          }}
        />
      </Box>
      
      {data.isEditMode && (
        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', mt: 0.5, opacity: 0.7 }}>
          Click to configure condition
        </Typography>
      )}
    </BaseNode>
  );
};

export default DecisionNode;