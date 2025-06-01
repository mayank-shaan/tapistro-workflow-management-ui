import React from 'react';
import { Typography } from '@mui/material';
import { PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import BaseNode from './BaseNode';

const StartNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#4caf50" 
    icon={<PlayArrowIcon sx={{ color: '#4caf50', fontSize: '1rem' }} />}
    showTargetHandle={false}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Input: {data.config?.inputType || 'webhook'}
    </Typography>
  </BaseNode>
);

export default StartNode;
