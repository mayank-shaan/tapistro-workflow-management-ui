import React from 'react';
import { Position } from 'reactflow';
import { Typography } from '@mui/material';
import { CallSplit } from '@mui/icons-material';
import BaseNode from './BaseNode';

const DecisionNode = ({ data }) => {
  const customHandles = [
    {
      type: 'source',
      position: Position.Right,
      id: 'yes',
      style: { backgroundColor: '#4caf50' }
    },
    {
      type: 'source',
      position: Position.Left,
      id: 'no',
      style: { backgroundColor: '#f44336' }
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
      <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
        Condition: {data.config?.condition || 'if-else'}
      </Typography>
    </BaseNode>
  );
};

export default DecisionNode;
