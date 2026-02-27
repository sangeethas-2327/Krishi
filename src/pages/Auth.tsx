import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const roles: { value: UserRole; label: string; icon: string }[] = [
  { value: 'farmer', label: 'Farmer', icon: '👨‍🌾' },
  { value: 'gardener', label: 'Gardener', icon: '🌸' },
  { value: 'student', label: 'Student', icon: '📚' },
  { value: 'expert', label: 'Expert', icon: '🔬' },
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [submitting, setSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignup) {
        const { error } = await signup(email, password, name, role);
        if (error) {
          toast({ title: 'Signup Error', description: error, variant: 'destructive' });
        } else {
          toast({ title: 'Account Created!', description: 'Please check your email to verify your account.' });
        }
      } else {
        const { error } = await login(email, password);
        if (error) {
          toast({ title: 'Login Error', description: error, variant: 'destructive' });
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-primary-foreground max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Leaf className="w-10 h-10" />
            <span className="font-heading font-bold text-3xl">KrishiSetu</span>
          </div>
          <h2 className="font-heading font-bold text-3xl mb-4">
            Smart Agriculture for India's Future
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            AI-powered crop disease detection, market intelligence, government scheme matching, and expert advisory — all in 11 Indian languages.
          </p>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="font-heading font-bold text-xl">KrishiSetu</span>
          </div>

          <h1 className="font-heading font-bold text-2xl mb-1">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {isSignup ? 'Join thousands of Indian farmers, gardeners & researchers' : 'Sign in to your KrishiSetu account'}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">email & password</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-10" required />
                  </div>
                </div>
                <div>
                  <Label>Select Role</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                          role === r.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                        }`}
                      >
                        <span className="text-lg">{r.icon}</span>
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" required minLength={6} />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full h-11 gradient-primary text-primary-foreground font-semibold">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isSignup ? 'Create Account' : 'Sign In'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary font-medium hover:underline">
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
