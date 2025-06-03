
# Tapistro Workflow Management UI

  

A powerful React-based workflow management interface built with ReactFlow and Material-UI for creating, editing, and managing complex business workflows with advanced features like decision nodes, edge reconnection, and visual workflow validation.

  

## 🌐 Live Demo

  

**Try it now:** [https://tapistro-workflow-ui.netlify.app/](https://tapistro-workflow-ui.netlify.app/)

  

> Experience the full workflow management system with sample workflows, real-time validation, and all advanced features.

  

## 🚀 Features

  

### Core Workflow Management

-  **Visual Drag-and-Drop Editor**: Intuitive interface for building workflows

-  **4 Node Types**: Start, Action, Decision, and Terminal nodes with full configuration

-  **Smart Edge Connections**: Automatic validation and visual feedback

-  **Decision Node Branching**: TRUE/FALSE paths with color-coded visualization

-  **Real-time Visual Updates**: Instant feedback during workflow construction

  

### Advanced Editing Capabilities

-  **Edge Reconnection**: Drag any edge to reconnect while preserving decision node handles

-  **Add Nodes Between Connections**: Hover over any edge and click + to insert action nodes

-  **Node Configuration**: Click nodes to configure parameters, conditions, and settings

-  **Collapse/Expand**: Manage complex workflows by collapsing subtrees

-  **Dual Mode Interface**: View mode for presentation, Edit mode for modifications

  

### Productivity Features

-  **Undo Functionality**: Full history tracking with one-click undo

-  **Auto Layout**: Automatic node arrangement using Dagre layout algorithm

-  **Workflow Validation**: Real-time validation with error and warning detection

-  **Visual Feedback**: Color-coded edges, hover effects, and status indicators

  

## 🎯 Quick Start

  

```bash

# Install dependencies

npm  install

  

# Start development server

npm  start

```

  

Open [http://localhost:3000](http://localhost:3000) to view the application.

  

## 📋 Usage Guide

  

### Basic Workflow Creation

1.  **Add Nodes**: Use the \"Add Node\" dropdown or hover over edges and click +

2.  **Connect Nodes**: Drag from output handles to input handles

3.  **Configure**: Click nodes to set parameters and conditions

4.  **Validate**: Use the Validate button to check workflow integrity

  

### Advanced Features

  

#### 🔄 Undo Functionality

-  **Track All Changes**: Automatically saves workflow history

-  **One-Click Undo**: Revert any action including node moves, additions, deletions

-  **History Management**: Efficient memory usage with smart history cleanup

  

#### 📐 Auto Layout

-  **Smart Arrangement**: Automatically organizes nodes using hierarchical layout

-  **Optimal Spacing**: Maintains proper node spacing and readability

-  **Preserve Connections**: Maintains all edge connections during reorganization

  

#### ✅ Workflow Validation

-  **Real-time Checks**: Continuous validation as you build

-  **Error Detection**: Identifies unreachable nodes, missing terminals, circular dependencies

-  **Warning System**: Highlights potential issues like incomplete decision branches

-  **Visual Indicators**: Badge system showing error/warning counts

  

#### 🔗 Edge Management

-  **Update Connections**: Drag edges to new targets with automatic validation

-  **Preserve Decision Handles**: TRUE/FALSE branches maintain their logic during reconnection

-  **Add Action Nodes**: Hover over any edge to insert processing nodes inline

-  **Visual Branch Labels**: Color-coded TRUE (green) and FALSE (red) branches

  

### Node Types & Configuration

  

#### 🟢 Start Node
#### 🔵 Action Node
#### 🟠 Decision Node
#### 🔴 Terminal Node




## 🏗️ Project Structure
```

src/

├── components/

│ ├── Nodes/ # Node type implementations

│ │ ├── BaseNode.js # Extensible node foundation

│ │ ├── StartNode.js # Workflow entry points

│ │ ├── ActionNode.js # Processing operations

│ │ ├── DecisionNode.js # Conditional branching

│ │ └── TerminalNode.js # Workflow endpoints

│ ├── Edges/ # Custom edge components

│ │ └── EnhancedCustomEdge.js # Smart edge with add node functionality

│ ├── UI/ # Interface components

│ │ ├── WorkflowToolbar.js # Main control toolbar

│ │ ├── NodePalette.js # Node creation interface

│ │ ├── NodeConfigDrawer.js # Node configuration panel

│ │ └── NodeConfigForm.js # Dynamic configuration forms

│ └── Workflow/ # Core workflow components

│ ├── WorkflowManager.js # Main orchestrator

│ └── WorkflowCanvas.js # React Flow integration

├── hooks/

│ └── useWorkflow.js # Workflow state management

├── utils/

│ ├── workflowUtils.js # Helper functions

│ └── workflowEnhancements.js # Validation & layout

├── data/

│ └── sampleWorkflows.js # Example workflow definitions

└── styles/

└── workflow-enhancements.css # Visual enhancements

```

  

## 🙏 Acknowledgments

  

-  **ReactFlow**: Powerful flow-based editor foundation

-  **Material-UI**: Beautiful and accessible component library

-  **Dagre**: Graph layout algorithms for auto-arrangement

-  **React Community**: Inspiration and best practices

  

---

  

Built by **MSD** with ❤️ using React, ReactFlow, and Material-UI