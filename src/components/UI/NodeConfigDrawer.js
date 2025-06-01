import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import NodeConfigForm from './NodeConfigForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const NodeConfigDrawer = ({ 
  open, 
  node, 
  onClose, 
  onSave, 
  onDelete 
}) => {
  const [config, setConfig] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [nodeLabel, setNodeLabel] = useState('');

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
      setNodeLabel(node.data.label || '');
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      const updatedConfig = {
        ...config,
        label: nodeLabel
      };
      onSave(node.id, updatedConfig);
    }
  };

  const handleDelete = () => {
    if (node) {
      onDelete(node.id);
      setShowDeleteConfirm(false);
    }
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  if (!node) return null;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{ '& .MuiDrawer-paper': { width: 400, p: 2 } }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h6">
            Configure {node.data.label}
          </Typography>
          <IconButton 
            color="error" 
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete Node"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <TextField
          fullWidth
          margin="normal"
          label="Node Label"
          value={nodeLabel}
          onChange={(e) => setNodeLabel(e.target.value)}
          placeholder="Enter node label"
        />
        
        <NodeConfigForm
          nodeType={node.type}
          config={config}
          onChange={handleConfigChange}
        />
        
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            onClick={handleSave} 
            sx={{ flex: 1 }}
            disabled={!nodeLabel.trim()}
          >
            Save Changes
          </Button>
          <Button 
            variant="outlined" 
            onClick={onClose}
          >
            Cancel
          </Button>
        </Box>
      </Drawer>

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        nodeName={node.data.label}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default NodeConfigDrawer;
