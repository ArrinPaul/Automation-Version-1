import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const UserManagementPage: React.FC = () => {
  return (
    <div className="p-8 technical-grid min-h-screen space-y-6">
      <h1 className="text-4xl font-display uppercase tracking-tighter text-white">User_Management</h1>
      <p className="mt-3 text-muted-foreground font-mono text-sm">
        Credential control route is active. Role management and invitation workflows will be added next.
      </p>

      <Card className="brutalist-surface rounded-none max-w-3xl">
        <CardHeader>
          <CardTitle className="font-display text-sm uppercase tracking-[0.25em] text-accent">Credential_UI_Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm font-mono text-muted-foreground leading-relaxed">
          <p>
            Management users should be provisioned using institutional addresses tied to society ownership.
          </p>
          <p>
            Use the convention <span className="text-white">{'{societyid}@ieee.org'}</span> for branch-scoped access, and reserve
            role-level aliases for leadership-facing logins.
          </p>
          <p>
            Example: a society with key <span className="text-white">cs</span> should use <span className="text-white">cs@ieee.org</span> for the branch account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
