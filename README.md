# Tapistro Workflow Management UI

A React-based workflow management interface built with ReactFlow and Material-UI for creating, editing, and managing complex workflows.

## Features

- Visual workflow editor with drag-and-drop interface
- Multiple node types: Start, Action, Decision, and Terminal nodes
- Edit/View modes with node configuration panels
- Collapse/expand functionality for complex workflows
- Material-UI design system

## Quick Start

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── components/
│   ├── Nodes/          # Workflow node components
│   ├── UI/             # Reusable UI components
│   └── Workflow/       # Main workflow components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── App.js              # Main application component
└── workflowExamples.js # Sample workflow data
```

## Node Types

- **Start Node** 🟢: Entry points (webhook, manual, scheduled)
- **Action Node** 🔵: Data processing operations
- **Decision Node** 🟠: Conditional branching (if/else)
- **Terminal Node** 🔴: Workflow endpoints

## Usage

1. Click "Edit Mode" to enable editing
2. Use the node palette to add new nodes
3. Drag from output handles to input handles to connect nodes
4. Click nodes to configure them
5. Use expand/collapse icons to manage complex workflows

## Development

The application uses a modular component architecture:

- **BaseNode**: Extensible foundation for all node types
- **WorkflowManager**: Main orchestrator component
- **useWorkflow**: Custom hook for state management
- **Material-UI**: Consistent styling without custom CSS

### Adding New Node Types

1. Create node component extending BaseNode
2. Add to nodeTypes mapping
3. Update NodeConfigForm for configuration

## Building

```bash
npm run build
```

Built with React, ReactFlow, and Material-UI.
