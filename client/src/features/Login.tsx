import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword(data);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Access Granted. Establishing connection...');
    } catch {
      toast.error('Unable to establish connection. Please try again.');
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
            <CardTitle className="text-2xl font-display uppercase tracking-tighter text-white">Access_Terminal</CardTitle>
            <p className="text-xs font-mono text-muted-foreground uppercase">IEEE FINANCE PRO // V3.0.0</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-mono uppercase text-accent">Email_Address</label>
                <input
                  id="email"
                  {...register('email')}
                  className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="admin@ieee.org"
                />
                {errors.email && <p className="text-destructive text-[10px] font-mono">{errors.email.message as string}</p>}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] font-mono uppercase text-accent">Security_Key</label>
                <input
                  id="password"
                  {...register('password')}
                  type="password"
                  className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-destructive text-[10px] font-mono">{errors.password.message as string}</p>}
              </div>
              <Button type="submit" className="w-full h-12 mt-6" variant="accent">
                Establish_Connection
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
