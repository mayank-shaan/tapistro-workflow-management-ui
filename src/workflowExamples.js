// Example workflow configurations for different use cases
export const workflowExamples = {
  // Simple data processing workflow
  dataProcessing: {
    nodes: [
      {
        id: 'start-1',
        type: 'startNode',
        position: { x: 250, y: 25 },
        data: { 
          label: 'Data Webhook',
          config: {
            inputType: 'webhook',
            description: 'Receives incoming data via webhook',
            endpoint: '/api/webhook/data'
          }
        },
      },
      {
        id: 'validate-1',
        type: 'decisionNode',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Validate Schema',
          config: {
            condition: 'validateSchema(data)',
            description: 'Validates incoming data against schema'
          }
        },
      },
      {
        id: 'transform-1',
        type: 'actionNode',
        position: { x: 100, y: 275 },
        data: { 
          label: 'Transform Data',
          config: {
            actionType: 'transform',
            parameters: { 
              mappings: {
                'user_id': 'userId',
                'created_at': 'timestamp'
              }
            },
            description: 'Transform data format'
          }
        },
      },
      {
        id: 'error-1',
        type: 'actionNode',
        position: { x: 400, y: 275 },
        data: { 
          label: 'Log Validation Error',
          config: {
            actionType: 'logging',
            parameters: { 
              level: 'error',
              message: 'Schema validation failed'
            },
            description: 'Log validation errors'
          }
        },
      },
      {
        id: 'save-1',
        type: 'actionNode',
        position: { x: 100, y: 400 },
        data: { 
          label: 'Save to Database',
          config: {
            actionType: 'database',
            parameters: { 
              table: 'processed_data',
              operation: 'insert'
            },
            description: 'Store processed data'
          }
        },
      },
      {
        id: 'success-1',
        type: 'terminalNode',
        position: { x: 100, y: 525 },
        data: { 
          label: 'Success',
          config: {
            status: 'completed',
            description: 'Data processed successfully'
          }
        },
      },
      {
        id: 'error-end-1',
        type: 'terminalNode',
        position: { x: 400, y: 400 },
        data: { 
          label: 'Error',
          config: {
            status: 'error', 
            description: 'Processing failed'
          }
        },
      }
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'validate-1' },
      { id: 'e2', source: 'validate-1', target: 'transform-1', sourceHandle: 'yes', label: 'Valid' },
      { id: 'e3', source: 'validate-1', target: 'error-1', sourceHandle: 'no', label: 'Invalid' },
      { id: 'e4', source: 'transform-1', target: 'save-1' },
      { id: 'e5', source: 'save-1', target: 'success-1' },
      { id: 'e6', source: 'error-1', target: 'error-end-1' },
    ]
  },

  // Email notification workflow
  emailNotification: {
    nodes: [
      {
        id: 'trigger-1',
        type: 'startNode',
        position: { x: 250, y: 25 },
        data: { 
          label: 'User Registration',
          config: {
            inputType: 'manual',
            description: 'Triggered when user registers'
          }
        },
      },
      {
        id: 'check-email-1',
        type: 'decisionNode',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Email Valid?',
          config: {
            condition: 'isValidEmail(user.email)',
            description: 'Check if email format is valid'
          }
        },
      },
      {
        id: 'send-welcome-1',
        type: 'actionNode',
        position: { x: 100, y: 275 },
        data: { 
          label: 'Send Welcome Email',
          config: {
            actionType: 'email',
            parameters: { 
              template: 'welcome',
              subject: 'Welcome to our platform!'
            },
            description: 'Send welcome email to user'
          }
        },
      },
      {
        id: 'log-invalid-1',
        type: 'actionNode',
        position: { x: 400, y: 275 },
        data: { 
          label: 'Log Invalid Email',
          config: {
            actionType: 'logging',
            parameters: { 
              level: 'warning',
              message: 'Invalid email provided during registration'
            },
            description: 'Log invalid email attempt'
          }
        },
      },
      {
        id: 'complete-1',
        type: 'terminalNode',
        position: { x: 100, y: 400 },
        data: { 
          label: 'Email Sent',
          config: {
            status: 'completed',
            description: 'Welcome email sent successfully'
          }
        },
      },
      {
        id: 'failed-1',
        type: 'terminalNode',
        position: { x: 400, y: 400 },
        data: { 
          label: 'Registration Failed',
          config: {
            status: 'error',
            description: 'Registration failed due to invalid email'
          }
        },
      }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'check-email-1' },
      { id: 'e2', source: 'check-email-1', target: 'send-welcome-1', sourceHandle: 'yes', label: 'Valid' },
      { id: 'e3', source: 'check-email-1', target: 'log-invalid-1', sourceHandle: 'no', label: 'Invalid' },
      { id: 'e4', source: 'send-welcome-1', target: 'complete-1' },
      { id: 'e5', source: 'log-invalid-1', target: 'failed-1' },
    ]
  },

  // API integration workflow
  apiIntegration: {
    nodes: [
      {
        id: 'scheduled-1',
        type: 'startNode',
        position: { x: 250, y: 25 },
        data: { 
          label: 'Daily Sync',
          config: {
            inputType: 'scheduled',
            description: 'Runs daily at midnight',
            schedule: '0 0 * * *'
          }
        },
      },
      {
        id: 'fetch-data-1',
        type: 'actionNode',
        position: { x: 250, y: 150 },
        data: { 
          label: 'Fetch External Data',
          config: {
            actionType: 'api',
            parameters: { 
              url: 'https://api.example.com/data',
              method: 'GET',
              headers: { 'Authorization': 'Bearer ${API_KEY}' }
            },
            description: 'Fetch data from external API'
          }
        },
      },
      {
        id: 'check-response-1',
        type: 'decisionNode',
        position: { x: 250, y: 275 },
        data: { 
          label: 'API Success?',
          config: {
            condition: 'response.status === 200',
            description: 'Check if API call was successful'
          }
        },
      },
      {
        id: 'process-data-1',
        type: 'actionNode',
        position: { x: 100, y: 400 },
        data: { 
          label: 'Process Response',
          config: {
            actionType: 'transform',
            parameters: { 
              operation: 'normalize'
            },
            description: 'Process and normalize API response'
          }
        },
      },
      {
        id: 'retry-1',
        type: 'actionNode',
        position: { x: 400, y: 400 },
        data: { 
          label: 'Schedule Retry',
          config: {
            actionType: 'api',
            parameters: { 
              delay: '5m',
              maxRetries: 3
            },
            description: 'Schedule retry for failed API call'
          }
        },
      },
      {
        id: 'sync-complete-1',
        type: 'terminalNode',
        position: { x: 100, y: 525 },
        data: { 
          label: 'Sync Complete',
          config: {
            status: 'completed',
            description: 'Data sync completed successfully'
          }
        },
      },
      {
        id: 'sync-failed-1',
        type: 'terminalNode',
        position: { x: 400, y: 525 },
        data: { 
          label: 'Sync Failed',
          config: {
            status: 'error',
            description: 'Data sync failed after retries'
          }
        },
      }
    ],
    edges: [
      { id: 'e1', source: 'scheduled-1', target: 'fetch-data-1' },
      { id: 'e2', source: 'fetch-data-1', target: 'check-response-1' },
      { id: 'e3', source: 'check-response-1', target: 'process-data-1', sourceHandle: 'yes', label: 'Success' },
      { id: 'e4', source: 'check-response-1', target: 'retry-1', sourceHandle: 'no', label: 'Failed' },
      { id: 'e5', source: 'process-data-1', target: 'sync-complete-1' },
      { id: 'e6', source: 'retry-1', target: 'sync-failed-1' },
    ]
  }
};

export default workflowExamples;
