import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DUMMY_CREDENTIALS, UserRole, getRoleDisplayName, getRoleColor } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Loader2,
  Sun,
  Moon,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const roleIcons: Record<UserRole, React.ElementType> = {
  admin: Shield,
  tutor: Users,
  faculty: BookOpen,
  student: GraduationCap,
};

const roleDescriptions: Record<UserRole, string> = {
  admin: 'HOD & Department Management',
  tutor: 'Class In-Charge & Mentoring',
  faculty: 'Subject Teaching & Assessment',
  student: 'Academic & Personal Growth',
};

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(DUMMY_CREDENTIALS[role].email);
    setPassword(DUMMY_CREDENTIALS[role].password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-pattern">
      {/* Left Panel - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <GraduationCap className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Your Institution</h2>
                <p className="text-white/80 text-sm">Academic Management System</p>
              </div>
            </motion.div>
          </div>

          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold mb-6 leading-tight"
            >
              Academic
              <br />
              Management
              <br />
              System
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-white/90 max-w-md"
            >
              Manage your academic institution efficiently 
              with our comprehensive management system.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 backdrop-blur-sm"
                  style={{ backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=user${i})`, backgroundSize: 'cover' }}
                />
              ))}
            </div>
            <p className="text-white/80">
              <span className="font-semibold text-white">Active Users</span>
            </p>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm"
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-40 right-40 w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-sm"
        />
        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm"
        />
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
        {/* Theme Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6"
        >
          <Button
            variant="glass"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="p-3 bg-gradient-primary rounded-2xl">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Your Institution</h2>
              <p className="text-muted-foreground text-sm">Academic Management System</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Select your role to continue</p>
          </div>

          {/* Role Selection Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {(Object.keys(DUMMY_CREDENTIALS) as UserRole[]).map((role, index) => {
              const Icon = roleIcons[role];
              const isSelected = selectedRole === role;
              
              return (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleRoleSelect(role)}
                  className={`relative p-4 rounded-2xl text-left transition-all duration-300 group overflow-hidden ${
                    isSelected 
                      ? `bg-gradient-to-br ${getRoleColor(role)} text-white shadow-lg scale-[1.02]`
                      : 'glass-card hover:scale-[1.02] hover:shadow-lg'
                  }`}
                >
                  {isSelected && (
                    <motion.div 
                      layoutId="selected"
                      className="absolute inset-0 bg-white/10"
                    />
                  )}
                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-white/20' : 'bg-primary/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <p className={`font-semibold capitalize ${isSelected ? 'text-white' : 'text-foreground'}`}>
                      {role}
                    </p>
                    <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {roleDescriptions[role]}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center"
                    >
                      <Sparkles className="w-3 h-3 text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: selectedRole ? 1 : 0.5 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!selectedRole || isLoading}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!selectedRole || isLoading}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="xl"
              className="w-full"
              disabled={!selectedRole || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Demo Credentials Notice */}
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 rounded-xl bg-info/10 border border-info/20"
            >
              <p className="text-sm text-center">
                <span className="font-medium text-info">System Access:</span>{' '}
                <span className="text-muted-foreground">
                  Credentials auto-filled for {getRoleDisplayName(selectedRole)}
                </span>
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
