'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Shield, Settings, CheckCircle2, AlertCircle, 
  Trash2, Edit, Play, Save, Check, RefreshCw, Eye, EyeOff, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/services/api';

interface Gateway {
  id?: string;
  gatewayName: string;
  provider: string;
  environment: 'TEST' | 'LIVE';
  testKeyId: string;
  testSecretKey?: string;
  liveKeyId: string;
  liveSecretKey?: string;
  webhookSecret?: string;
  currency: string;
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  description: string;
  receiptPrefix: string;
  themeColor: string;
  isDefault: boolean;
  isActive: boolean;
  features?: {
    refundsEnabled?: boolean;
    partialPaymentsEnabled?: boolean;
    webhooksEnabled?: boolean;
    autoCaptureEnabled?: boolean;
    sandboxEnabled?: boolean;
    signatureVerificationEnabled?: boolean;
  };
}

export default function PaymentGatewaySettings() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [formData, setFormData] = useState<Gateway>({
    gatewayName: 'Razorpay',
    provider: 'Razorpay',
    environment: 'TEST',
    testKeyId: '',
    testSecretKey: '',
    liveKeyId: '',
    liveSecretKey: '',
    webhookSecret: '',
    currency: 'INR',
    companyName: 'JUZDOG',
    supportEmail: '',
    supportPhone: '',
    description: 'Dynamic Razorpay integration',
    receiptPrefix: 'JD-',
    themeColor: '#3B82F6',
    isDefault: true,
    isActive: true,
    features: {
      refundsEnabled: true,
      partialPaymentsEnabled: false,
      webhooksEnabled: true,
      autoCaptureEnabled: true,
      sandboxEnabled: true,
      signatureVerificationEnabled: true
    }
  });

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payment-gateways');
      if (res.success) {
        setGateways(res.data || []);
      }
    } catch (e) {
      toast.error('Failed to load gateways');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gateway: Gateway) => {
    setEditingId(gateway.id || null);
    setFormData({
      ...gateway,
      testSecretKey: gateway.testSecretKey || '',
      liveSecretKey: gateway.liveSecretKey || '',
      webhookSecret: gateway.webhookSecret || '',
      features: {
        refundsEnabled: true,
        partialPaymentsEnabled: false,
        webhooksEnabled: true,
        autoCaptureEnabled: true,
        sandboxEnabled: true,
        signatureVerificationEnabled: true,
        ...(gateway.features as any)
      }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      gatewayName: 'Razorpay',
      provider: 'Razorpay',
      environment: 'TEST',
      testKeyId: '',
      testSecretKey: '',
      liveKeyId: '',
      liveSecretKey: '',
      webhookSecret: '',
      currency: 'INR',
      companyName: 'JUZDOG',
      supportEmail: '',
      supportPhone: '',
      description: 'Dynamic Razorpay integration',
      receiptPrefix: 'JD-',
      themeColor: '#3B82F6',
      isDefault: false,
      isActive: true,
      features: {
        refundsEnabled: true,
        partialPaymentsEnabled: false,
        webhooksEnabled: true,
        autoCaptureEnabled: true,
        sandboxEnabled: true,
        signatureVerificationEnabled: true
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        // Update Gateway
        const res = await api.put(`/payment-gateways/${editingId}`, formData);
        if (res.success) {
          toast.success('Gateway updated successfully');
          setEditingId(null);
          fetchGateways();
        } else {
          toast.error(res.message || 'Failed to update gateway');
        }
      } else {
        // Create Gateway
        const res = await api.post('/payment-gateways', formData);
        if (res.success) {
          toast.success('Gateway created successfully');
          fetchGateways();
          resetForm();
        } else {
          toast.error(res.message || 'Failed to create gateway');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;
    try {
      const res = await api.delete(`/payment-gateways/${id}`);
      if (res.success) {
        toast.success('Gateway deleted successfully');
        fetchGateways();
      } else {
        toast.error(res.message || 'Failed to delete gateway');
      }
    } catch (e) {
      toast.error('Deletion error');
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.post(`/payment-gateways/${id}/test-connection`, {});
      if (res.success) {
        toast.success('✓ Connection Successful');
      } else {
        toast.error('✗ Invalid Credentials / Connection Failed');
      }
    } catch (e) {
      toast.error('Connection test failed');
    } finally {
      setTestingId(null);
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Key ID copied to clipboard');
  };

  return (
    <div className="p-4 md:p-8 space-y-8 bg-background text-muted-foreground min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary animate-pulse" /> Payment Gateway Management
          </h1>
          <p className="text-muted-foreground">Configure Razorpay credentials, switch environments, and manage dynamic billing settings securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle Columns: Configured Gateways and Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Form */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
              <Settings className="w-5 h-5 text-primary" /> {editingId ? 'Edit Payment Gateway' : 'Add New Payment Gateway'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Gateway Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.gatewayName} 
                    onChange={e => setFormData({ ...formData, gatewayName: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                    placeholder="e.g. Razorpay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Gateway Provider</label>
                  <select 
                    value={formData.provider} 
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                  >
                    <option value="Razorpay">Razorpay</option>
                    <option value="Stripe">Stripe</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Environment</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input 
                        type="radio" 
                        name="environment" 
                        value="TEST"
                        checked={formData.environment === 'TEST'}
                        onChange={() => setFormData({ ...formData, environment: 'TEST' })}
                        className="w-4 h-4 text-primary"
                      /> Test Mode
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-foreground font-semibold">
                      <input 
                        type="radio" 
                        name="environment" 
                        value="LIVE"
                        checked={formData.environment === 'LIVE'}
                        onChange={() => setFormData({ ...formData, environment: 'LIVE' })}
                        className="w-4 h-4 text-primary"
                      /> Live Mode
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Currency</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.currency} 
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                    placeholder="INR"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-1">Receipt Prefix</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.receiptPrefix} 
                    onChange={e => setFormData({ ...formData, receiptPrefix: e.target.value })}
                    className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                    placeholder="JD-"
                  />
                </div>
              </div>

              {/* Secret Settings Panel */}
              <div className="bg-muted/30 border border-border rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" /> Gateway Secret Credentials</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Test Key ID</label>
                    <input 
                      type="text" 
                      value={formData.testKeyId} 
                      onChange={e => setFormData({ ...formData, testKeyId: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Test Secret Key</label>
                    <div className="relative">
                      <input 
                        type={showSecrets.testSecretKey ? 'text' : 'password'} 
                        value={formData.testSecretKey} 
                        onChange={e => setFormData({ ...formData, testSecretKey: e.target.value })}
                        className="w-full bg-input border border-border rounded-lg pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                      <button 
                        type="button" 
                        onClick={() => toggleSecretVisibility('testSecretKey')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.testSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Live Key ID</label>
                    <input 
                      type="text" 
                      value={formData.liveKeyId} 
                      onChange={e => setFormData({ ...formData, liveKeyId: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1">Live Secret Key</label>
                    <div className="relative">
                      <input 
                        type={showSecrets.liveSecretKey ? 'text' : 'password'} 
                        value={formData.liveSecretKey} 
                        onChange={e => setFormData({ ...formData, liveSecretKey: e.target.value })}
                        className="w-full bg-input border border-border rounded-lg pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      />
                      <button 
                        type="button" 
                        onClick={() => toggleSecretVisibility('liveSecretKey')} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets.liveSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Webhook Secret</label>
                  <div className="relative">
                    <input 
                      type={showSecrets.webhookSecret ? 'text' : 'password'} 
                      value={formData.webhookSecret} 
                      onChange={e => setFormData({ ...formData, webhookSecret: e.target.value })}
                      className="w-full bg-input border border-border rounded-lg pl-3 pr-10 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <button 
                      type="button" 
                      onClick={() => toggleSecretVisibility('webhookSecret')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showSecrets.webhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Features Flags */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-sm">Gateways Toggle Flags</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg bg-card">
                    <input 
                      type="checkbox" 
                      checked={formData.features?.refundsEnabled}
                      onChange={e => setFormData({ 
                        ...formData, 
                        features: { ...formData.features, refundsEnabled: e.target.checked } 
                      })}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span className="text-xs text-foreground font-semibold">Enable Refunds</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg bg-card">
                    <input 
                      type="checkbox" 
                      checked={formData.features?.webhooksEnabled}
                      onChange={e => setFormData({ 
                        ...formData, 
                        features: { ...formData.features, webhooksEnabled: e.target.checked } 
                      })}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span className="text-xs text-foreground font-semibold">Enable Webhooks</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-border rounded-lg bg-card">
                    <input 
                      type="checkbox" 
                      checked={formData.features?.autoCaptureEnabled}
                      onChange={e => setFormData({ 
                        ...formData, 
                        features: { ...formData.features, autoCaptureEnabled: e.target.checked } 
                      })}
                      className="w-4 h-4 rounded text-primary"
                    />
                    <span className="text-xs text-foreground font-semibold">Auto Capture</span>
                  </label>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isDefault}
                    onChange={e => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm text-foreground font-bold">Set as Default Gateway</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span className="text-sm text-foreground font-bold">Active Status</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                {editingId && (
                  <Button type="button" variant="ghost" onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submitting} className="bg-primary hover:opacity-95 text-primary-foreground font-bold flex items-center gap-2 px-6 py-3">
                  <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Gateway Table / Overview List */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-5 h-5 text-primary" /> Gateway Providers
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 bg-muted/30 animate-pulse rounded-xl" />
                ))}
              </div>
            ) : gateways.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">No gateways configured yet.</p>
            ) : (
              <div className="space-y-3">
                {gateways.map(g => (
                  <div 
                    key={g.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${g.isDefault ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-sm">{g.gatewayName}</h4>
                          {g.isDefault && <span className="bg-primary/20 text-primary border border-primary/20 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Default</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{g.provider} • {g.environment} Environment</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-full ${g.isActive ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
                        <span className="text-[10px] uppercase font-bold text-foreground">{g.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 bg-muted/20 p-2 rounded-lg border border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Key ID:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-foreground text-[10px] truncate max-w-[120px]">{g.environment === 'LIVE' ? g.liveKeyId : g.testKeyId}</span>
                          <button 
                            onClick={() => handleCopy(g.environment === 'LIVE' ? g.liveKeyId : g.testKeyId)}
                            className="p-1 hover:bg-foreground/10 rounded text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between gap-2 pt-2 border-t border-border/50">
                      <Button 
                        size="xs" 
                        variant="outline" 
                        onClick={() => handleTestConnection(g.id!)}
                        disabled={testingId === g.id}
                        className="text-xs font-bold border-border text-foreground hover:bg-accent flex items-center gap-1 px-2.5 py-1"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingId === g.id ? 'animate-spin' : ''}`} /> Test
                      </Button>

                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => handleEdit(g)}
                          className="p-1.5 hover:bg-primary/20 rounded-lg text-primary hover:text-primary transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {!g.isDefault && (
                          <button 
                            onClick={() => handleDelete(g.id!)}
                            className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-500 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
