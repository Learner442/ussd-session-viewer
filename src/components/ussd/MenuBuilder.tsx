import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit, Trash2, ArrowRight, ArrowUp, ArrowDown, Save, Workflow, List } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VisualFlowBuilder } from "./VisualFlowBuilder";

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

interface MenuBuilderProps {
  selectedFlowId: string | null;
}

export function MenuBuilder({ selectedFlowId }: MenuBuilderProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [steps, setSteps] = useState<MenuStep[]>([]);
  const [options, setOptions] = useState<MenuOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<MenuStep | null>(null);
  const [editingOption, setEditingOption] = useState<MenuOption | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const [stepFormData, setStepFormData] = useState({
    step_name: "",
    menu_text: "",
    response_type: "selection",
    timeout_seconds: 30,
    fallback_message: "",
    is_initial_step: false,
    parent_step_id: "",
    api_endpoint: ""
  });

  const [optionFormData, setOptionFormData] = useState({
    option_number: 1,
    option_text: "",
    option_value: "",
    next_step_id: "",
    is_active: true
  });

  const responseTypes = [
    { value: "selection", label: "Selection Menu" },
    { value: "input", label: "Text Input" },
    { value: "confirmation", label: "Confirmation" },
    { value: "end", label: "End Session" }
  ];

  useEffect(() => {
    if (selectedFlowId) {
      loadFlowSteps();
    }
  }, [selectedFlowId]);

  const loadFlowSteps = async () => {
    if (!selectedFlowId) return;

    try {
      setLoading(true);
      
      // Load steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('ussd_menu_steps')
        .select('*')
        .eq('flow_id', selectedFlowId)
        .order('step_number');

      if (stepsError) throw stepsError;

      // Load options for all steps
      const { data: optionsData, error: optionsError } = await supabase
        .from('ussd_menu_options')
        .select('*')
        .in('step_id', stepsData?.map(s => s.id) || [])
        .order('option_number');

      if (optionsError) throw optionsError;

      setSteps(stepsData || []);
      setOptions(optionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFlowId) return;

    try {
      const stepData = {
        ...stepFormData,
        flow_id: selectedFlowId,
        step_number: editingStep ? editingStep.step_number : steps.length + 1,
        parent_step_id: stepFormData.parent_step_id === "none" ? null : stepFormData.parent_step_id || null,
        api_endpoint: stepFormData.api_endpoint || null,
        fallback_message: stepFormData.fallback_message || null
      };

      if (editingStep) {
        const { error } = await supabase
          .from('ussd_menu_steps')
          .update(stepData)
          .eq('id', editingStep.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Step updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('ussd_menu_steps')
          .insert(stepData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Step created successfully",
        });
      }

      setIsStepDialogOpen(false);
      setEditingStep(null);
      resetStepForm();
      loadFlowSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStepId) return;

    try {
      const optionData = {
        ...optionFormData,
        step_id: selectedStepId,
        next_step_id: optionFormData.next_step_id === "end" ? null : optionFormData.next_step_id || null,
        option_value: optionFormData.option_value || null
      };

      if (editingOption) {
        const { error } = await supabase
          .from('ussd_menu_options')
          .update(optionData)
          .eq('id', editingOption.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Option updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('ussd_menu_options')
          .insert(optionData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Option created successfully",
        });
      }

      setIsOptionDialogOpen(false);
      setEditingOption(null);
      resetOptionForm();
      loadFlowSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetStepForm = () => {
    setStepFormData({
      step_name: "",
      menu_text: "",
      response_type: "selection",
      timeout_seconds: 30,
      fallback_message: "",
      is_initial_step: false,
      parent_step_id: "",
      api_endpoint: ""
    });
  };

  const resetOptionForm = () => {
    setOptionFormData({
      option_number: 1,
      option_text: "",
      option_value: "",
      next_step_id: "",
      is_active: true
    });
  };

  const editStep = (step: MenuStep) => {
    setEditingStep(step);
    setStepFormData({
      step_name: step.step_name,
      menu_text: step.menu_text,
      response_type: step.response_type,
      timeout_seconds: step.timeout_seconds,
      fallback_message: step.fallback_message || "",
      is_initial_step: step.is_initial_step,
      parent_step_id: step.parent_step_id || "none",
      api_endpoint: step.api_endpoint || ""
    });
    setIsStepDialogOpen(true);
  };

  const editOption = (option: MenuOption) => {
    setEditingOption(option);
    setSelectedStepId(option.step_id);
    setOptionFormData({
      option_number: option.option_number,
      option_text: option.option_text,
      option_value: option.option_value || "",
      next_step_id: option.next_step_id || "end",
      is_active: option.is_active
    });
    setIsOptionDialogOpen(true);
  };

  const deleteStep = async (stepId: string) => {
    if (!confirm("Are you sure you want to delete this step? This will also delete all its options.")) {
      return;
    }

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
      
      loadFlowSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteOption = async (optionId: string) => {
    if (!confirm("Are you sure you want to delete this option?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ussd_menu_options')
        .delete()
        .eq('id', optionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Option deleted successfully",
      });
      
      loadFlowSteps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStepOptions = (stepId: string) => {
    return options.filter(opt => opt.step_id === stepId);
  };

  if (!selectedFlowId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Select a menu flow to start building</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Menu Builder</h2>
          <p className="text-muted-foreground">Design your USSD menu flow with visual or form-based tools</p>
        </div>
        
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingStep ? 'Edit Step' : 'Add New Step'}</DialogTitle>
              <DialogDescription>
                Create a menu step with text and response handling
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleStepSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="step_name">Step Name</Label>
                  <Input
                    id="step_name"
                    value={stepFormData.step_name}
                    onChange={(e) => setStepFormData({ ...stepFormData, step_name: e.target.value })}
                    placeholder="e.g., Welcome Screen"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="response_type">Response Type</Label>
                  <Select
                    value={stepFormData.response_type}
                    onValueChange={(value) => setStepFormData({ ...stepFormData, response_type: value })}
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
                  value={stepFormData.menu_text}
                  onChange={(e) => setStepFormData({ ...stepFormData, menu_text: e.target.value })}
                  placeholder="Enter the USSD menu text that users will see"
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
                    value={stepFormData.timeout_seconds}
                    onChange={(e) => setStepFormData({ ...stepFormData, timeout_seconds: parseInt(e.target.value) })}
                    min="10"
                    max="180"
                  />
                </div>
                
                <div>
                  <Label htmlFor="parent_step_id">Parent Step</Label>
                  <Select
                    value={stepFormData.parent_step_id}
                    onValueChange={(value) => setStepFormData({ ...stepFormData, parent_step_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent step" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Step)</SelectItem>
                      {steps.map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.step_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="fallback_message">Fallback Message</Label>
                <Input
                  id="fallback_message"
                  value={stepFormData.fallback_message}
                  onChange={(e) => setStepFormData({ ...stepFormData, fallback_message: e.target.value })}
                  placeholder="Message shown on invalid input or timeout"
                />
              </div>
              
              <div>
                <Label htmlFor="api_endpoint">API Endpoint (Optional)</Label>
                <Input
                  id="api_endpoint"
                  value={stepFormData.api_endpoint}
                  onChange={(e) => setStepFormData({ ...stepFormData, api_endpoint: e.target.value })}
                  placeholder="https://api.example.com/endpoint"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_initial_step"
                  checked={stepFormData.is_initial_step}
                  onCheckedChange={(checked) => setStepFormData({ ...stepFormData, is_initial_step: checked })}
                />
                <Label htmlFor="is_initial_step">Initial Step</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  {editingStep ? 'Update' : 'Create'} Step
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Builder Tabs */}
      <Tabs defaultValue="visual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Visual Builder
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Form Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          <VisualFlowBuilder
            selectedFlowId={selectedFlowId}
            steps={steps}
            options={options}
            onStepsChange={loadFlowSteps}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          {/* Steps List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">Loading steps...</CardContent>
          </Card>
        ) : steps.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No steps created yet. Add your first step to get started.</p>
            </CardContent>
          </Card>
        ) : (
          steps.map((step, index) => (
            <Card key={step.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Step {step.step_number}</Badge>
                    <CardTitle className="text-lg">{step.step_name}</CardTitle>
                    {step.is_initial_step && (
                      <Badge variant="default">Initial</Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editStep(step)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedStepId(step.id);
                        setIsOptionDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteStep(step.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Menu Text:</Label>
                    <div className="bg-muted p-3 rounded-md mt-1">
                      <pre className="whitespace-pre-wrap text-sm">{step.menu_text}</pre>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label>Response Type:</Label>
                      <Badge variant="outline" className="ml-2">
                        {responseTypes.find(t => t.value === step.response_type)?.label}
                      </Badge>
                    </div>
                    <div>
                      <Label>Timeout:</Label>
                      <span className="ml-2">{step.timeout_seconds}s</span>
                    </div>
                    <div>
                      <Label>API:</Label>
                      <span className="ml-2">{step.api_endpoint ? "Yes" : "No"}</span>
                    </div>
                  </div>
                  
                  {/* Options for this step */}
                  {step.response_type === 'selection' && (
                    <div>
                      <Label className="text-sm font-medium">Options:</Label>
                      <div className="mt-2 space-y-2">
                        {getStepOptions(step.id).map((option) => (
                          <div key={option.id} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{option.option_number}</Badge>
                              <span>{option.option_text}</span>
                              {option.next_step_id && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-xs">
                                    {steps.find(s => s.id === option.next_step_id)?.step_name || 'Unknown'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => editOption(option)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteOption(option.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Option Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingOption ? 'Edit Option' : 'Add Menu Option'}</DialogTitle>
            <DialogDescription>
              Create a selectable option for the menu step
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleOptionSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="option_number">Option Number</Label>
                <Input
                  id="option_number"
                  type="number"
                  value={optionFormData.option_number}
                  onChange={(e) => setOptionFormData({ ...optionFormData, option_number: parseInt(e.target.value) })}
                  min="1"
                  max="9"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="option_value">Option Value</Label>
                <Input
                  id="option_value"
                  value={optionFormData.option_value}
                  onChange={(e) => setOptionFormData({ ...optionFormData, option_value: e.target.value })}
                  placeholder="Internal value"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="option_text">Option Text</Label>
              <Input
                id="option_text"
                value={optionFormData.option_text}
                onChange={(e) => setOptionFormData({ ...optionFormData, option_text: e.target.value })}
                placeholder="Text displayed to user"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="next_step_id">Next Step</Label>
              <Select
                value={optionFormData.next_step_id}
                onValueChange={(value) => setOptionFormData({ ...optionFormData, next_step_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select next step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">End Session</SelectItem>
                  {steps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.step_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={optionFormData.is_active}
                onCheckedChange={(checked) => setOptionFormData({ ...optionFormData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingOption ? 'Update' : 'Create'} Option
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsOptionDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}