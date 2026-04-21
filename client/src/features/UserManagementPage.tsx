import React from 'react';

const UserManagementPage: React.FC = () => {
  return (
    <div className="p-8 technical-grid min-h-screen">
      <h1 className="text-4xl font-display uppercase tracking-tighter text-white">User_Management</h1>
      <p className="mt-3 text-muted-foreground font-mono text-sm">
        Credential control route is active. Role management and invitation workflows will be added next.
      </p>
    </div>
  );
};

export default UserManagementPage;
