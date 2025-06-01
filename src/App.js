import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import {
  Box,
  Drawer,
  Typography,
  Button,
  Toolbar,
  AppBar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
  CallSplit,
  Stop as StopIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import 'reactflow/dist/style.css';

// Helper function to find child nodes
const findChildNodes = (nodeId, edges, nodes) => {
  const directChildren = edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
  
  let allChildren = [...directChildren];
  
  // Recursively find all descendants
  directChildren.forEach(childId => {
    const grandChildren = findChildNodes(childId, edges, nodes);
    allChildren = [...allChildren, ...grandChildren];
  });
  
  return allChildren;
};

// Custom Node Components
const BaseNode = ({ data, children, color = '#1976d2', icon }) => {
  const { isEditMode, isCollapsed, onToggleCollapse, hasChildren } = data;
  
  return (
    <Card sx={{ 
      minWidth: 120, 
      maxWidth: 160, 
      border: `2px solid ${color}`, 
      opacity: isCollapsed ? 0.6 : 1,
      fontSize: '0.8rem'
    }}>
      <CardHeader
        avatar={React.cloneElement(icon, { sx: { ...icon.props.sx, fontSize: '1rem' } })}
        title={data.label}
        action={
          hasChildren && (
            <IconButton onClick={onToggleCollapse} size="small" title={isCollapsed ? "Expand subtree" : "Collapse subtree"}>
              {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
            </IconButton>
          )
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
              label={`${data.childCount || 0} children`}
              variant="filled"
              sx={{ mt: 0.5, ml: 0.5, fontSize: '0.6rem', height: '18px' }}
              color="secondary"
            />
          )}
        </CardContent>
      </Collapse>
      <Handle type="target" position={Position.Top} style={{ width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ width: 6, height: 6 }} />
    </Card>
  );
};

const StartNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#4caf50" 
    icon={<PlayArrowIcon sx={{ color: '#4caf50', fontSize: '1rem' }} />}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Input: {data.config?.inputType || 'webhook'}
    </Typography>
  </BaseNode>
);

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

const DecisionNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#ff9800" 
    icon={<CallSplit sx={{ color: '#ff9800', fontSize: '1rem' }} />}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Condition: {data.config?.condition || 'if-else'}
    </Typography>
    <Handle type="source" position={Position.Right} id="yes" style={{ width: 6, height: 6 }} />
    <Handle type="source" position={Position.Left} id="no" style={{ width: 6, height: 6 }} />
  </BaseNode>
);

const TerminalNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#f44336" 
    icon={<StopIcon sx={{ color: '#f44336', fontSize: '1rem' }} />}
  >
    <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem' }}>
      Status: {data.config?.status || 'end'}
    </Typography>
    <Handle type="target" position={Position.Top} style={{ width: 6, height: 6 }} />
  </BaseNode>
);

