import React from 'react';
import { Typography } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import BaseNode from './BaseNode';

const ActionNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#2196f3" 
    icon={<SettingsIcon sx={{ color: '#2196f3', fontSize: '1rem' }} />}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Action: {data.config?.actionType || 'process'}
    </Typography>
  </BaseNode>
);

export default ActionNode;
