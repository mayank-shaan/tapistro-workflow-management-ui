import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { BugReport } from '@mui/icons-material';

const EdgeDebugger = ({ edges, nodes, open, onClose }) => {
  const [selectedEdge, setSelectedEdge] = useState(null);

  // Focus on decision node edges
  const decisionEdges = edges.filter(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    return sourceNode?.type === 'decisionNode';
  });

  const getNodeLabel = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? `${node.data.label} (${node.type})` : nodeId;
  };

  const getHandleColor = (handle) => {
    if (handle === 'true') return '#4caf50';
    if (handle === 'false') return '#f44336';
    return '#2196f3';
  };

  const getHandleText = (handle) => {
    if (handle === 'true') return 'TRUE';
    if (handle === 'false') return 'FALSE';
    return handle || 'DEFAULT';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BugReport color="primary" />
        Edge Connection Debugger
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            This debugger shows all decision node edges and their handle assignments.
            Use this to verify that TRUE/FALSE branches are correctly preserved during edge reconnection.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Decision Node Edges ({decisionEdges.length})
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Edge ID</TableCell>
                  <TableCell>Source Node</TableCell>
                  <TableCell>Source Handle</TableCell>
                  <TableCell>Target Node</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {decisionEdges.map((edge) => {
                  const sourceNode = nodes.find(n => n.id === edge.source);
                  return (
                    <TableRow 
                      key={edge.id}
                      hover
                      onClick={() => setSelectedEdge(edge)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {edge.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getNodeLabel(edge.source)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getHandleText(edge.sourceHandle)}
                          size="small"
                          sx={{
                            backgroundColor: getHandleColor(edge.sourceHandle),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getNodeLabel(edge.target)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('🔍 Edge Details:', edge);
                            console.log('🎯 Source Node:', sourceNode);
                          }}
                        >
                          Log Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {selectedEdge && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Edge Details:
              </Typography>
              <pre style={{ fontSize: '12px', margin: 0 }}>
                {JSON.stringify(selectedEdge, null, 2)}
              </pre>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Testing Instructions:
            </Typography>
            <Typography variant="body2" paragraph>
              1. Create a decision node with both TRUE and FALSE branches connected
            </Typography>
            <Typography variant="body2" paragraph>
              2. In edit mode, drag the FALSE branch connection to a different node
            </Typography>
            <Typography variant="body2" paragraph>
              3. Check this debugger to verify that the FALSE branch is still marked as "false" (not "true")
            </Typography>
            <Typography variant="body2" paragraph>
              4. The sourceHandle should remain "false" after reconnection
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EdgeDebugger;
