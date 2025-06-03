import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';

const NodeConfigForm = ({ nodeType, config, onChange }) => {
  const updateConfig = (key, value) => {
    onChange({
      ...config,
      [key]: value
    });
  };

  const renderFormFields = () => {
    switch (nodeType) {
      case 'startNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Input Type</InputLabel>
              <Select
                value={config.inputType || ''}
                onChange={(e) => updateConfig('inputType', e.target.value)}
              >
                <MenuItem value="webhook">Webhook</MenuItem>
                <MenuItem value="manual">Manual Trigger</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
              </Select>
            </FormControl>
            
            {config.inputType === 'webhook' && (
              <TextField
                fullWidth
                margin="normal"
                label="Webhook Endpoint"
                value={config.endpoint || ''}
                onChange={(e) => updateConfig('endpoint', e.target.value)}
                placeholder="/api/webhook/data"
              />
            )}
            
            {config.inputType === 'scheduled' && (
              <TextField
                fullWidth
                margin="normal"
                label="Cron Schedule"
                value={config.schedule || ''}
                onChange={(e) => updateConfig('schedule', e.target.value)}
                placeholder="0 0 * * *"
                helperText="Cron expression for scheduling"
              />
            )}
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              multiline
              rows={2}
            />
          </>
        );
      
      case 'actionNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Action Type</InputLabel>
              <Select
                value={config.actionType || ''}
                onChange={(e) => updateConfig('actionType', e.target.value)}
              >
                <MenuItem value="transform">Transform Data</MenuItem>
                <MenuItem value="database">Database Operation</MenuItem>
                <MenuItem value="api">API Call</MenuItem>
                <MenuItem value="email">Send Email</MenuItem>
                <MenuItem value="logging">Log Message</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Parameters (JSON)"
              multiline
              rows={4}
              value={JSON.stringify(config.parameters || {}, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  updateConfig('parameters', params);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              helperText="Configuration parameters in JSON format"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              multiline
              rows={2}
            />
          </>
        );
      
      case 'decisionNode':
        return (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Decision Logic Configuration
            </Typography>
            
            <TextField
              fullWidth
              margin="normal"
              label="Condition Expression"
              value={config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
              placeholder="data.value > 100"
              helperText="JavaScript expression that evaluates to true or false"
              multiline
              rows={2}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Branch Labels
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                margin="normal"
                label="True Branch Label"
                value={config.trueBranchLabel || 'True'}
                onChange={(e) => updateConfig('trueBranchLabel', e.target.value)}
                helperText="Label for TRUE condition"
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="False Branch Label"
                value={config.falseBranchLabel || 'False'}
                onChange={(e) => updateConfig('falseBranchLabel', e.target.value)}
                helperText="Label for FALSE condition"
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Examples of Decision Conditions:
            </Typography>
            
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                • <strong>data.age >= 18</strong> - Check if age is 18 or older
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                • <strong>data.status === 'active'</strong> - Check if status is active
              </Typography>
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                • <strong>data.score > 80 && data.verified</strong> - Multiple conditions
              </Typography>
              <Typography variant="caption" display="block">
                • <strong>data.type === 'premium' || data.vip</strong> - OR conditions
              </Typography>
            </Box>
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              multiline
              rows={2}
              placeholder="Describe what this decision checks for..."
            />
          </>
        );
      
      case 'terminalNode':
        return (
          <>
            <FormControl fullWidth margin="normal">
              <InputLabel>Final Status</InputLabel>
              <Select
                value={config.status || ''}
                onChange={(e) => updateConfig('status', e.target.value)}
              >
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="timeout">Timeout</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="normal"
              label="Return Value (JSON)"
              multiline
              rows={3}
              value={JSON.stringify(config.returnValue || {}, null, 2)}
              onChange={(e) => {
                try {
                  const returnValue = JSON.parse(e.target.value);
                  updateConfig('returnValue', returnValue);
                } catch (err) {
                  // Invalid JSON, don't update
                }
              }}
              helperText="Final return value in JSON format"
            />
            
            <TextField
              fullWidth
              margin="normal"
              label="Description"
              value={config.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
              multiline
              rows={2}
            />
          </>
        );
      
      default:
        return (
          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={config.description || ''}
            onChange={(e) => updateConfig('description', e.target.value)}
            multiline
            rows={2}
          />
        );
    }
  };

  return (
    <Box>
      {renderFormFields()}
    </Box>
  );
};

export default NodeConfigForm;