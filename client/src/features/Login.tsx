import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/services/apiClient';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  setupKey: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SetupFormValues = z.infer<typeof setupSchema>;

const Login: React.FC = () => {
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [checkingInit, setCheckingInit] = useState(true);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const setupForm = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
  });

  // On mount, check if system is initialized
  useEffect(() => {
    const checkInitialization = async () => {
      try {
        console.info('Checking system initialization status...');
        const { data } = await apiClient.get('/auth/check-initialized');
        console.info('Initialization check result:', data);

        if (data.initialized === false) {
          console.info('System not initialized, switching to setup mode');
          setSetupRequired(true);
          setIsSetupMode(true);
        } else {
          console.info('System already initialized, showing login form');
          setIsSetupMode(false);
        }
      } catch (error) {
        console.error('Failed to check initialization:', error);
        // Default to login mode if check fails
        setIsSetupMode(false);
      } finally {
        setCheckingInit(false);
      }
    };

    checkInitialization();
  }, []);

  if (checkingInit) {
    return (
      <div className="min-h-screen technical-grid flex items-center justify-center p-4">
        <div className="font-mono text-accent animate-pulse">CHECKING_SYSTEM_STATUS...</div>
      </div>
    );
  }

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      console.info('Login attempted', {
        email: data.email,
        endpoint: '/auth/login',
        baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
      });

      const { data: loginResponse } = await apiClient.post('/auth/login', data);

      if (!loginResponse?.session?.access_token || !loginResponse?.session?.refresh_token) {
        console.error('Login response missing session payload', loginResponse);
        toast.error('Login failed: backend did not return a valid session.');
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: loginResponse.session.access_token,
        refresh_token: loginResponse.session.refresh_token,
      });

      if (error) {
        console.error('Supabase session sync failed', error);
        toast.error(error.message);
        return;
      }

      toast.success('Access Granted. Establishing connection...');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : error.message;

        console.error('Login API error', {
          message,
          status,
          data: error.response?.data,
        });

        if (status === 404 && message.includes('User profile not found')) {
          console.info('User does not exist. Setup mode required.');
          setSetupRequired(true);
          setIsSetupMode(true);
          toast.info('No user found. Please initialize the system with a setup key.');
          return;
        }

        toast.error(`Login failed: ${message}`);
        return;
      }

      console.error('Login unexpected error', error);
      toast.error('Unable to establish connection. Please try again.');
    }
  };

  const onSetupSubmit = async (data: SetupFormValues) => {
    try {
      console.info('Setup attempted', {
        email: data.email,
        name: data.name,
        endpoint: '/auth/setup',
        hasSetupKey: !!data.setupKey,
        baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api',
      });

      const { data: setupResponse } = await apiClient.post('/auth/setup', {
        email: data.email,
        password: data.password,
        name: data.name,
        setupKey: data.setupKey,
      });

      if (!setupResponse?.session?.access_token || !setupResponse?.session?.refresh_token) {
        console.error('Setup response missing session payload', setupResponse);
        toast.error('Setup failed: backend did not return a valid session.');
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: setupResponse.session.access_token,
        refresh_token: setupResponse.session.refresh_token,
      });

      if (error) {
        console.error('Supabase session sync failed during setup', error);
        toast.error(error.message);
        return;
      }

      toast.success('System initialized. Access Granted. Establishing connection...');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = typeof error.response?.data?.message === 'string'
          ? error.response.data.message
          : error.message;

        console.error('Setup API error', {
          message,
          status,
          data: error.response?.data,
        });

        if (status === 401) {
          toast.error('Invalid setup key. Please check your security key and try again.');
          return;
        }

        if (status === 403) {
          toast.error('System is already initialized. Switch to login mode.');
          setIsSetupMode(false);
          setSetupRequired(false);
          return;
        }

        toast.error(`Setup failed: ${message}`);
        return;
      }

      console.error('Setup unexpected error', error);
      toast.error('Setup failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen technical-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="w-full max-w-md bg-black/60 border-white/10 backdrop-blur-xl rounded-none border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-display uppercase tracking-tighter text-white">
              {isSetupMode ? 'System_Initialize' : 'Access_Terminal'}
            </CardTitle>
            <p className="text-xs font-mono text-muted-foreground uppercase">IEEE FINANCE PRO // V3.0.0</p>
            {setupRequired && !isSetupMode && (
              <p className="text-xs font-mono text-accent mt-2">System setup required</p>
            )}
          </CardHeader>
          <CardContent>
            {isSetupMode ? (
              <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="setup-name" className="text-[10px] font-mono uppercase text-accent">Name</label>
                  <input
                    id="setup-name"
                    {...setupForm.register('name')}
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Admin Name"
                  />
                  {setupForm.formState.errors.name && (
                    <p className="text-destructive text-[10px] font-mono">{setupForm.formState.errors.name.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-email" className="text-[10px] font-mono uppercase text-accent">Email_Address</label>
                  <input
                    id="setup-email"
                    {...setupForm.register('email')}
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="admin@ieee.org"
                  />
                  {setupForm.formState.errors.email && (
                    <p className="text-destructive text-[10px] font-mono">{setupForm.formState.errors.email.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-password" className="text-[10px] font-mono uppercase text-accent">Password</label>
                  <input
                    id="setup-password"
                    {...setupForm.register('password')}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                  {setupForm.formState.errors.password && (
                    <p className="text-destructive text-[10px] font-mono">{setupForm.formState.errors.password.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="setup-key" className="text-[10px] font-mono uppercase text-accent">Setup_Key</label>
                  <input
                    id="setup-key"
                    {...setupForm.register('setupKey')}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••••••••••"
                  />
                  {setupForm.formState.errors.setupKey && (
                    <p className="text-destructive text-[10px] font-mono">{setupForm.formState.errors.setupKey.message as string}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 mt-6" variant="accent">
                  Initialize_System
                </Button>
                <button
                  type="button"
                  onClick={() => setIsSetupMode(false)}
                  className="w-full h-10 mt-2 border border-white/20 text-white/60 font-mono text-xs uppercase hover:border-white/40 hover:text-white/80 transition-colors"
                >
                  Back_to_Login
                </button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-mono uppercase text-accent">Email_Address</label>
                  <input
                    id="email"
                    {...loginForm.register('email')}
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="admin@ieee.org"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-destructive text-[10px] font-mono">{loginForm.formState.errors.email.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-[10px] font-mono uppercase text-accent">Security_Key</label>
                  <input
                    id="password"
                    {...loginForm.register('password')}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-destructive text-[10px] font-mono">{loginForm.formState.errors.password.message as string}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 mt-6" variant="accent">
                  Establish_Connection
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