// Node Configuration Drawer
const NodeConfigDrawer = ({ open, node, onClose, onSave, onDelete }) => {
  const [config, setConfig] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
    }
  }, [node]);

  const handleSave = () => {
    if (node) {
      onSave(node.id, config);
    }
  };

  const handleDelete = () => {
    if (node) {
      onDelete(node.id);
      setShowDeleteConfirm(false);
    }
  };

  const renderConfigForm = () => {
    if (!node) return null;

    switch (node.type) {
      case 'startNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Input Type</InputLabel>
              <Select
                value={config.inputType || ''}
                onChange={(e) => setConfig({ ...config, inputType: e.target.value })}
              >
                <MenuItem value="webhook">Webhook</MenuItem>
                <MenuItem value="manual">Manual Trigger</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </>
        );
      
      case 'actionNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Action Type</InputLabel>
              <Select
                value={config.actionType || ''}
                onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
              >
                <MenuItem value="transform">Transform Data</MenuItem>
                <MenuItem value="database">Database Operation</MenuItem>
                <MenuItem value="api">API Call</MenuItem>
                <MenuItem value="email">Send Email</MenuItem>
                <MenuItem value="logging">Log Message</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Parameters (JSON)"
              multiline
              rows={3}
              value={JSON.stringify(config.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setConfig({ ...config, parameters: params });
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </>
        );
      
      case 'decisionNode':
        return (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Condition"
              value={config.condition || ''}
              onChange={(e) => setConfig({ ...config, condition: e.target.value })}
              placeholder="e.g., data.value > 100"
            />
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </>
        );
      
      case 'terminalNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={config.status || ''}
                onChange={(e) => setConfig({ ...config, status: e.target.value })}
              >
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
            />
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 400, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Configure {node?.data.label}
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
        value={node?.data.label || ''}
        onChange={(e) => {
          if (node) {
            setConfig({ ...config, label: e.target.value });
          }
        }}
      />
      
      {renderConfigForm()}
      
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
          Save Changes
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
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
          <Paper sx={{ p: 3, maxWidth: 300, mx: 2 }}>
            <Typography variant="h6" gutterBottom color="error">
              Delete Node?
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Are you sure you want to delete "{node?.data.label}"? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => setShowDeleteConfirm(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="error" 
                onClick={handleDelete}
                size="small"
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Drawer>
  );
};

// Main Component
const nodeTypes = {
  startNode: StartNode,
  actionNode: ActionNode,
  decisionNode: DecisionNode,
  terminalNode: TerminalNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'startNode',
    position: { x: 300, y: 50 },
    data: { 
      label: 'Start Workflow',
      config: {
        inputType: 'webhook',
        description: 'Entry point for the workflow'
      }
    },
  },
  {
    id: '2',
    type: 'actionNode',
    position: { x: 300, y: 180 },
    data: { 
      label: 'Process Data',
      config: {
        actionType: 'transform',
        parameters: { format: 'json' },
        description: 'Transform incoming data'
      }
    },
  },
  {
    id: '3',
    type: 'decisionNode',
    position: { x: 300, y: 310 },
    data: { 
      label: 'Valid Data?',
      config: {
        condition: 'data.isValid === true',
        description: 'Check if data is valid'
      }
    },
  },
  {
    id: '4',
    type: 'actionNode',
    position: { x: 150, y: 440 },
    data: { 
      label: 'Save to Database',
      config: {
        actionType: 'database',
        parameters: { table: 'valid_data' },
        description: 'Save valid data to database'
      }
    },
  },
  {
    id: '5',
    type: 'actionNode',
    position: { x: 450, y: 440 },
    data: { 
      label: 'Log Error',
      config: {
        actionType: 'logging',
        parameters: { level: 'error' },
        description: 'Log invalid data error'
      }
    },
  },
  {
    id: '6',
    type: 'terminalNode',
    position: { x: 150, y: 570 },
    data: { 
      label: 'Success',
      config: {
        status: 'completed',
        description: 'Workflow completed successfully'
      }
    },
  },
  {
    id: '7',
    type: 'terminalNode',
    position: { x: 450, y: 570 },
    data: { 
      label: 'Error End',
      config: {
        status: 'error',
        description: 'Workflow completed with error'
      }
    },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4', sourceHandle: 'yes', label: 'Yes' },
  { id: 'e3-5', source: '3', target: '5', sourceHandle: 'no', label: 'No' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-7', source: '5', target: '7' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  const reactFlowWrapper = useRef(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    if (isEditMode) {
      setSelectedNode(node);
      setConfigDrawerOpen(true);
    }
  }, [isEditMode]);

  const handleNodeConfigSave = useCallback((nodeId, newConfig) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              config: newConfig,
              label: newConfig.label || node.data.label,
            },
          };
        }
        return node;
      })
    );
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId) => {
    // Remove the node
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    // Remove all edges connected to this node
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    // Remove from collapsed nodes if present
    setCollapsedNodes((prev) => {
      const newCollapsed = new Set(prev);
      newCollapsed.delete(nodeId);
      return newCollapsed;
    });
    setConfigDrawerOpen(false);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  const toggleNodeCollapse = useCallback((nodeId) => {
    setCollapsedNodes((prev) => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(nodeId)) {
        newCollapsed.delete(nodeId);
      } else {
        newCollapsed.add(nodeId);
      }
      return newCollapsed;
    });
  }, []);

  const addNewNode = useCallback((nodeType) => {
    const nodeTypeLabels = {
      startNode: 'Start',
      actionNode: 'Action',
      decisionNode: 'Decision',
      terminalNode: 'Terminal'
    };

    // Better positioning logic - avoid overlapping with existing nodes
    const existingPositions = nodes.map(node => node.position);
    let newPosition = { x: 400, y: 200 };
    
    // Find a good position by checking for overlaps
    let attempts = 0;
    while (attempts < 20) {
      const hasOverlap = existingPositions.some(pos => 
        Math.abs(pos.x - newPosition.x) < 180 && 
        Math.abs(pos.y - newPosition.y) < 140
      );
      
      if (!hasOverlap) break;
      
      // Try different positions
      newPosition = {
        x: 200 + (attempts % 4) * 200,
        y: 100 + Math.floor(attempts / 4) * 150
      };
      attempts++;
    }

    const newNode = {
      id: `${Date.now()}`,
      type: nodeType,
      position: newPosition,
      data: { 
        label: `New ${nodeTypeLabels[nodeType]}`,
        config: {}
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [nodes, setNodes]);

  const processedNodes = useMemo(() => {
    // First, identify which nodes have children
    const nodesWithChildren = nodes.map(node => {
      const childNodes = findChildNodes(node.id, edges, nodes);
      return {
        ...node,
        data: {
          ...node.data,
          isEditMode,
          isCollapsed: collapsedNodes.has(node.id),
          onToggleCollapse: () => toggleNodeCollapse(node.id),
          hasChildren: childNodes.length > 0,
          childCount: childNodes.length,
        }
      };
    });

    // Filter out hidden nodes (children of collapsed nodes)
    const visibleNodes = nodesWithChildren.filter(node => {
      // Check if this node is a child of any collapsed node
      const isChildOfCollapsed = nodes.some(parentNode => {
        if (collapsedNodes.has(parentNode.id)) {
          const children = findChildNodes(parentNode.id, edges, nodes);
          return children.includes(node.id);
        }
        return false;
      });
      return !isChildOfCollapsed;
    });

    return visibleNodes;
  }, [nodes, edges, isEditMode, collapsedNodes, toggleNodeCollapse]);

  const processedEdges = useMemo(() => {
    // Filter edges to only show connections between visible nodes
    const visibleNodeIds = new Set(processedNodes.map(node => node.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, [edges, processedNodes]);

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Tapistro Workflow Management
          </Typography>
          <Button
            color="inherit"
            startIcon={isEditMode ? <VisibilityIcon /> : <EditIcon />}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'View Mode' : 'Edit Mode'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={processedNodes}
            edges={processedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
          >
            <Controls />
            <MiniMap />
            <Background variant="dots" gap={12} size={1} />
            
            {isEditMode && (
              <Panel position="top-right">
                <Paper sx={{ p: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Nodes
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => addNewNode('startNode')}
                      sx={{ bgcolor: '#4caf50' }}
                    >
                      Start
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<SettingsIcon />}
                      onClick={() => addNewNode('actionNode')}
                      sx={{ bgcolor: '#2196f3' }}
                    >
                      Action
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CallSplit />}
                      onClick={() => addNewNode('decisionNode')}
                      sx={{ bgcolor: '#ff9800' }}
                    >
                      Decision
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<StopIcon />}
                      onClick={() => addNewNode('terminalNode')}
                      sx={{ bgcolor: '#f44336' }}
                    >
                      Terminal
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                    💡 <strong>Tip:</strong> Click the expand/collapse icon on nodes with children to hide/show subtrees
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Collapsed nodes: {collapsedNodes.size}
                  </Typography>
                </Paper>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </Box>

      <NodeConfigDrawer
        open={configDrawerOpen}
        node={selectedNode}
        onClose={() => setConfigDrawerOpen(false)}
        onSave={handleNodeConfigSave}
        onDelete={handleNodeDelete}
      />
    </Box>
  );
}

export default App;