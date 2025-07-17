import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './flow-builder.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Edit, Trash2, MessageSquare, Type as InputIcon, CheckCircle, XCircle } from 'lucide-react';

interface MenuStep {
  id: string;
  flow_id: string;
  step_number: number;
  step_name: string;
  menu_text: string;
  response_type: string;
  timeout_seconds: number;
  fallback_message: string | null;
  is_initial_step: boolean;
  parent_step_id: string | null;
  api_endpoint: string | null;
  created_at: string;
  updated_at: string;
}

interface MenuOption {
  id: string;
  step_id: string;
  option_number: number;
  option_text: string;
  option_value: string | null;
  next_step_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface VisualFlowBuilderProps {
  selectedFlowId: string | null;
  steps: MenuStep[];
  options: MenuOption[];
  onStepsChange: () => void;
}

// Custom Node Components
const StepNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getIcon = () => {
    switch (data.response_type) {
      case 'selection':
        return <MessageSquare className="h-4 w-4" />;
      case 'input':
        return <InputIcon className="h-4 w-4" />;
      case 'confirmation':
        return <CheckCircle className="h-4 w-4" />;
      case 'end':
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getBorderColor = () => {
    switch (data.response_type) {
      case 'selection':
        return 'border-blue-500';
      case 'input':
        return 'border-green-500';
      case 'confirmation':
        return 'border-yellow-500';
      case 'end':
        return 'border-red-500';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className={`
      bg-white border-2 rounded-lg p-3 min-w-[200px] shadow-sm
      ${getBorderColor()}
      ${selected ? 'ring-2 ring-primary' : ''}
      ${data.is_initial_step ? 'bg-green-50' : ''}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
      />
      
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <div className="font-medium text-sm">{data.step_name}</div>
        {data.is_initial_step && (
          <Badge variant="secondary" className="text-xs">Start</Badge>
        )}
      </div>
      
      <div className="text-xs text-gray-600 mb-2 line-clamp-2">
        {data.menu_text}
      </div>
      
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          {data.response_type}
        </Badge>
        <div className="text-xs text-gray-500">
          #{data.step_number}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
      />
    </div>
  );
};

const nodeTypes = {
  stepNode: StepNode,
};

export function VisualFlowBuilder({ selectedFlowId, steps, options, onStepsChange }: VisualFlowBuilderProps) {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    step_name: '',
    menu_text: '',
    response_type: 'selection',
    timeout_seconds: 30,
    fallback_message: '',
    api_endpoint: ''
  });

  const responseTypes = [
    { value: "selection", label: "Selection Menu" },
    { value: "input", label: "Text Input" },
    { value: "confirmation", label: "Confirmation" },
    { value: "end", label: "End Session" }
  ];

  // Convert steps to nodes and options to edges
  useEffect(() => {
    if (!steps.length) return;

    const newNodes = steps.map((step, index) => ({
      id: step.id,
      type: 'stepNode',
      position: { 
        x: (index % 3) * 250 + 50, 
        y: Math.floor(index / 3) * 150 + 50 
      },
      data: {
        ...step,
        onEdit: () => handleEditStep(step),
        onDelete: () => handleDeleteStep(step.id),
      },
    }));

    const newEdges = options
      .filter(option => option.next_step_id)
      .map(option => ({
        id: `${option.step_id}-${option.next_step_id}`,
        source: option.step_id,
        target: option.next_step_id!,
        label: `${option.option_number}. ${option.option_text}`,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: '#666' },
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [steps, options]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleEditStep = (step: MenuStep) => {
    setEditFormData({
      step_name: step.step_name,
      menu_text: step.menu_text,
      response_type: step.response_type,
      timeout_seconds: step.timeout_seconds,
      fallback_message: step.fallback_message || '',
      api_endpoint: step.api_endpoint || ''
    });
    setSelectedNode(nodes.find(n => n.id === step.id) || null);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm("Are you sure you want to delete this step?")) return;

    try {
      const { error } = await supabase
        .from('ussd_menu_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Step deleted successfully",
      });
      
      onStepsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    try {
      const { error } = await supabase
        .from('ussd_menu_steps')
        .update(editFormData)
        .eq('id', selectedNode.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Step updated successfully",
      });

      setIsEditDialogOpen(false);
      onStepsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addNewStep = async () => {
    if (!selectedFlowId) return;

    const newStepData = {
      flow_id: selectedFlowId,
      step_number: steps.length + 1,
      step_name: `Step ${steps.length + 1}`,
      menu_text: 'New menu step',
      response_type: 'selection',
      timeout_seconds: 30,
      is_initial_step: steps.length === 0,
    };

    try {
      const { error } = await supabase
        .from('ussd_menu_steps')
        .insert(newStepData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "New step added successfully",
      });

      onStepsChange();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!selectedFlowId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Select a menu flow to start building visually</p>
      </Card>
    );
  }

  return (
    <div className="w-full h-[600px] border rounded-lg bg-gray-50">
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div>
          <h3 className="font-medium">Visual Flow Builder</h3>
          <p className="text-sm text-muted-foreground">Drag and connect your USSD menu steps</p>
        </div>
        <Button onClick={addNewStep}>
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ background: '#f9fafb' }}
      >
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor={(node) => {
            switch (node.data?.response_type) {
              case 'selection': return '#3b82f6';
              case 'input': return '#10b981';
              case 'confirmation': return '#f59e0b';
              case 'end': return '#ef4444';
              default: return '#6b7280';
            }
          }}
        />
        <Background />
      </ReactFlow>

      {/* Edit Step Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Step</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleUpdateStep} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="step_name">Step Name</Label>
                <Input
                  id="step_name"
                  value={editFormData.step_name}
                  onChange={(e) => setEditFormData({ ...editFormData, step_name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="response_type">Response Type</Label>
                <Select
                  value={editFormData.response_type}
                  onValueChange={(value) => setEditFormData({ ...editFormData, response_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {responseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="menu_text">Menu Text</Label>
              <Textarea
                id="menu_text"
                value={editFormData.menu_text}
                onChange={(e) => setEditFormData({ ...editFormData, menu_text: e.target.value })}
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timeout_seconds">Timeout (seconds)</Label>
                <Input
                  id="timeout_seconds"
                  type="number"
                  value={editFormData.timeout_seconds}
                  onChange={(e) => setEditFormData({ ...editFormData, timeout_seconds: parseInt(e.target.value) })}
                  min="10"
                  max="180"
                />
              </div>
              
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={editFormData.api_endpoint}
                  onChange={(e) => setEditFormData({ ...editFormData, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="fallback_message">Fallback Message</Label>
              <Input
                id="fallback_message"
                value={editFormData.fallback_message}
                onChange={(e) => setEditFormData({ ...editFormData, fallback_message: e.target.value })}
                placeholder="Message shown on invalid input or timeout"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Update Step
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}