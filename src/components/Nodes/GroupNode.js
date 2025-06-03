import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Box
} from '@mui/material';
import { ExpandMore, ExpandLess, AccountTree } from '@mui/icons-material';

const GroupNode = ({ data, id, selected }) => {
  const [isExpanded, setIsExpanded] = useState(data.expanded !== false);
  const { setNodes, getNodes } = useReactFlow();

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    const nodes = getNodes();
    const childNodeIds = data.childNodes || [];
    
    setNodes(nodes.map(node => {
      if (childNodeIds.includes(node.id)) {
        return {
          ...node,
          hidden: !newExpanded,
          style: {
            ...node.style,
            opacity: newExpanded ? 1 : 0,
            pointerEvents: newExpanded ? 'all' : 'none'
          }
        };
      } else if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, expanded: newExpanded }
        };
      }
      return node;
    }));
  };

  return (
    <Card 
      sx={{ 
        minWidth: 250,
        border: selected ? '2px solid #9c27b0' : '2px dashed #9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.05)',
        position: 'relative'
      }}
    >
      <Handle type="target" position={Position.Top} />
      
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTree sx={{ color: '#9c27b0', fontSize: '1.2rem' }} />
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
              {data.label || 'Group'}
            </Typography>
            <Badge 
              badgeContent={data.childNodes?.length || 0} 
              color="secondary"
              sx={{ ml: 0.5 }}
            />
          </Box>
          
          <IconButton 
            onClick={toggleExpanded} 
            size="small"
            sx={{ 
              backgroundColor: isExpanded ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.2)',
              '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.3)' }
            }}
          >
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {data.description || `Group containing ${data.childNodes?.length || 0} nodes`}
        </Typography>
        
        {!isExpanded && (
          <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            Click expand to show {data.childNodes?.length || 0} hidden nodes
          </Typography>
        )}
      </CardContent>
      
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};

export default GroupNode;