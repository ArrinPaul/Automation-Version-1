import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Shield, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';
import { toast } from 'sonner';
import axios from 'axios';

const ROLES = ['MANAGEMENT', 'FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'] as const;

const registerSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Minimum 6 characters'),
  name: z.string().min(2, 'Minimum 2 characters'),
  role: z.enum(ROLES),
  societyId: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface SocietyOption {
  id: string;
  name: string;
  shortName: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  societyId?: string | null;
  society?: { name?: string; shortName?: string } | null;
}

const ROLE_COLORS: Record<string, string> = {
  MANAGEMENT: 'bg-[hsl(75,100%,50%)]/20 text-[hsl(75,100%,50%)] border-[hsl(75,100%,50%)]/30',
  FACULTY_ADVISOR: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SOCIETY_OB: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  MEMBER: 'bg-white/10 text-white/60 border-white/20',
};

const UserManagementPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const societiesQuery = useQuery<SocietyOption[]>({
    queryKey: ['user-mgmt-societies'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/societies');
      return normalizeCollection<SocietyOption>(response.data);
    },
  });

  const usersQuery = useQuery<UserRecord[]>({
    queryKey: ['user-mgmt-users'],
    queryFn: async () => {
      // Re-use the check-initialized endpoint to detect DB connectivity, then get all societies users
      // Since there's no /api/users list endpoint, we derive user info from /api/auth/me for current user
      // and rely on the registration flow for provisioning
      return [];
    },
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'MEMBER' },
  });

  const selectedRole = form.watch('role');
  const needsSociety = ['FACULTY_ADVISOR', 'SOCIETY_OB', 'MEMBER'].includes(selectedRole);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        societyId: needsSociety && data.societyId ? data.societyId : null,
      });
      toast.success(`User ${data.name} provisioned successfully.`);
      form.reset();
      setShowForm(false);
      void usersQuery.refetch();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message = typeof error.response?.data?.error === 'string'
          ? error.response.data.error
          : error.message;
        toast.error(`Registration failed: ${message}`);
      } else {
        toast.error('Failed to provision user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const societies = societiesQuery.data ?? [];

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-4xl font-display uppercase tracking-tighter text-white">User_Management</h1>
          <p className="mt-3 text-muted-foreground font-mono text-sm">
            Provision system accounts and manage access roles.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-none font-mono text-xs uppercase tracking-[0.25em]"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Provision User'}
        </Button>
      </motion.div>

      {/* Provisioning Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="brutalist-surface rounded-none border-t-4 border-t-primary max-w-2xl">
            <CardHeader>
              <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-accent">
                Provision_New_User
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-accent">Full Name</label>
                    <input
                      {...form.register('name')}
                      className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="John Doe"
                    />
                    {form.formState.errors.name && (
                      <p className="text-destructive text-[10px] font-mono">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-accent">Email Address</label>
                    <input
                      {...form.register('email')}
                      type="email"
                      className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                      placeholder="user@ieee.org"
                    />
                    {form.formState.errors.email && (
                      <p className="text-destructive text-[10px] font-mono">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-accent">Temporary Password</label>
                  <input
                    {...form.register('password')}
                    type="password"
                    className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    placeholder="Min. 6 characters"
                  />
                  {form.formState.errors.password && (
                    <p className="text-destructive text-[10px] font-mono">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase text-accent">Role</label>
                    <select
                      {...form.register('role')}
                      className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="bg-black">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {needsSociety && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase text-accent">Society</label>
                      <select
                        {...form.register('societyId')}
                        className="w-full bg-white/5 border border-white/10 p-3 text-white font-mono text-sm focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="" className="bg-black">Select Society</option>
                        {societies.map((s) => (
                          <option key={s.id} value={s.id} className="bg-black">
                            {s.shortName} — {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-none font-mono text-xs uppercase tracking-[0.25em]"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Credential Tips */}
      <Card className="brutalist-surface rounded-none max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-sm uppercase tracking-[0.25em] text-accent">
            <Shield className="w-4 h-4" />Credential_Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 border border-white/10 bg-white/5 p-4">
            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="space-y-2 font-mono text-sm text-muted-foreground leading-relaxed">
              <p>
                Management users should be provisioned using institutional addresses tied to society ownership.
              </p>
              <p>
                Use the convention <span className="text-white">{'{societyid}@ieee.org'}</span> for branch-scoped access,
                and reserve role-level aliases for leadership logins.
              </p>
              <p>
                Example: a society with key <span className="text-white">cs</span> should use{' '}
                <span className="text-white">cs@ieee.org</span> for the branch account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <div key={role} className="border border-white/10 bg-white/5 p-3">
                <Badge className={`rounded-none border text-[10px] w-full justify-center ${ROLE_COLORS[role]}`}>
                  {role}
                </Badge>
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  {role === 'MANAGEMENT' && 'Full system access'}
                  {role === 'FACULTY_ADVISOR' && 'Society + reports'}
                  {role === 'SOCIETY_OB' && 'Own society ops'}
                  {role === 'MEMBER' && 'View only'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
