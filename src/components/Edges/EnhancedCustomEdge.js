import React, { useState, useContext, useCallback } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  useReactFlow 
} from 'reactflow';
import { Fab, Tooltip, Zoom, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { generateNodeId } from '../../utils/workflowUtils';

// Create a context to pass edit mode to edges
export const WorkflowEditContext = React.createContext(false);

// Global drag line element
let dragLineElement = null;

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
  // Add these props to properly handle edge changes
  onEdgesChange 
}) => {
  const { setNodes, setEdges, getEdges, getNodes } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'source' or 'target'
  const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });
  const [originalHandle, setOriginalHandle] = useState(null); // Track original handle
  const isEditMode = useContext(WorkflowEditContext);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Create or update the drag line SVG
  const createDragLine = useCallback((startX, startY, endX, endY) => {
    if (!dragLineElement) {
      // Create SVG element for drag line
      dragLineElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      dragLineElement.style.position = 'fixed';
      dragLineElement.style.top = '0';
      dragLineElement.style.left = '0';
      dragLineElement.style.width = '100vw';
      dragLineElement.style.height = '100vh';
      dragLineElement.style.pointerEvents = 'none';
      dragLineElement.style.zIndex = '9999';
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('stroke', '#1976d2');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('stroke-dasharray', '8,4');
      line.setAttribute('opacity', '0.8');
      line.id = 'drag-connection-line';
      
      dragLineElement.appendChild(line);
      document.body.appendChild(dragLineElement);
    }
    
    const line = dragLineElement.querySelector('#drag-connection-line');
    if (line) {
      line.setAttribute('x1', startX);
      line.setAttribute('y1', startY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
    }
  }, []);

  // Remove drag line
  const removeDragLine = useCallback(() => {
    if (dragLineElement) {
      document.body.removeChild(dragLineElement);
      dragLineElement = null;
    }
  }, []);

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
  };

  // Handle drag start for edge reconnection
  const handleDragStart = useCallback((event, type) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    
    // CRITICAL FIX: Store the original handle information correctly
    // Always store the sourceHandle when dragging from source, regardless of reconnection type
    if (type === 'source') {
      setOriginalHandle(sourceHandle); // This is the handle we need to preserve
      console.log(`🎯 Storing original SOURCE handle:`, sourceHandle);
    } else {
      setOriginalHandle(targetHandle); // For target reconnections, preserve target handle
      console.log(`🎯 Storing original TARGET handle:`, targetHandle);
    }
    
    // Get the workflow canvas element and its bounds
    const canvas = document.querySelector('.react-flow');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate the actual node connection point in screen coordinates
    let startScreenX, startScreenY;
    
    if (type === 'source') {
      // Start from the source node connection point
      startScreenX = sourceX + canvasRect.left;
      startScreenY = sourceY + canvasRect.top;
    } else {
      // Start from the target node connection point  
      startScreenX = targetX + canvasRect.left;
      startScreenY = targetY + canvasRect.top;
    }
    
    setDragStartPoint({ x: startScreenX, y: startScreenY });
    
    console.log(`🔄 Starting ${type} reconnection for edge:`, id);
    console.log(`🔍 Edge details:`, { source, target, sourceHandle, targetHandle });
    console.log(`🎯 Handle being preserved:`, type === 'source' ? sourceHandle : targetHandle);
    
    // Store the original edge data for potential restoration
    window.edgeBeingUpdated = { id, source, target, type, sourceHandle, targetHandle };
    
    // Visual feedback - change cursor and create drag line
    document.body.style.cursor = 'grabbing';
    createDragLine(startScreenX, startScreenY, startScreenX, startScreenY);
  }, [id, source, target, sourceX, sourceY, targetX, targetY, sourceHandle, targetHandle, createDragLine]);

  // Handle drop on a node to reconnect edge - SIMPLIFIED APPROACH
  const handleReconnection = useCallback((newNodeId, reconnectionType) => {
    const currentEdges = getEdges();
    const currentNodes = getNodes();
    
    console.log(`🔗 SIMPLIFIED: Reconnecting ${reconnectionType} to node:`, newNodeId);
    console.log(`🎯 SIMPLIFIED: Original handle to preserve:`, originalHandle);
    console.log(`🔍 SIMPLIFIED: Current edge:`, { id, source, target, sourceHandle, targetHandle });
    
    // Find the target node
    const targetNode = currentNodes.find(n => n.id === newNodeId);
    if (!targetNode) {
      console.warn('Target node not found:', newNodeId);
      return false;
    }
    
    // Create new edge with preserved handle
    let newEdge;
    if (reconnectionType === 'source') {
      // Reconnecting the source end
      newEdge = {
        id: `${newNodeId}-${target}${originalHandle ? `-${originalHandle}` : ''}`,
        source: newNodeId,
        target: target,
        sourceHandle: null, // New source node doesn't have specific handle
        targetHandle: targetHandle,
        type: 'custom'
      };
    } else {
      // Reconnecting the target end - PRESERVE THE ORIGINAL SOURCE HANDLE
      newEdge = {
        id: `${source}-${newNodeId}${originalHandle ? `-${originalHandle}` : ''}`,
        source: source,
        target: newNodeId,
        sourceHandle: originalHandle, // THIS IS THE CRITICAL FIX - Use stored originalHandle
        targetHandle: null, // New target node doesn't have specific handle
        type: 'custom'
      };
    }
    
    console.log('🔧 SIMPLIFIED: Creating new edge:', newEdge);
    
    // Basic validations
    if (newEdge.source === newEdge.target) {
      console.warn('Cannot create self-connection');
      return false;
    }
    
    const connectionExists = currentEdges.some(edge => 
      edge.source === newEdge.source && 
      edge.target === newEdge.target && 
      edge.sourceHandle === newEdge.sourceHandle
    );
    
    if (connectionExists) {
      console.warn('Connection already exists');
      return false;
    }
    
    // SIMPLIFIED: Direct edge state update
    const updatedEdges = currentEdges.filter(edge => edge.id !== id);
    updatedEdges.push(newEdge);
    
    console.log('✅ SIMPLIFIED: Updating edges directly');
    setEdges(updatedEdges);
    
    return true;
  }, [id, source, target, sourceHandle, targetHandle, originalHandle, getEdges, getNodes, setEdges]);

  // Calculate positions for custom drag handles
  const sourceHandleX = sourceX + (labelX - sourceX) * 0.3;
  const sourceHandleY = sourceY + (labelY - sourceY) * 0.3;
  
  const targetHandleX = targetX + (labelX - targetX) * 0.3;
  const targetHandleY = targetY + (labelY - targetY) * 0.3;

  // Global event listeners for drag and drop
  React.useEffect(() => {
    const handleMouseUp = (event) => {
      if (isDragging) {
        setIsDragging(false);
        setDragType(null);
        setOriginalHandle(null);
        document.body.style.cursor = 'default';
        removeDragLine();
        
        // Find if we're over a node
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        const nodeElement = elements.find(el => el.classList.contains('react-flow__node'));
        
        if (nodeElement) {
          const nodeId = nodeElement.getAttribute('data-id');
          if (nodeId && dragType) {
            const success = handleReconnection(nodeId, dragType);
            if (!success) {
              console.log('❌ Reconnection failed');
            }
          }
        } else {
          console.log('🚫 Drop target not found - reconnection cancelled');
        }
      }
    };

    const handleMouseMove = (event) => {
      if (isDragging && dragStartPoint.x && dragStartPoint.y) {
        // Update drag line from the correct start point to mouse position
        createDragLine(
          dragStartPoint.x,
          dragStartPoint.y,
          event.clientX,
          event.clientY
        );
        
        // Visual feedback during drag
        const elements = document.elementsFromPoint(event.clientX, event.clientY);
        const nodeElement = elements.find(el => el.classList.contains('react-flow__node'));
        
        if (nodeElement) {
          nodeElement.style.outline = '3px solid #1976d2';
          nodeElement.style.outlineOffset = '2px';
        }
        
        // Clean up previous highlights
        document.querySelectorAll('.react-flow__node').forEach(node => {
          if (node !== nodeElement) {
            node.style.outline = '';
            node.style.outlineOffset = '';
          }
        });
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      // Clean up any remaining highlights
      document.querySelectorAll('.react-flow__node').forEach(node => {
        node.style.outline = '';
        node.style.outlineOffset = '';
      });
      // Clean up drag line
      if (isDragging) {
        removeDragLine();
      }
    };
  }, [isDragging, dragType, dragStartPoint, originalHandle, handleReconnection, createDragLine, removeDragLine]);

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        interactionWidth={20}
        style={{ 
          strokeWidth: isHovered || isDragging ? 3 : 2,
          stroke: isHovered || isDragging ? '#1976d2' : '#b1b1b7',
          strokeDasharray: isEditMode ? '5,5' : 'none',
          animation: isEditMode ? 'dash 20s linear infinite' : 'none',
          opacity: isDragging ? 0.5 : 1, // Dim the original edge while dragging
        }}
      />
      
      <EdgeLabelRenderer>
        {/* Add Node Button - Always available on hover */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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

        {/* Source Reconnection Handle - Only in Edit Mode */}
        {isEditMode && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceHandleX}px,${sourceHandleY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Zoom in={isHovered || isEditMode}>
              <Tooltip title={`Drag to reconnect source${sourceHandle ? ` (${sourceHandle.toUpperCase()})` : ''}`} placement="top">
                <Box
                  onMouseDown={(e) => {
                    console.log(`🖱️ Source handle clicked - Current sourceHandle:`, sourceHandle);
                    handleDragStart(e, 'source');
                  }}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: sourceHandle === 'false' ? '#f44336' : sourceHandle === 'true' ? '#4caf50' : '#ff9800',
                    border: '3px solid white',
                    cursor: isDragging && dragType === 'source' ? 'grabbing' : 'grab',
                    boxShadow: `0 2px 8px rgba(${sourceHandle === 'false' ? '244, 67, 54' : sourceHandle === 'true' ? '76, 175, 80' : '255, 152, 0'}, 0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: sourceHandle === 'false' ? '#d32f2f' : sourceHandle === 'true' ? '#388e3c' : '#f57c00',
                      transform: 'scale(1.2)',
                      boxShadow: `0 3px 12px rgba(${sourceHandle === 'false' ? '211, 47, 47' : sourceHandle === 'true' ? '56, 142, 60' : '245, 124, 0'}, 0.7)`,
                    },
                    transition: 'all 0.2s ease-in-out',
                    zIndex: 1001
                  }}
                >
                  <SwapHorizIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              </Tooltip>
            </Zoom>
          </div>
        )}

        {/* Target Reconnection Handle - Only in Edit Mode */}
        {isEditMode && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetHandleX}px,${targetHandleY}px)`,
              pointerEvents: 'all',
            }}
          >
            <Zoom in={isHovered || isEditMode}>
              <Tooltip title="Drag to reconnect target" placement="top">
                <Box
                  onMouseDown={(e) => handleDragStart(e, 'target')}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                    border: '3px solid white',
                    cursor: isDragging && dragType === 'target' ? 'grabbing' : 'grab',
                    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      backgroundColor: '#388e3c',
                      transform: 'scale(1.2)',
                      boxShadow: '0 3px 12px rgba(56, 142, 60, 0.7)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    zIndex: 1001
                  }}
                >
                  <SwapHorizIcon sx={{ fontSize: 12, color: 'white' }} />
                </Box>
              </Tooltip>
            </Zoom>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeWithAddButton;