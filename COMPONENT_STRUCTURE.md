# Tapistro Workflow Management UI - Component Structure

This document outlines the refactored component architecture following best practices for maintainability, reusability, and code organization.

## 📁 Project Structure

```
src/
├── components/
│   ├── Nodes/              # Workflow node components
│   │   ├── BaseNode.js     # Reusable base node component
│   │   ├── StartNode.js    # Start workflow node
│   │   ├── ActionNode.js   # Action/process node
│   │   ├── DecisionNode.js # Conditional branching node
│   │   ├── TerminalNode.js # End workflow node
│   │   └── index.js        # Node exports
│   ├── UI/                 # Reusable UI components
│   │   ├── NodeConfigDrawer.js    # Configuration sidebar
│   │   ├── NodeConfigForm.js      # Dynamic config forms
│   │   ├── DeleteConfirmDialog.js # Deletion confirmation
│   │   ├── WorkflowToolbar.js     # Top toolbar
│   │   ├── NodePalette.js         # Node addition panel
│   │   └── index.js               # UI exports
│   ├── Workflow/           # Main workflow components
│   │   ├── WorkflowManager.js     # Main workflow container
│   │   ├── WorkflowCanvas.js      # ReactFlow canvas wrapper
│   │   └── index.js               # Workflow exports
│   └── index.js            # All component exports
├── hooks/
│   ├── useWorkflow.js      # Workflow state management hook
│   └── index.js            # Hook exports
├── utils/
│   ├── workflowUtils.js    # Workflow utility functions
│   └── index.js            # Utility exports
├── App.js                  # Main application component
└── workflowExamples.js     # Example workflow definitions
```

## 🧩 Component Architecture

### Core Principles Implemented

1. **Minimal Custom CSS**: Components use Material-UI's styling system exclusively
2. **Code Reusability**: Common functionality extracted into reusable components
3. **Flexible Props**: Components accept props for customization and behavior
4. **Pure Components**: Stateless components where possible for better performance

### Component Hierarchy

```
App
└── WorkflowManager (Main container)
    ├── WorkflowToolbar (Edit mode toggle)
    ├── WorkflowCanvas (ReactFlow wrapper)
    │   ├── BaseNode (All node types extend this)
    │   │   ├── StartNode
    │   │   ├── ActionNode
    │   │   ├── DecisionNode
    │   │   └── TerminalNode
    │   └── NodePalette (Add new nodes)
    └── NodeConfigDrawer (Configuration sidebar)
        ├── NodeConfigForm (Dynamic forms)
        └── DeleteConfirmDialog (Confirmation modal)
```

## 🔧 Key Components

### BaseNode
The foundation for all workflow nodes, providing:
- Consistent visual styling
- Collapse/expand functionality
- Edit mode indicators
- Configurable handles and icons
- Hover effects and transitions

```javascript
<BaseNode 
  data={nodeData}
  color="#4caf50"
  icon={<PlayArrowIcon />}
  showSourceHandle={true}
  showTargetHandle={false}
  customHandles={[]}
>
  {/* Node-specific content */}
</BaseNode>
```

### WorkflowManager
Main orchestrator component that:
- Manages overall workflow state
- Coordinates between child components
- Handles mode switching (view/edit)
- Provides data to child components

### useWorkflow Hook
Custom hook encapsulating:
- Node/edge state management
- Collapse/expand logic
- Add/delete/configure operations
- Edit mode handling
- Connection management

```javascript
const {
  nodes, edges, isEditMode,
  onNodeClick, addNode, saveNodeConfig,
  toggleEditMode, deleteNode
} = useWorkflow(initialNodes, initialEdges);
```

## 🛠 Utility Functions

### workflowUtils.js
Provides helper functions for:
- Finding child nodes recursively
- Positioning new nodes intelligently
- Generating unique IDs
- Workflow validation
- Import/export functionality

## 🎨 Styling Approach

- **No Custom CSS**: All styling uses Material-UI's `sx` prop and theme system
- **Responsive Design**: Components adapt to different screen sizes
- **Consistent Colors**: Node types have distinct, accessible color schemes
- **Animations**: Smooth transitions for better UX

## 📦 Props Interface

### Node Components
```javascript
{
  data: {
    label: string,           // Display name
    config: Object,          // Node-specific configuration
    isEditMode: boolean,     // Current mode
    isCollapsed: boolean,    // Collapse state
    hasChildren: boolean,    // Has child nodes
    childCount: number,      // Number of children
    onToggleCollapse: Function // Collapse handler
  }
}
```

### WorkflowManager Props
```javascript
{
  initialNodes: Array,     // Starting workflow nodes
  initialEdges: Array,     // Starting workflow edges
  title: string           // Workflow title
}
```

### NodeConfigDrawer Props
```javascript
{
  open: boolean,          // Drawer visibility
  node: Object,           // Selected node data
  onClose: Function,      // Close handler
  onSave: Function,       // Save configuration
  onDelete: Function      // Delete node
}
```

## 🔄 Data Flow

