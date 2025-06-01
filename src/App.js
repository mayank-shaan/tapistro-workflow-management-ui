import React from 'react';
import { WorkflowManager } from './components';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'startNode',
    position: { x: 300, y: 50 },
    data: { 
      label: 'Start Workflow',
      config: {
        inputType: 'webhook',
        description: 'Entry point for the workflow',
        endpoint: '/api/webhook/data'
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
        description: 'Check if data is valid',
        trueBranchLabel: 'Yes',
        falseBranchLabel: 'No'
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
        description: 'Workflow completed successfully',
        returnValue: { success: true }
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
        description: 'Workflow completed with error',
        returnValue: { success: false, error: 'Invalid data' }
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
  return (
    <WorkflowManager
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      title="Tapistro Workflow Management"
    />
  );
}

export default App;
