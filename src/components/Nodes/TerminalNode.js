import React from 'react';
import { Typography } from '@mui/material';
import { Stop as StopIcon } from '@mui/icons-material';
import BaseNode from './BaseNode';

const TerminalNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#f44336" 
    icon={<StopIcon sx={{ color: '#f44336', fontSize: '1rem' }} />}
    showSourceHandle={false}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Status: {data.config?.status || 'end'}
    </Typography>
  </BaseNode>
);

export default TerminalNode;
