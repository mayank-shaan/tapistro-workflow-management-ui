import React from 'react';
import { Panel } from 'reactflow';
import {
  Paper,
  Typography,
  Box
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  CallSplit,
  Stop as StopIcon
} from '@mui/icons-material';

const NodePalette = ({ collapsedCount = 0 }) => {
  const nodeTypes = [
    {
      type: 'startNode',
      label: 'Start',
      icon: <PlayArrowIcon />,
      color: '#4caf50',
      description: 'Entry point for workflow'
    },
    {
      type: 'actionNode',
      label: 'Action',
      icon: <SettingsIcon />,
      color: '#2196f3',
      description: 'Perform an operation'
    },
    {
      type: 'decisionNode',
      label: 'Decision',
      icon: <CallSplit />,
      color: '#ff9800',
      description: 'Conditional branching'
    },
    {
      type: 'terminalNode',
      label: 'Terminal',
      icon: <StopIcon />,
      color: '#f44336',
      description: 'End of workflow'
    }
  ];

  return (
    <Panel position="top-right">
      <Paper sx={{ p: 1, minWidth: 100, maxWidth: 120 }}>
        <Typography variant="caption" gutterBottom sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
          Node Types
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
          {nodeTypes.map(({ type, label, icon, color, description }) => (
            <Box
              key={type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 0.5,
                borderRadius: 0.5,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200'
              }}
            >
              <Box sx={{ color: color, fontSize: '0.8rem' }}>
                {icon}
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.65rem', display: 'block' }}>
                  {label}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        
        <Typography variant="caption" display="block" sx={{ fontSize: '0.6rem', mb: 0.5 }}>
          💡 Use ➕ on edges
        </Typography>
        
        {collapsedCount > 0 && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
            Collapsed: {collapsedCount}
          </Typography>
        )}
      </Paper>
    </Panel>
  );
};

export default NodePalette;