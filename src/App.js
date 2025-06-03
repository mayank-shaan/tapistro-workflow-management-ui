import React from 'react';
import { WorkflowManager } from './components';
import { sampleWorkflowData } from './data/sampleWorkflows';
import 'reactflow/dist/style.css';
import './styles/workflow-enhancements.css';

function App() {
  return (
    <WorkflowManager
      initialNodes={sampleWorkflowData.nodes}
      initialEdges={sampleWorkflowData.edges}
      title={sampleWorkflowData.metadata.name}
    />
  );
}

export default App;