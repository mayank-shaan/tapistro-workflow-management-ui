import React from 'react';
import { Handle, Position } from 'reactflow';
import {
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  Chip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const BaseNode = ({
  data,
  children,
  color = '#1976d2',
  icon,
  showSourceHandle = true,
  showTargetHandle = true,
  customHandles = []
}) => {
  const {
    isEditMode = false,
    isCollapsed = false,
    onToggleCollapse,
    hasChildren = false,
    childCount = 0,
    label
  } = data;

  return (
    <Card 
      sx={{ 
        minWidth: 120, 
        maxWidth: 160, 
        border: `2px solid ${color}`, 
        opacity: isCollapsed ? 0.6 : 1,
        fontSize: '0.8rem',
        cursor: isEditMode ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': isEditMode ? {
          transform: 'scale(1.02)',
          boxShadow: 3
        } : {}
      }}
    >
      <CardHeader
        avatar={icon && React.cloneElement(icon, { 
          sx: { ...icon.props.sx, fontSize: '1rem' } 
        })}
        title={label}
        action={
          hasChildren ? (
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse?.();
              }}
              size="small" 
              title={isCollapsed ? "Expand subtree" : "Collapse subtree"}
            >
              {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
            </IconButton>
          ) : null
        }
        sx={{ 
          pb: 0.5, 
          pt: 1,
          '& .MuiCardHeader-title': { fontSize: '0.8rem', fontWeight: 500 },
          '& .MuiCardHeader-avatar': { mr: 1 }
        }}
      />
      
      <Collapse in={!isCollapsed}>
        <CardContent sx={{ pt: 0, pb: 1, px: 1.5 }}>
          {children}
          
          {isEditMode && (
            <Chip
              size="small"
              label="Configure"
              variant="outlined"
              sx={{ mt: 0.5, fontSize: '0.65rem', height: '20px' }}
            />
          )}
          
          {hasChildren && (
            <Chip
              size="small"
              label={`${childCount} children`}
              variant="filled"
              sx={{ mt: 0.5, ml: 0.5, fontSize: '0.6rem', height: '18px' }}
              color="secondary"
            />
          )}
        </CardContent>
      </Collapse>

      {showTargetHandle && (
        <Handle 
          type="target" 
          position={Position.Top} 
          style={{ width: 6, height: 6 }} 
        />
      )}
      
      {showSourceHandle && (
        <Handle 
          type="source" 
          position={Position.Bottom} 
          style={{ width: 6, height: 6 }} 
        />
      )}

      {customHandles.map((handle, index) => (
        <Handle
          key={`${handle.id || index}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{
            width: 6,
            height: 6,
            ...handle.style
          }}
        />
      ))}
    </Card>
  );
};

export default BaseNode;
