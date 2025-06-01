import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const DeleteConfirmDialog = ({ 
  open, 
  nodeName, 
  onConfirm, 
  onCancel 
}) => {
  if (!open) return null;

  return (
    <Box sx={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      bgcolor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <Paper sx={{ p: 3, maxWidth: 350, mx: 2 }}>
        <Typography variant="h6" gutterBottom color="error">
          Delete Node?
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          Are you sure you want to delete <strong>"{nodeName}"</strong>? 
          This action cannot be undone and will also remove all connections to this node.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={onCancel}
            size="small"
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={onConfirm}
            size="small"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default DeleteConfirmDialog;
