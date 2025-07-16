import { useState } from "react";
import { ArrowLeft, Save, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface AgentRegistrationProps {
  onBack: () => void;
}

export function AgentRegistration({ onBack }: AgentRegistrationProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    agentName: "",
    phoneNumber: "",
    region: "",
    supervisor: "",
    initialTopup: "",
    autoKYC: true,
    services: {
      airtime: false,
      internet: false,
      bills: false,
      snel: false,
      regideso: false,
      merchant: false
    },
    rates: {
      airtime: "",
      internet: "",
      bills: "",
      snel: "",
      regideso: "",
      merchant: ""
    }
  });

  const regions = ["Goma", "Bukavu", "Kinshasa", "Lubumbashi", "Matadi"];
  const supervisors = ["John Mukendi", "Marie Ngozi", "Paul Kabila", "Grace Mwanza"];

  const handleServiceChange = (service: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: checked
      }
    }));
  };

  const handleRateChange = (service: string, rate: string) => {
    setFormData(prev => ({
      ...prev,
      rates: {
        ...prev.rates,
        [service]: rate
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.agentName || !formData.phoneNumber || !formData.region || !formData.supervisor) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Generate Agent ID
    const agentId = `AGT_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    toast({
      title: "Agent Registered Successfully",
      description: `Agent ID: ${agentId} has been created`,
    });

    // Reset form or navigate
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Register New Agent</h1>
          <p className="text-muted-foreground">Create a new agent profile with services and permissions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Enter the agent's personal and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name *</Label>
                <Input
                  id="agentName"
                  value={formData.agentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                  placeholder="Enter agent full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+243 xxx xxx xxx"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region *</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supervisor">Assigned Supervisor *</Label>
                <Select value={formData.supervisor} onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map(supervisor => (
                      <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Services & Permissions</CardTitle>
            <CardDescription>
              Select which services this agent can offer to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {Object.entries({
                airtime: "Airtime Top-up",
                internet: "Internet Bundles",
                bills: "Bill Payments",
                snel: "SNEL Tokens",
                regideso: "REGIDESO",
                merchant: "Merchant Registration"
              }).map(([key, label]) => (
                <div key={key} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={formData.services[key as keyof typeof formData.services]}
                      onCheckedChange={(checked) => handleServiceChange(key, checked as boolean)}
                    />
                    <Label htmlFor={key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {label}
                    </Label>
                  </div>
                  
                  {formData.services[key as keyof typeof formData.services] && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor={`${key}-rate`} className="text-sm text-muted-foreground">
                        Commission Rate (%)
                      </Label>
                      <Input
                        id={`${key}-rate`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.rates[key as keyof typeof formData.rates]}
                        onChange={(e) => handleRateChange(key, e.target.value)}
                        placeholder="e.g., 2.5"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wallet & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Wallet & Settings</CardTitle>
            <CardDescription>
              Configure initial wallet balance and verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialTopup">Initial Wallet Top-up (USD)</Label>
                <Input
                  id="initialTopup"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.initialTopup}
                  onChange={(e) => setFormData(prev => ({ ...prev, initialTopup: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoKYC">Auto-KYC Verification</Label>
                  <Switch
                    id="autoKYC"
                    checked={formData.autoKYC}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoKYC: checked }))}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically verify agent KYC status
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Register Agent
          </Button>
        </div>
      </form>
    </div>
  );
}