import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  ButtonGroup,
  Divider,
  Switch,
  FormControlLabel,
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add,
  Save,
  Undo,
  AutoFixHigh,
  Warning,
  Error,
  PlayArrow,
  MoreVert
} from '@mui/icons-material';

const WorkflowToolbar = ({ 
  isEditMode, 
  onToggleEditMode, 
  onAddNode,
  onAutoLayout,
  onValidate,
  onUndo,
  onSave,
  onRun,
  validation = { errors: [], warnings: [] },
  canUndo = false,
  title = "Tapistro Workflow Management" 
}) => {
  const [addMenuAnchor, setAddMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  const handleAddNode = (nodeType) => {
    onAddNode?.(nodeType);
    setAddMenuAnchor(null);
  };

  const nodeTypes = [
    { type: 'startNode', label: 'Start Node', description: 'Entry point' },
    { type: 'actionNode', label: 'Action Node', description: 'Perform operation' },
    { type: 'decisionNode', label: 'Decision Node', description: 'Conditional branch' },
    { type: 'terminalNode', label: 'Terminal Node', description: 'End point' }
  ];

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ gap: 1, minHeight: '64px !important' }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {/* Add Node Menu - Always Available */}
        <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white', borderRadius: 1 }}>
          <Button
            startIcon={<Add />}
            onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            sx={{ color: 'primary.main' }}
          >
            Add Node
          </Button>
        </ButtonGroup>
        
        <Menu
          anchorEl={addMenuAnchor}
          open={Boolean(addMenuAnchor)}
          onClose={() => setAddMenuAnchor(null)}
        >
          {nodeTypes.map(({ type, label, description }) => (
            <MenuItem key={type} onClick={() => handleAddNode(type)}>
              <div>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              </div>
            </MenuItem>
          ))}
        </Menu>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

        {/* Action Buttons */}
        <Tooltip title="Undo last action">
          <Button
            startIcon={<Undo />}
            onClick={onUndo}
            disabled={!canUndo}
            size="small"
            sx={{ color: 'white', minWidth: 'auto' }}
          >
            Undo
          </Button>
        </Tooltip>

        <Tooltip title="Auto-arrange nodes">
          <Button
            startIcon={<AutoFixHigh />}
            onClick={onAutoLayout}
            size="small"
            sx={{ color: 'white' }}
          >
            Layout
          </Button>
        </Tooltip>

        <Tooltip title="Validate workflow">
          <Button
            startIcon={
              <Badge 
                badgeContent={validation.errors.length + validation.warnings.length}
                color={validation.errors.length > 0 ? "error" : "warning"}
                invisible={validation.errors.length === 0 && validation.warnings.length === 0}
              >
                {validation.errors.length > 0 ? <Error /> : <Warning />}
              </Badge>
            }
            onClick={onValidate}
            size="small"
            sx={{ color: 'white' }}
          >
            Validate
          </Button>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

        {/* Edit Mode Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={isEditMode}
              onChange={onToggleEditMode}
              sx={{ 
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: 'white'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: 'rgba(255,255,255,0.5)'
                }
              }}
            />
          }
          label={<Typography variant="body2" sx={{ color: 'white' }}>Edit Mode</Typography>}
        />

        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />

        {/* Main Actions */}
        <ButtonGroup size="small">
          <Button 
            startIcon={<Save />} 
            onClick={onSave}
            variant="contained"
            sx={{ bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}
          >
            Save
          </Button>
          <Button 
            startIcon={<PlayArrow />} 
            onClick={onRun}
            variant="contained"
            sx={{ bgcolor: 'warning.main', color: 'black', '&:hover': { bgcolor: 'warning.dark' } }}
          >
            Run
          </Button>
        </ButtonGroup>

        {/* More Options */}
        <IconButton 
          onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
          sx={{ color: 'white' }}
        >
          <MoreVert />
        </IconButton>
        
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={() => setMoreMenuAnchor(null)}
        >
          <MenuItem onClick={() => setMoreMenuAnchor(null)}>Export Workflow</MenuItem>
          <MenuItem onClick={() => setMoreMenuAnchor(null)}>Import Workflow</MenuItem>
          <MenuItem onClick={() => setMoreMenuAnchor(null)}>Settings</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default WorkflowToolbar;
