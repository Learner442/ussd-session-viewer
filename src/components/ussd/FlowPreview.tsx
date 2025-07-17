import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play, RotateCcw, ArrowRight, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MenuStep {
  id: string;
  step_name: string;
  menu_text: string;
  response_type: string;
  timeout_seconds: number;
  fallback_message: string | null;
  is_initial_step: boolean;
}

interface MenuOption {
  id: string;
  step_id: string;
  option_number: number;
  option_text: string;
  next_step_id: string | null;
  is_active: boolean;
}

interface FlowPreviewProps {
  selectedFlowId: string | null;
}

export function FlowPreview({ selectedFlowId }: FlowPreviewProps) {
  const { t } = useTranslation('common');
  const { toast } = useToast();
  const [steps, setSteps] = useState<MenuStep[]>([]);
  const [options, setOptions] = useState<MenuOption[]>([]);
  const [currentStep, setCurrentStep] = useState<MenuStep | null>(null);
  const [sessionHistory, setSessionHistory] = useState<Array<{step: MenuStep, input?: string, time: string}>>([]);
  const [userInput, setUserInput] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFlowId) {
      loadFlowData();
    }
  }, [selectedFlowId]);

  const loadFlowData = async () => {
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

      // Load options
      const { data: optionsData, error: optionsError } = await supabase
        .from('ussd_menu_options')
        .select('*')
        .in('step_id', stepsData?.map(s => s.id) || [])
        .eq('is_active', true)
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

  const startSession = () => {
    const initialStep = steps.find(step => step.is_initial_step) || steps[0];
    if (initialStep) {
      setCurrentStep(initialStep);
      setSessionHistory([{
        step: initialStep,
        time: new Date().toLocaleTimeString()
      }]);
      setIsSessionActive(true);
      setUserInput("");
    }
  };

  const resetSession = () => {
    setCurrentStep(null);
    setSessionHistory([]);
    setIsSessionActive(false);
    setUserInput("");
  };

  const handleUserInput = () => {
    if (!currentStep || !userInput.trim()) return;

    const currentStepOptions = options.filter(opt => opt.step_id === currentStep.id);
    
    if (currentStep.response_type === 'selection') {
      // Handle selection input
      const selectedOption = currentStepOptions.find(opt => 
        opt.option_number.toString() === userInput.trim()
      );

      if (selectedOption) {
        // Add to history
        const newHistoryEntry = {
          step: currentStep,
          input: `${selectedOption.option_number}. ${selectedOption.option_text}`,
          time: new Date().toLocaleTimeString()
        };
        
        if (selectedOption.next_step_id) {
          // Navigate to next step
          const nextStep = steps.find(step => step.id === selectedOption.next_step_id);
          if (nextStep) {
            setCurrentStep(nextStep);
            setSessionHistory(prev => [...prev, newHistoryEntry, {
              step: nextStep,
              time: new Date().toLocaleTimeString()
            }]);
          }
        } else {
          // End session
          setSessionHistory(prev => [...prev, newHistoryEntry]);
          setIsSessionActive(false);
          setCurrentStep(null);
        }
      } else {
        // Invalid selection
        toast({
          title: "Invalid Selection",
          description: currentStep.fallback_message || "Please select a valid option",
          variant: "destructive",
        });
      }
    } else if (currentStep.response_type === 'input') {
      // Handle text input
      const newHistoryEntry = {
        step: currentStep,
        input: userInput,
        time: new Date().toLocaleTimeString()
      };
      
      setSessionHistory(prev => [...prev, newHistoryEntry]);
      
      // For input type, you might want to navigate to a specific next step
      // This is a simplified version - in real implementation, you'd handle this based on your flow logic
      setIsSessionActive(false);
      setCurrentStep(null);
    } else if (currentStep.response_type === 'confirmation') {
      // Handle confirmation (yes/no)
      const response = userInput.toLowerCase();
      if (['1', 'yes', 'y'].includes(response) || ['2', 'no', 'n'].includes(response)) {
        const newHistoryEntry = {
          step: currentStep,
          input: ['1', 'yes', 'y'].includes(response) ? 'Yes' : 'No',
          time: new Date().toLocaleTimeString()
        };
        
        setSessionHistory(prev => [...prev, newHistoryEntry]);
        setIsSessionActive(false);
        setCurrentStep(null);
      } else {
        toast({
          title: "Invalid Input",
          description: "Please enter 1 for Yes or 2 for No",
          variant: "destructive",
        });
      }
    }

    setUserInput("");
  };

  const getCurrentStepOptions = () => {
    if (!currentStep) return [];
    return options.filter(opt => opt.step_id === currentStep.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  };

  if (!selectedFlowId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Select a menu flow to preview and test</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Flow Preview & Test</h2>
          <p className="text-muted-foreground">Test your USSD menu flow in a simulated environment</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={startSession} disabled={isSessionActive || steps.length === 0}>
            <Play className="h-4 w-4 mr-2" />
            Start Test
          </Button>
          <Button variant="outline" onClick={resetSession} disabled={!isSessionActive && sessionHistory.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Phone Simulator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              USSD Simulator
            </CardTitle>
            <CardDescription>
              Simulated mobile phone interface for testing
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-lg min-h-[400px] flex flex-col">
              {/* Screen Header */}
              <div className="text-center border-b border-green-400 pb-2 mb-4">
                <div>USSD Session</div>
                <div className="text-xs">*150# - Test Mode</div>
              </div>
              
              {/* Current Screen */}
              {currentStep ? (
                <div className="flex-1">
                  <div className="mb-4">
                    <div className="text-xs text-green-300 mb-1">
                      Step: {currentStep.step_name}
                    </div>
                    <div className="whitespace-pre-wrap">{currentStep.menu_text}</div>
                  </div>
                  
                  {/* Show options for selection type */}
                  {currentStep.response_type === 'selection' && (
                    <div className="mb-4 space-y-1">
                      {getCurrentStepOptions().map((option) => (
                        <div key={option.id}>
                          {option.option_number}. {option.option_text}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Input area */}
                  <div className="mt-4 pt-2 border-t border-green-400">
                    <div className="flex items-center gap-2">
                      <span>{'>'}</span>
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-transparent border-none text-green-400 placeholder-green-600 p-0 h-auto focus-visible:ring-0"
                        placeholder={
                          currentStep.response_type === 'selection' ? 'Enter option number...' :
                          currentStep.response_type === 'confirmation' ? '1=Yes, 2=No' :
                          'Enter text...'
                        }
                        disabled={!isSessionActive}
                      />
                    </div>
                    
                    {isSessionActive && (
                      <div className="mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleUserInput}
                          disabled={!userInput.trim()}
                          className="text-green-400 border-green-400 hover:bg-green-400 hover:text-black"
                        >
                          Send
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : !isSessionActive && sessionHistory.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-green-600">
                  Press "Start Test" to begin USSD session
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-green-600">
                  Session ended
                </div>
              )}
              
              {/* Status bar */}
              <div className="text-xs text-green-600 pt-2 border-t border-green-400">
                {isSessionActive ? (
                  <div className="flex justify-between">
                    <span>Session Active</span>
                    <span>Timeout: {currentStep?.timeout_seconds}s</span>
                  </div>
                ) : (
                  <span>Session Idle</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>
              Track the flow navigation and user inputs
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {sessionHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No session history yet
                </div>
              ) : (
                sessionHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    
                    <div className="flex-1 space-y-1">
                      <div className="font-medium text-sm">
                        {entry.step.step_name}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {entry.step.menu_text.substring(0, 100)}
                        {entry.step.menu_text.length > 100 && '...'}
                      </div>
                      
                      {entry.input && (
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="h-3 w-3" />
                          <span className="font-mono bg-background px-2 py-1 rounded">
                            {entry.input}
                          </span>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {entry.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flow Overview */}
      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Flow Overview</CardTitle>
            <CardDescription>
              Visual representation of the menu flow structure
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`p-4 border rounded-lg ${
                    currentStep?.id === step.id ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={step.is_initial_step ? "default" : "outline"}>
                      Step {index + 1}
                    </Badge>
                    <span className="font-medium">{step.step_name}</span>
                    <Badge variant="secondary">{step.response_type}</Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {step.menu_text}
                  </div>
                  
                  {step.response_type === 'selection' && (
                    <div className="flex gap-2 flex-wrap">
                      {options
                        .filter(opt => opt.step_id === step.id)
                        .map(option => (
                          <Badge key={option.id} variant="outline" className="text-xs">
                            {option.option_number}. {option.option_text}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}