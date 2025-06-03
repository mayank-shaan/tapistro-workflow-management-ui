import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Chip } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const WorkflowDebugger = ({ nodes, edges, validation, isVisible = false }) => {
  if (!isVisible) return null;

  const stats = {
    totalNodes: nodes.length,
    nodeTypes: nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {}),
    totalEdges: edges.length,
    validationErrors: validation?.errors?.length || 0,
    validationWarnings: validation?.warnings?.length || 0
  };

  return (
    <Box sx={{ position: 'fixed', top: 10, right: 10, width: 300, zIndex: 1000 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Debug Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2">
              <strong>Nodes:</strong> {stats.totalNodes}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {Object.entries(stats.nodeTypes).map(([type, count]) => (
                <Chip key={type} label={`${type}: ${count}`} size="small" />
              ))}
            </Box>
            <Typography variant="body2">
              <strong>Edges:</strong> {stats.totalEdges}
            </Typography>
            {stats.validationErrors > 0 && (
              <Typography variant="body2" color="error">
                <strong>Errors:</strong> {stats.validationErrors}
              </Typography>
            )}
            {stats.validationWarnings > 0 && (
              <Typography variant="body2" color="warning.main">
                <strong>Warnings:</strong> {stats.validationWarnings}
              </Typography>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WorkflowDebugger;