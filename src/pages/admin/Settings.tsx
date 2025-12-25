import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, Shield, Database, 
  Calendar, Lock, Globe, Palette, Type, Languages, Monitor, Moon, Sun,
  Save, RefreshCw, Download, Upload, AlertTriangle, Check, Key, Smartphone, LogOut, Laptop, MapPin, Clock, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Settings() {
  const [settings, setSettings] = useState({
    // General
    departmentName: 'Computer Science and Engineering',
    collegeName: 'Tamil Nadu Engineering College',
    academicYear: '2024-2025',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notifyOnMarksApproval: true,
    notifyOnLeaveRequest: true,
    notifyOnCircular: true,
    
    // Academic
    iaMarksDeadline: 7,
    assignmentGracePeriod: 2,
    minAttendanceRequired: 75,
    
    // Security
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    twoFactorAuth: false,

    // General Preferences
    theme: 'dark', // light, dark, high-contrast
    fontSize: 'medium', // small, medium, large
    language: 'english', // english, tamil, hindi

    // Extended Security
    twoFactorMethod: 'email', // email, sms, app
    securityQuestionsSet: true,
  });
  
  const [activeTab, setActiveTab] = useState('general');

  const navItems = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'academic', label: 'Academic', icon: Calendar },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure department portal settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Config
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
            <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                    <Button
                        key={item.id}
                        variant={activeTab === item.id ? "secondary" : "ghost"}
                        className={cn(
                            "justify-start gap-3 h-10 font-medium",
                            activeTab === item.id ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Button>
                ))}
            </div>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 lg:col-span-4 space-y-6">
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
            >
                {/* General Settings */}
                {activeTab === 'general' && (
                  <div className="grid gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-primary" />
                          Appearance & Accessibility
                        </CardTitle>
                        <CardDescription>Customize your visual experience</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Theme Selection */}
                        <div className="space-y-3">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <Monitor className="w-4 h-4" /> Theme
                          </Label>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { id: 'light', label: 'Light', icon: Sun, bg: 'bg-white text-black' },
                              { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-slate-950 text-white' },
                              { id: 'contrast', label: 'High Contrast', icon: Monitor, bg: 'bg-black text-white border-2 border-yellow-400' }
                            ].map((theme) => (
                              <div 
                                key={theme.id}
                                onClick={() => setSettings({ ...settings, theme: theme.id })}
                                className={cn(
                                  "cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all",
                                  settings.theme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100",
                                  theme.bg
                                )}
                              >
                                {settings.theme === theme.id && <div className="absolute top-2 right-2 text-primary"><Check className="w-3 h-3" /></div>}
                                <theme.icon className="w-6 h-6" />
                                <span className="text-sm font-bold">{theme.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-white/5" />

                        {/* Font Size Selection */}
                        <div className="space-y-3">
                           <Label className="text-base font-semibold flex items-center gap-2">
                            <Type className="w-4 h-4" /> Font Size
                          </Label>
                           <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg w-max">
                              {['small', 'medium', 'large'].map((size) => (
                                <Button
                                  key={size}
                                  variant="ghost"
                                  onClick={() => setSettings({ ...settings, fontSize: size })}
                                  className={cn(
                                    "capitalize px-6",
                                    settings.fontSize === size ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground"
                                  )}
                                >
                                  {size}
                                </Button>
                              ))}
                           </div>
                        </div>

                         <Separator className="bg-white/5" />

                        {/* Language Selection */}
                         <div className="space-y-3">
                           <Label className="text-base font-semibold flex items-center gap-2">
                            <Languages className="w-4 h-4" /> Language
                          </Label>
                           <Select 
                              value={settings.language} 
                              onValueChange={(value) => setSettings({ ...settings, language: value })}
                            >
                              <SelectTrigger className="w-full md:w-[280px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="english">English (US)</SelectItem>
                                <SelectItem value="tamil">Tamil (தமிழ்)</SelectItem>
                                <SelectItem value="hindi">Hindi (हिंदी)</SelectItem>
                                <SelectItem value="kannada">Kannada (ಕನ್ನಡ)</SelectItem>
                                <SelectItem value="telugu">Telugu (తెలుగు)</SelectItem>
                              </SelectContent>
                            </Select>
                        </div>

                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Academic Settings */}
                {activeTab === 'academic' && (
                  <div className="grid gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SettingsIcon className="w-5 h-5 text-primary" />
                          Academic Rules
                        </CardTitle>
                        <CardDescription>Configure academic policies</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>IA Marks Entry Deadline (days after exam)</Label>
                            <Input 
                              type="number"
                              value={settings.iaMarksDeadline}
                              onChange={(e) => setSettings({ ...settings, iaMarksDeadline: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Assignment Grace Period (days)</Label>
                            <Input 
                              type="number"
                              value={settings.assignmentGracePeriod}
                              onChange={(e) => setSettings({ ...settings, assignmentGracePeriod: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Min Attendance Required (%)</Label>
                            <Input 
                              type="number"
                              value={settings.minAttendanceRequired}
                              onChange={(e) => setSettings({ ...settings, minAttendanceRequired: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="grid gap-6">
                    {/* Account Security */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5 text-primary" />
                          Login Credentials
                        </CardTitle>
                        <CardDescription>Manage your password and recovery options</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                          <div>
                            <p className="font-medium">Password</p>
                            <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                          </div>
                          <Button variant="outline" size="sm">Change Password</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                          <div>
                            <p className="font-medium">Security Questions</p>
                            <p className="text-sm text-muted-foreground">Used for account recovery</p>
                          </div>
                          <Button variant="outline" size="sm">Reset Questions</Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2FA Settings */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-primary" />
                          Two-Factor Authentication
                        </CardTitle>
                        <CardDescription>Add an extra layer of security to your account</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                                <p className="font-medium">Enable 2FA</p>
                                <p className="text-sm text-muted-foreground">Require a code when logging in</p>
                            </div>
                            <Switch 
                                checked={settings.twoFactorAuth}
                                onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                            />
                        </div>

                        {settings.twoFactorAuth && (
                            <div className="space-y-3 pl-4 border-l-2 border-white/10 ml-2">
                                <Label className="text-sm font-semibold">Preferred Method</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'email', label: 'Email', icon: Mail },
                                        { id: 'sms', label: 'SMS', icon: Smartphone },
                                        { id: 'app', label: 'Authenticator App', icon: Shield }
                                    ].map((method) => (
                                        <div 
                                            key={method.id}
                                            onClick={() => setSettings({ ...settings, twoFactorMethod: method.id })}
                                            className={cn(
                                                "cursor-pointer p-3 rounded-lg border flex items-center gap-3 transition-colors",
                                                settings.twoFactorMethod === method.id 
                                                    ? "bg-primary/10 border-primary text-primary" 
                                                    : "bg-transparent border-white/10 hover:bg-white/5"
                                            )}
                                        >
                                            {/* Note: Icons need to be imported if used here. Using generic placeholders for now if imports missing, but Shield/Smartphone are there. Mail needs import. */}
                                            {/* Using existing imports: Shield, Smartphone. Adding Mail import might be needed or swap icon. */}
                                            {/* Let's double check imports first. 'Mail' was removed in previous step? Checking... Yes 'Mail' was in original list but I might have removed it or it's there. 
                                                Checking Step 1014 view: Mail was REMOVED. I need to re-add Mail or use another icon. 
                                                Using 'Mail' in the icon map below but I need to make sure it's imported.
                                                Safest to use 'Mail' and ensure it's in the top import list. I added it in chunk 1? No.
                                                Wait, I will add 'Mail' to the import list in chunk 1 just in case.
                                             */}
                                            {method.id === 'email' && <SettingsIcon className="w-4 h-4" />} 
                                            {method.id === 'sms' && <Smartphone className="w-4 h-4" />}
                                            {method.id === 'app' && <Shield className="w-4 h-4" />}
                                            <span className="text-sm font-medium">{method.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Session Management */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Laptop className="w-5 h-5 text-primary" />
                          Session Management
                        </CardTitle>
                        <CardDescription>View and manage active sessions</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-4">
                            {[
                                { device: 'Chrome on Windows', location: 'Chennai, India', time: 'Active now', current: true },
                                { device: 'Safari on iPhone', location: 'Chennai, India', time: '2 hours ago', current: false },
                            ].map((session, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-white/10">
                                            {session.device.includes('iPhone') ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{session.device}</p>
                                                {session.current && <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 hover:bg-green-500/20">Current</Badge>}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.location}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!session.current && (
                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                            <LogOut className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Separator className="my-2 bg-white/5" />
                        <Button variant="destructive" className="w-full">
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out All Other Devices
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Advanced Security (Existing) */}
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-primary" />
                          Advanced Security Policies
                        </CardTitle>
                        <CardDescription>Configure system-wide security rules</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Session Timeout (minutes)</Label>
                            <Input 
                              type="number"
                              value={settings.sessionTimeout}
                              onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Login Attempts</Label>
                            <Input 
                              type="number"
                              value={settings.maxLoginAttempts}
                              onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Password Expiry (days)</Label>
                            <Input 
                              type="number"
                              value={settings.passwordExpiry}
                              onChange={(e) => setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Data Management */}
                {activeTab === 'data' && (
                  <div className="grid gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-primary" />
                          Data Management
                        </CardTitle>
                        <CardDescription>Backup, export, and manage data</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Download className="w-5 h-5 text-primary" />
                              <h4 className="font-medium">Export Data</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Download all department data as CSV/Excel</p>
                            <Button variant="outline" size="sm" className="mt-3">Export Now</Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Upload className="w-5 h-5 text-primary" />
                              <h4 className="font-medium">Import Data</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Bulk import students, faculty, or marks</p>
                            <Button variant="outline" size="sm" className="mt-3">Import</Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <RefreshCw className="w-5 h-5 text-primary" />
                              <h4 className="font-medium">Create Backup</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Create a full system backup</p>
                            <Button variant="outline" size="sm" className="mt-3">Backup Now</Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                              <h4 className="font-medium text-red-400">Clear Cache</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">Clear all cached data (use with caution)</p>
                            <Button variant="destructive" size="sm" className="mt-3">Clear Cache</Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
            </motion.div>
        </div>
      </div>
    </div>
  );
}
