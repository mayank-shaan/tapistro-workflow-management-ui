import React, { useState, useContext } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  useReactFlow 
} from 'reactflow';
import { Fab, Tooltip, Zoom } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { generateNodeId } from '../../utils/workflowUtils';

// Create a context to pass edit mode to edges
export const WorkflowEditContext = React.createContext(false);

export const CustomEdgeWithAddButton = ({ 
  id, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition,
  source,
  target,
  data 
}) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const isEditMode = useContext(WorkflowEditContext);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddNode = () => {
    // Create new node at the midpoint
    const newNodeId = generateNodeId();
    const newNode = {
      id: newNodeId,
      type: 'actionNode',
      position: { x: labelX - 75, y: labelY - 25 },
      data: { 
        label: 'New Action',
        config: {},
        isConfigOpen: false 
      }
    };

    // Remove existing edge
    const currentEdges = getEdges();
    const updatedEdges = currentEdges.filter(edge => edge.id !== id);

    // Add new edges: source -> newNode -> target
    const newEdges = [
      ...updatedEdges,
      {
        id: `${source}-${newNodeId}`,
        source: source,
        target: newNodeId,
        type: 'custom'
      },
      {
        id: `${newNodeId}-${target}`,
        source: newNodeId,
        target: target,
        type: 'custom'
      }
    ];

    setNodes(nodes => [...nodes, newNode]);
    setEdges(newEdges);
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ 
          strokeWidth: isHovered ? 3 : 2,
          stroke: isHovered ? '#1976d2' : '#b1b1b7',
          strokeDasharray: isEditMode ? '5,5' : 'none',
          animation: isEditMode ? 'dash 20s linear infinite' : 'none'
        }}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Always visible PLUS sign in edit mode, hover-visible in view mode */}
          <Zoom in={isEditMode || isHovered}>
            <Tooltip title="Click to add a new node here" placement="top">
              <Fab
                size="small"
                color="primary"
                onClick={handleAddNode}
                className={isEditMode ? 'workflow-add-button' : ''}
                sx={{
                  width: isEditMode ? 40 : 32,
                  height: isEditMode ? 40 : 32,
                  minHeight: isEditMode ? 40 : 32,
                  backgroundColor: isHovered ? '#1976d2' : isEditMode ? '#2196f3' : '#e3f2fd',
                  color: isHovered ? 'white' : isEditMode ? 'white' : '#1976d2',
                  border: `2px solid ${isEditMode ? '#2196f3' : '#1976d2'}`,
                  boxShadow: isEditMode 
                    ? '0 4px 12px rgba(33, 150, 243, 0.4)' 
                    : '0 2px 8px rgba(25, 118, 210, 0.3)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    color: 'white',
                    transform: 'scale(1.15)',
                    boxShadow: '0 6px 16px rgba(21, 101, 192, 0.6)',
                  },
                  transition: 'all 0.3s ease-in-out',
                  zIndex: 1000
                }}
              >
                <AddIcon fontSize={isEditMode ? "medium" : "small"} />
              </Fab>
            </Tooltip>
          </Zoom>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeWithAddButton;