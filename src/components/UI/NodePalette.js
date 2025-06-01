import React from 'react';
import { Panel } from 'reactflow';
import {
  Paper,
  Typography,
  Button,
  Box,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  CallSplit,
  Stop as StopIcon
} from '@mui/icons-material';

const NodePalette = ({ onAddNode, collapsedCount = 0 }) => {
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
      <Paper sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2" gutterBottom>
          Add Nodes
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {nodeTypes.map(({ type, label, icon, color, description }) => (
            <Button
              key={type}
              variant="contained"
              size="small"
              startIcon={icon}
              onClick={() => onAddNode(type)}
              sx={{ 
                bgcolor: color,
                justifyContent: 'flex-start',
                '&:hover': {
                  bgcolor: color,
                  opacity: 0.8
                }
              }}
              title={description}
            >
              {label}
            </Button>
          ))}
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          💡 <strong>Tip:</strong> Click nodes to configure them, or use the expand/collapse icons to manage complex workflows
        </Typography>
        
        {collapsedCount > 0 && (
          <Typography variant="caption" display="block" color="text.secondary">
            Collapsed subtrees: {collapsedCount}
          </Typography>
        )}
      </Paper>
    </Panel>
  );
};

export default NodePalette;
