import {
  Play, MessageSquare, Image, MousePointerClick, List, FileText,
  GitBranch, Keyboard, HelpCircle, MapPin, Home, Globe, Link, Square
} from 'lucide-react';

export interface NodeTypeConfig {
  type: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  category: string;
  description: string;
  defaultData: Record<string, any>;
}

export const NODE_TYPES_CONFIG: NodeTypeConfig[] = [
  {
    type: 'startNode',
    label: 'Start Node',
    icon: Play,
    color: '#10b981',
    bgColor: '#064e3b',
    category: 'Flow Control',
    description: 'Entry point of the flow',
    defaultData: { label: 'Start' },
  },
  {
    type: 'textMessage',
    label: 'Text Message',
    icon: MessageSquare,
    color: '#6366f1',
    bgColor: '#1e1b4b',
    category: 'Messages',
    description: 'Send a text message',
    defaultData: { label: 'Text Message', message: '', variables: [] },
  },
  {
    type: 'mediaMessage',
    label: 'Media Message',
    icon: Image,
    color: '#8b5cf6',
    bgColor: '#2e1065',
    category: 'Messages',
    description: 'Send image, video, or audio',
    defaultData: { label: 'Media Message', mediaType: 'image', url: '', caption: '' },
  },
  {
    type: 'quickReply',
    label: 'Quick Reply Buttons',
    icon: MousePointerClick,
    color: '#f59e0b',
    bgColor: '#451a03',
    category: 'Messages',
    description: 'Message with quick reply buttons',
    defaultData: { label: 'Quick Reply', message: '', buttons: [{ id: 'btn_1', text: 'Option 1' }] },
  },
  {
    type: 'listMessage',
    label: 'List Message',
    icon: List,
    color: '#06b6d4',
    bgColor: '#0c4a6e',
    category: 'Messages',
    description: 'WhatsApp list picker',
    defaultData: {
      label: 'List Message',
      header: '',
      body: '',
      footer: '',
      buttonText: 'Choose',
      sections: [{ title: 'Section 1', rows: [{ id: 'row_1', title: 'Option 1', description: '' }] }],
    },
  },
  {
    type: 'whatsappForm',
    label: 'WhatsApp Form',
    icon: FileText,
    color: '#ec4899',
    bgColor: '#500724',
    category: 'Messages',
    description: 'Dynamic form with fields',
    defaultData: {
      label: 'WhatsApp Form',
      fields: [{ id: 'field_1', label: 'Name', type: 'text', required: true }],
    },
  },
  {
    type: 'conditionNode',
    label: 'Condition',
    icon: GitBranch,
    color: '#f97316',
    bgColor: '#431407',
    category: 'Logic',
    description: 'Branch based on condition',
    defaultData: { label: 'Condition', variable: '', operator: 'equals', value: '' },
  },
  {
    type: 'userInput',
    label: 'User Input',
    icon: Keyboard,
    color: '#14b8a6',
    bgColor: '#042f2e',
    category: 'Inputs',
    description: 'Capture free-form user input',
    defaultData: { label: 'User Input', prompt: '', variableName: '', inputType: 'text' },
  },
  {
    type: 'askQuestion',
    label: 'Ask Question',
    icon: HelpCircle,
    color: '#3b82f6',
    bgColor: '#1e3a5f',
    category: 'Inputs',
    description: 'Ask and wait for an answer',
    defaultData: { label: 'Ask Question', question: '', variableName: '' },
  },
  {
    type: 'askLocation',
    label: 'Ask Location',
    icon: MapPin,
    color: '#ef4444',
    bgColor: '#450a0a',
    category: 'Inputs',
    description: 'Request GPS location',
    defaultData: { label: 'Ask Location', prompt: '', variableName: '' },
  },
  {
    type: 'askAddress',
    label: 'Ask Address',
    icon: Home,
    color: '#84cc16',
    bgColor: '#1a2e05',
    category: 'Inputs',
    description: 'Request postal address',
    defaultData: { label: 'Ask Address', prompt: '', variableName: '' },
  },
  {
    type: 'apiRequest',
    label: 'API Request',
    icon: Globe,
    color: '#a855f7',
    bgColor: '#2e1065',
    category: 'Actions',
    description: 'Make an HTTP request',
    defaultData: {
      label: 'API Request',
      url: '',
      method: 'GET',
      headers: [],
      body: '',
      responseMapping: [],
    },
  },
  {
    type: 'connectFlow',
    label: 'Connect Flow',
    icon: Link,
    color: '#0ea5e9',
    bgColor: '#0c4a6e',
    category: 'Flow Control',
    description: 'Jump to another flow',
    defaultData: { label: 'Connect Flow', flowId: '', flowName: '' },
  },
  {
    type: 'endNode',
    label: 'End Node',
    icon: Square,
    color: '#64748b',
    bgColor: '#0f172a',
    category: 'Flow Control',
    description: 'End the conversation',
    defaultData: { label: 'End', message: '' },
  },
];

export const CATEGORIES = ['Flow Control', 'Messages', 'Inputs', 'Logic', 'Actions'];

export function getNodeConfig(type: string): NodeTypeConfig | undefined {
  return NODE_TYPES_CONFIG.find(n => n.type === type);
}
