import React, { useState } from 'react';
import { WorkflowManager } from './components';
import TestComponent from './components/TestComponent';
import { sampleWorkflowData, complexWorkflowData } from './data/sampleWorkflows';
import { Button, ButtonGroup, Box, Typography } from '@mui/material';
import 'reactflow/dist/style.css';
import './styles/workflow-enhancements.css';

function App() {
  const [testMode, setTestMode] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState('sample');
  
  const workflowData = currentWorkflow === 'sample' ? sampleWorkflowData : complexWorkflowData;

  if (testMode) {
    return (
      <Box>
        <TestComponent />
        <Button onClick={() => setTestMode(false)} sx={{ m: 2 }}>
          Back to Workflow
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Workflow Selector */}
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Tapistro Workflow Management - Enhanced Version
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          🎯 <strong>Two ways to add nodes:</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          1. ➕ <strong>Add Node</strong> button in toolbar - adds nodes anywhere
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          2. ➕ <strong>PLUS buttons on edges</strong> - adds nodes between existing ones
        </Typography>
        <ButtonGroup variant="outlined" size="small" sx={{ mr: 2 }}>
          <Button 
            variant={currentWorkflow === 'sample' ? 'contained' : 'outlined'}
            onClick={() => setCurrentWorkflow('sample')}
          >
            Sample Workflow (From Screenshot)
          </Button>
          <Button 
            variant={currentWorkflow === 'complex' ? 'contained' : 'outlined'}
            onClick={() => setCurrentWorkflow('complex')}
          >
            Multi-Path Workflow
          </Button>
        </ButtonGroup>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => setTestMode(true)}
        >
          Test Mode
        </Button>
      </Box>
      
      {/* Main Workflow Manager */}
      <WorkflowManager
        key={currentWorkflow} // Force re-render when switching workflows
        initialNodes={workflowData.nodes}
        initialEdges={workflowData.edges}
        title={workflowData.metadata.name}
      />
    </Box>
  );
}

export default App;