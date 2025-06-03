// Sample workflow data based on the client's screenshot
export const sampleWorkflowData = {
  nodes: [
    {
      id: 'enrich-1',
      type: 'startNode',
      position: { x: 400, y: 50 },
      data: {
        label: 'Enrich',
        config: {
          inputType: 'webhook',
          description: '3 Personas, 25 Titles'
        }
      }
    },
    {
      id: 'decision-persona',
      type: 'decisionNode',
      position: { x: 400, y: 200 },
      data: {
        label: 'Decision for Persona',
        branches: ['Operations', 'Finance', 'Human Resources'],
        config: {
          condition: 'Based on persona type',
          description: 'Route to appropriate persona workflow'
        }
      }
    },
    {
      id: 'content-ops',
      type: 'actionNode',
      position: { x: 150, y: 350 },
      data: {
        label: 'Personalised Content',
        config: {
          actionType: 'content_generation',
          description: 'AI Brief Operations'
        }
      }
    },
    {
      id: 'content-finance',
      type: 'actionNode',
      position: { x: 400, y: 350 },
      data: {
        label: 'Personalised Content',
        config: {
          actionType: 'content_generation',
          description: 'AI Brief Finance'
        }
      }
    },
    {
      id: 'content-hr',
      type: 'actionNode',
      position: { x: 650, y: 350 },
      data: {
        label: 'Personalised Content',
        config: {
          actionType: 'content_generation',
          description: 'AI Brief Human Resources'
        }
      }
    },
    {
      id: 'openai-ops',
      type: 'actionNode',
      position: { x: 150, y: 450 },
      data: {
        label: 'OpenAI',
        config: {
          actionType: 'ai_processing',
          model: 'gpt-4',
          description: 'AI processing for operations content'
        }
      }
    },
    {
      id: 'openai-finance',
      type: 'actionNode',
      position: { x: 400, y: 450 },
      data: {
        label: 'OpenAI',
        config: {
          actionType: 'ai_processing',
          model: 'gpt-4',
          description: 'AI processing for finance content'
        }
      }
    },
    {
      id: 'openai-hr',
      type: 'actionNode',
      position: { x: 650, y: 450 },
      data: {
        label: 'OpenAI',
        config: {
          actionType: 'ai_processing',
          model: 'gpt-4',
          description: 'AI processing for HR content'
        }
      }
    },
    {
      id: 'delivery-ops',
      type: 'actionNode',
      position: { x: 150, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email_delivery',
          description: 'Add to personalised email sequence'
        }
      }
    },
    {
      id: 'delivery-finance',
      type: 'actionNode',
      position: { x: 400, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email_delivery',
          description: 'Add to personalised email sequence'
        }
      }
    },
    {
      id: 'delivery-hr',
      type: 'actionNode',
      position: { x: 650, y: 550 },
      data: {
        label: 'Delivery',
        config: {
          actionType: 'email_delivery',
          description: 'Add to personalised email sequence'
        }
      }
    },
    {
      id: 'tapistro-ops',
      type: 'terminalNode',
      position: { x: 150, y: 650 },
      data: {
        label: 'Tapistro',
        config: {
          status: 'success',
          description: 'Operations workflow completed'
        }
      }
    },
    {
      id: 'tapistro-finance',
      type: 'terminalNode',
      position: { x: 400, y: 650 },
      data: {
        label: 'Tapistro',
        config: {
          status: 'success',
          description: 'Finance workflow completed'
        }
      }
    },
    {
      id: 'tapistro-hr',
      type: 'terminalNode',
      position: { x: 650, y: 650 },
      data: {
        label: 'Tapistro',
        config: {
          status: 'success',
          description: 'HR workflow completed'
        }
      }
    }
  ],
  edges: [
    // Main flow from start to decision
    {
      id: 'enrich-to-decision',
      source: 'enrich-1',
      target: 'decision-persona',
      type: 'custom'
    },
    
    // Decision branches to content nodes
    {
      id: 'decision-to-ops',
      source: 'decision-persona',
      sourceHandle: 'operations',
      target: 'content-ops',
      type: 'custom'
    },
    {
      id: 'decision-to-finance',
      source: 'decision-persona',
      sourceHandle: 'finance',
      target: 'content-finance',
      type: 'custom'
    },
    {
      id: 'decision-to-hr',
      source: 'decision-persona',
      sourceHandle: 'human_resources',
      target: 'content-hr',
      type: 'custom'
    },
    
    // Content to OpenAI processing
    {
      id: 'content-ops-to-openai',
      source: 'content-ops',
      target: 'openai-ops',
      type: 'custom'
    },
    {
      id: 'content-finance-to-openai',
      source: 'content-finance',
      target: 'openai-finance',
      type: 'custom'
    },
    {
      id: 'content-hr-to-openai',
      source: 'content-hr',
      target: 'openai-hr',
      type: 'custom'
    },
    
    // OpenAI to delivery
    {
      id: 'openai-ops-to-delivery',
      source: 'openai-ops',
      target: 'delivery-ops',
      type: 'custom'
    },
    {
      id: 'openai-finance-to-delivery',
      source: 'openai-finance',
      target: 'delivery-finance',
      type: 'custom'
    },
    {
      id: 'openai-hr-to-delivery',
      source: 'openai-hr',
      target: 'delivery-hr',
      type: 'custom'
    },
    
    // Delivery to terminal nodes
    {
      id: 'delivery-ops-to-terminal',
      source: 'delivery-ops',
      target: 'tapistro-ops',
      type: 'custom'
    },
    {
      id: 'delivery-finance-to-terminal',
      source: 'delivery-finance',
      target: 'tapistro-finance',
      type: 'custom'
    },
    {
      id: 'delivery-hr-to-terminal',
      source: 'delivery-hr',
      target: 'tapistro-hr',
      type: 'custom'
    }
  ],
  metadata: {
    name: 'Persona-based Content Generation Workflow',
    description: 'A workflow that enriches personas and generates personalized content for different departments',
    version: '1.0',
    createdAt: new Date().toISOString()
  }
};