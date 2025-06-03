import React, { useState } from 'react';
import { 
  BaseEdge, 
  EdgeLabelRenderer, 
  getBezierPath, 
  useReactFlow 
} from 'reactflow';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { generateNodeId } from '../../utils/workflowUtils';

export const CustomEdge = ({ 
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
  const { setNodes, setEdges, getEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleAddNode = () => {
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

    const currentEdges = getEdges();
    const updatedEdges = currentEdges.filter(edge => edge.id !== id);
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
          strokeWidth: 2,
          stroke: '#b1b1b7'
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
                backgroundColor: '#1976d2',
                color: 'white',
                transform: 'scale(1.1)',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.5)',
              },
              transition: 'all 0.2s ease-in-out',
              zIndex: 1000
            }}
          >
            <AddIcon fontSize="small" />
          </Fab>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;