1. **App.js** → Provides initial data to WorkflowManager
2. **WorkflowManager** → Uses useWorkflow hook for state management
3. **useWorkflow** → Processes nodes/edges and provides handlers
4. **WorkflowCanvas** → Renders ReactFlow with processed data
5. **Node Components** → Display workflow nodes with interactive features
6. **NodeConfigDrawer** → Handles node configuration with dynamic forms

## 🎯 Benefits of New Structure

### Maintainability
- **Single Responsibility**: Each component has one clear purpose
- **Easy Testing**: Components can be tested in isolation
- **Clear Dependencies**: Import/export structure is explicit

### Reusability
- **BaseNode**: Can be extended for new node types
- **NodeConfigForm**: Handles any node type configuration
- **UI Components**: Can be used in other parts of the application

### Flexibility
- **Configurable**: Props allow customization without code changes
- **Extensible**: New node types can be added easily
- **Themeable**: All styling respects Material-UI theme

### Performance
- **Pure Components**: Reduce unnecessary re-renders
- **Memoization**: Critical calculations are memoized
- **Event Handling**: Optimized with useCallback

## 🚀 Usage Examples

### Adding a New Node Type

1. Create the node component:
```javascript
// components/Nodes/CustomNode.js
import React from 'react';
import { SomeIcon } from '@mui/icons-material';
import BaseNode from './BaseNode';

const CustomNode = ({ data }) => (
  <BaseNode 
    data={data} 
    color="#purple" 
    icon={<SomeIcon sx={{ color: '#purple' }} />}
  >
    {/* Custom content */}
  </BaseNode>
);

export default CustomNode;
```

2. Add to nodeTypes mapping:
```javascript
// components/Nodes/index.js
export const nodeTypes = {
  // existing types...
  customNode: CustomNode,
};
```

3. Update configuration form:
```javascript
// components/UI/NodeConfigForm.js
case 'customNode':
  return (
    <TextField
      label="Custom Property"
      value={config.customProp || ''}
      onChange={(e) => updateConfig('customProp', e.target.value)}
    />
  );
```

### Using Workflow in Another Component

```javascript
import { WorkflowManager } from './components';

function MyWorkflowPage() {
  const myNodes = [/* custom nodes */];
  const myEdges = [/* custom edges */];
  
  return (
    <WorkflowManager
      initialNodes={myNodes}
      initialEdges={myEdges}
      title="My Custom Workflow"
    />
  );
}
```

### Extending with Custom Logic

```javascript
import { useWorkflow } from './hooks';
import { WorkflowCanvas, WorkflowToolbar } from './components';

function CustomWorkflowManager() {
  const workflow = useWorkflow(initialNodes, initialEdges);
  
  // Add custom logic
  const handleExport = () => {
    const data = exportWorkflow(workflow.rawNodes, workflow.rawEdges);
    console.log('Exported:', data);
  };
  
  return (
    <div>
      <WorkflowToolbar {...workflow} />
      <CustomButton onClick={handleExport}>Export</CustomButton>
      <WorkflowCanvas {...workflow} />
    </div>
  );
}
```

## 🧪 Testing Strategy

### Unit Tests
- Test utility functions in isolation
- Test pure components with different props
- Test custom hooks with various scenarios

### Integration Tests
- Test component interactions
- Test workflow operations (add, delete, configure)
- Test collapse/expand functionality

### Example Test Structure
```javascript
// BaseNode.test.js
test('renders with required props', () => {
  const mockData = { label: 'Test Node' };
  render(<BaseNode data={mockData} />);
  expect(screen.getByText('Test Node')).toBeInTheDocument();
});

// useWorkflow.test.js
test('adds new node correctly', () => {
  const { result } = renderHook(() => useWorkflow());
  act(() => {
    result.current.addNode('actionNode');
  });
  expect(result.current.nodes).toHaveLength(1);
});
```

## 🔧 Development Workflow

1. **Component Development**: Create/modify individual components
2. **Integration**: Test components together in WorkflowManager
3. **Styling**: Use Material-UI theme and sx props
4. **State Management**: Leverage useWorkflow hook
5. **Testing**: Write unit and integration tests
6. **Documentation**: Update component documentation

## 📈 Future Enhancements

### Planned Features
- **Drag & Drop**: From palette to canvas
- **Keyboard Shortcuts**: Power user features
- **Undo/Redo**: Action history management
- **Templates**: Pre-built workflow templates
- **Validation**: Real-time workflow validation
- **Export/Import**: JSON workflow definitions
- **Collaboration**: Multi-user editing

### Architecture Improvements
- **State Management**: Consider Redux for complex state
- **Performance**: Virtual scrolling for large workflows
- **Accessibility**: Enhanced keyboard navigation
- **Mobile**: Responsive design improvements

## 🤝 Contributing

When adding new components or features:

1. Follow the established component structure
2. Use TypeScript interfaces for prop definitions
3. Write comprehensive tests
4. Update documentation
5. Follow the existing naming conventions
6. Ensure accessibility compliance

This refactored architecture provides a solid foundation for building complex workflow management features while maintaining code quality and developer experience.
