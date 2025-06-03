export const sampleWorkflowData = {
  nodes: [
    {
      id: 'start-1',
      type: 'startNode',
      position: { x: 400, y: 50 },
      data: {
        label: 'Start Workflow',
        config: {
          inputType: 'webhook',
          description: 'Workflow entry point for data processing'
        }
      }
    },
    {
      id: 'action-enrich',
      type: 'actionNode',
      position: { x: 400, y: 150 },
      data: {
        label: 'Enrich Data',
        config: {
          actionType: 'transform',
          parameters: {
            personas: 3,
            titles: 25
          },
          description: 'Enrich incoming data with personas and titles'
        }
      }
    },
    {
      id: 'decision-persona-ops',
      type: 'decisionNode',
      position: { x: 200, y: 250 },
      data: {
        label: 'Check Operations?',
        config: {
          condition: 'data.persona === "operations"',
          trueBranchLabel: 'Operations',
          falseBranchLabel: 'Finance',
          description: 'Check if persona is operations or finance'
        }
      }
    },
    {
      id: 'decision-persona-finance',
      type: 'decisionNode',
      position: { x: 600, y: 250 },
      data: {
        label: 'Check Finance?',
        config: {
          condition: 'data.persona === "finance"',
          trueBranchLabel: 'Finance',
          falseBranchLabel: 'HR',
          description: 'Check if persona is finance or HR'
        }
      }
    },
    {
      id: 'action-content-ops',
      type: 'actionNode',
      position: { x: 100, y: 350 },
      data: {
        label: 'Operations Content',
        config: {
          actionType: 'api',
          parameters: {
            contentType: 'operations',
            template: 'ops-brief'
          },
          description: 'Generate personalized content for operations'
        }
      }
    },
    {
      id: 'action-content-finance',
      type: 'actionNode',
      position: { x: 500, y: 350 },
      data: {
        label: 'Finance Content',
        config: {
          actionType: 'api',
          parameters: {
            contentType: 'finance',
            template: 'finance-brief'
          },
          description: 'Generate personalized content for finance'
        }
      }
    },
    {
      id: 'action-content-hr',
      type: 'actionNode',
      position: { x: 700, y: 350 },
      data: {
        label: 'HR Content',
        config: {
          actionType: 'api',
          parameters: {
            contentType: 'hr',
            template: 'hr-brief'
          },
          description: 'Generate personalized content for HR'
        }
      }
    },
    {
      id: 'action-openai-ops',
      type: 'actionNode',
      position: { x: 100, y: 450 },
      data: {
        label: 'OpenAI Processing',
        config: {
          actionType: 'api',
          parameters: {
            model: 'gpt-4',
            task: 'enhance-operations-content'
          },
          description: 'AI processing for operations content'
        }
      }
    },
    {
      id: 'action-openai-finance',
      type: 'actionNode',
      position: { x: 500, y: 450 },
      data: {
        label: 'OpenAI Processing',
        config: {
          actionType: 'api',
          parameters: {
            model: 'gpt-4',
            task: 'enhance-finance-content'
          },
          description: 'AI processing for finance content'
        }
      }
    },
    {
      id: 'action-openai-hr',
      type: 'actionNode',
      position: { x: 700, y: 450 },
      data: {
        label: 'OpenAI Processing',
        config: {
          actionType: 'api',
          parameters: {
            model: 'gpt-4',
            task: 'enhance-hr-content'
          },
          description: 'AI processing for HR content'
        }
      }
    },
    {
      id: 'action-delivery-ops',
      type: 'actionNode',
      position: { x: 100, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email',
          parameters: {
            sequence: 'operations-email-sequence'
          },
          description: 'Add to operations email sequence'
        }
      }
    },
    {
      id: 'action-delivery-finance',
      type: 'actionNode',
      position: { x: 500, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email',
          parameters: {
            sequence: 'finance-email-sequence'
          },
          description: 'Add to finance email sequence'
        }
      }
    },
    {
      id: 'action-delivery-hr',
      type: 'actionNode',
      position: { x: 700, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email',
          parameters: {
            sequence: 'hr-email-sequence'
          },
          description: 'Add to HR email sequence'
        }
      }
    },
    {
      id: 'terminal-ops',
      type: 'terminalNode',
      position: { x: 100, y: 650 },
      data: {
        label: 'Operations Complete',
        config: {
          status: 'completed',
          returnValue: {
            persona: 'operations',
            status: 'success'
          },
          description: 'Operations workflow completed successfully'
        }
      }
    },
    {
      id: 'terminal-finance',
      type: 'terminalNode',
      position: { x: 500, y: 650 },
      data: {
        label: 'Finance Complete',
        config: {
          status: 'completed',
          returnValue: {
            persona: 'finance',
            status: 'success'
          },
          description: 'Finance workflow completed successfully'
        }
      }
    },
    {
      id: 'terminal-hr',
      type: 'terminalNode',
      position: { x: 700, y: 650 },
      data: {
        label: 'HR Complete',
        config: {
          status: 'completed',
          returnValue: {
            persona: 'hr',
            status: 'success'
          },
          description: 'HR workflow completed successfully'
        }
      }
    }
  ],
  edges: [
    {
      id: 'start-to-enrich',
      source: 'start-1',
      target: 'action-enrich',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'enrich-to-ops-decision',
      source: 'action-enrich',
      target: 'decision-persona-ops',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'enrich-to-finance-decision',
      source: 'action-enrich',
      target: 'decision-persona-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'ops-decision-true',
      source: 'decision-persona-ops',
      sourceHandle: 'true',
      target: 'action-content-ops',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'ops-decision-false',
      source: 'decision-persona-ops',
      sourceHandle: 'false',
      target: 'action-content-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'finance-decision-true',
      source: 'decision-persona-finance',
      sourceHandle: 'true',
      target: 'action-content-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'finance-decision-false',
      source: 'decision-persona-finance',
      sourceHandle: 'false',
      target: 'action-content-hr',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'content-ops-to-openai',
      source: 'action-content-ops',
      target: 'action-openai-ops',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'content-finance-to-openai',
      source: 'action-content-finance',
      target: 'action-openai-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'content-hr-to-openai',
      source: 'action-content-hr',
      target: 'action-openai-hr',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'openai-ops-to-delivery',
      source: 'action-openai-ops',
      target: 'action-delivery-ops',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'openai-finance-to-delivery',
      source: 'action-openai-finance',
      target: 'action-delivery-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'openai-hr-to-delivery',
      source: 'action-openai-hr',
      target: 'action-delivery-hr',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'delivery-ops-to-terminal',
      source: 'action-delivery-ops',
      target: 'terminal-ops',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'delivery-finance-to-terminal',
      source: 'action-delivery-finance',
      target: 'terminal-finance',
      type: 'custom',
      reconnectable: true
    },
    {
      id: 'delivery-hr-to-terminal',
      source: 'action-delivery-hr',
      target: 'terminal-hr',
      type: 'custom',
      reconnectable: true
    }
  ],
  metadata: {
    name: 'Core Workflow - 4 Node Types',
    description: 'Workflow using only Start, Action, Decision, and Terminal nodes',
    version: '1.2',
    createdAt: new Date().toISOString()
  }
};