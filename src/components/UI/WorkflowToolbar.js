import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const WorkflowToolbar = ({ 
  isEditMode, 
  onToggleEditMode, 
  title = "Tapistro Workflow Management" 
}) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        <Button
          color="inherit"
          startIcon={isEditMode ? <VisibilityIcon /> : <EditIcon />}
          onClick={onToggleEditMode}
        >
          {isEditMode ? 'View Mode' : 'Edit Mode'}
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default WorkflowToolbar;
