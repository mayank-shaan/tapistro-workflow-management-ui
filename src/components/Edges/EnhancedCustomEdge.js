import React, { useState, useContext, useCallback } from 'react';
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
  sourceHandle,
  targetHandle,
  data,
  selected,
  animated
}) => {
  const { setNodes, setEdges, getEdges } = useReactFlow();
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

  const handleAddNode = useCallback(() => {
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

    // Get current edges and create new edge configuration
    const currentEdges = getEdges();
    
    // Add new edges: source -> newNode -> target
    const newEdges = [
      {
        id: `${source}-${newNodeId}`,
        source: source,
        target: newNodeId,
        sourceHandle: sourceHandle, // Preserve original source handle
        type: 'custom'
      },
      {
        id: `${newNodeId}-${target}`,
        source: newNodeId,
        target: target,
        type: 'custom'
      }
    ];

    // Update state: add node and replace edge
    const finalEdges = currentEdges.filter(edge => edge.id !== id).concat(newEdges);
    
    setNodes(nodes => [...nodes, newNode]);
    setEdges(finalEdges);
  }, [
    id, 
    source, 
    target, 
    sourceHandle, 
    labelX, 
    labelY, 
    getEdges, 
    setNodes, 
    setEdges
  ]);

  // Determine edge styling based on sourceHandle for decision nodes
  const getEdgeStyle = () => {
    const baseStyle = {
      strokeWidth: isHovered || selected ? 3 : 2,
      stroke: isHovered || selected ? '#1976d2' : '#b1b1b7',
      strokeDasharray: isEditMode ? '5,5' : 'none',
      animation: isEditMode ? 'dash 20s linear infinite' : 'none',
    };

    // Add color coding for decision node branches
    if (sourceHandle === 'true') {
      baseStyle.stroke = isHovered || selected ? '#2e7d32' : '#4caf50';
    } else if (sourceHandle === 'false') {
      baseStyle.stroke = isHovered || selected ? '#c62828' : '#f44336';
    }

    return baseStyle;
  };

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        interactionWidth={20}
        style={getEdgeStyle()}
      />
      
      <EdgeLabelRenderer>
        {/* Add Node Button - Available on hover in edit mode */}
        {isEditMode && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Zoom in={isHovered}>
              <Tooltip title="Click to add a new node here" placement="top">
                <Fab
                  size="small"
                  color="primary"
                  onClick={handleAddNode}
                  sx={{
                    width: 32,
                    height: 32,
                    minHeight: 32,
                    backgroundColor: isHovered ? '#1976d2' : '#e3f2fd',
                    color: isHovered ? 'white' : '#1976d2',
                    border: '2px solid #1976d2',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
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
                  <AddIcon fontSize="small" />
                </Fab>
              </Tooltip>
            </Zoom>
          </div>
        )}

        {/* Edge Label for Decision Branches */}
        {sourceHandle && (sourceHandle === 'true' || sourceHandle === 'false') && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + 20}px,${labelY - 10}px)`,
              pointerEvents: 'none',
              backgroundColor: sourceHandle === 'true' ? '#4caf50' : '#f44336',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              opacity: isEditMode ? 1 : 0.7,
              zIndex: 10
            }}
          >
            {sourceHandle}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeWithAddButton;
