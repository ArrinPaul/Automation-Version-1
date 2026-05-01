import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, UserCheck, Phone, Mail, GraduationCap } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import apiClient from '@/services/apiClient';
import { normalizeCollection } from './phase4Helpers';

interface MemberRecord {
  id: string;
  ieeeId?: string | null;
  name: string;
  email: string;
  contactNumber?: string | null;
  grade?: string | null;
  society?: { name?: string; shortName?: string } | null;
}

interface OfficeBearerRecord {
  id: string;
  name: string;
  position: string;
  email: string;
  phone?: string | null;
  society?: { name?: string; shortName?: string } | null;
}

type Tab = 'members' | 'officers';

const RegistryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const membersQuery = useQuery<MemberRecord[]>({
    queryKey: ['registry-members'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/members');
      return normalizeCollection<MemberRecord>(response.data);
    },
    enabled: activeTab === 'members',
  });

  const officersQuery = useQuery<OfficeBearerRecord[]>({
    queryKey: ['registry-officers'],
    queryFn: async () => {
      const response = await apiClient.get<unknown>('/office-bearers');
      return normalizeCollection<OfficeBearerRecord>(response.data);
    },
    enabled: activeTab === 'officers',
  });

  const members = membersQuery.data ?? [];
  const officers = officersQuery.data ?? [];
  const isLoading = activeTab === 'members' ? membersQuery.isLoading : officersQuery.isLoading;

  return (
    <div className="space-y-8 p-8 technical-grid min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-display uppercase tracking-tighter text-white">Registry_Module</h1>
        <p className="mt-3 text-muted-foreground font-mono text-sm">
          Member and office-bearer directory across all societies.
        </p>
      </motion.div>

      {/* Tab Toggle */}
      <div className="flex gap-0 border border-white/10" style={{ borderWidth: '0.5px' }}>
        <Button
          type="button"
          onClick={() => setActiveTab('members')}
          className={`flex-1 h-10 rounded-none font-mono text-xs uppercase tracking-[0.25em] border-none ${
            activeTab === 'members'
              ? 'bg-white text-black'
              : 'bg-transparent text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3 h-3 mr-2" />
          Members ({members.length})
        </Button>
        <Button
          type="button"
          onClick={() => setActiveTab('officers')}
          className={`flex-1 h-10 rounded-none font-mono text-xs uppercase tracking-[0.25em] border-none ${
            activeTab === 'officers'
              ? 'bg-white text-black'
              : 'bg-transparent text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-3 h-3 mr-2" />
          Office Bearers ({officers.length})
        </Button>
      </div>

      {/* Members Table */}
      {activeTab === 'members' && (
        <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10" style={{ borderBottomWidth: '0.5px' }}>
            <CardTitle className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              Member_Directory
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-accent">Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">IEEE ID</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Email</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Grade</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center font-mono py-8 animate-pulse text-muted-foreground">
                    FETCHING_REGISTRY...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center font-mono py-8 text-muted-foreground">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member, i) => (
                  <motion.tr
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-mono text-sm text-white">{member.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-accent">
                      {member.ieeeId ?? <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" />{member.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.grade ? (
                        <Badge variant="outline" className="rounded-none border-white/20 text-[10px] text-muted-foreground">
                          <GraduationCap className="w-3 h-3 mr-1" />{member.grade}
                        </Badge>
                      ) : <span className="text-muted-foreground font-mono text-[10px]">—</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70">
                      {member.society?.shortName ?? '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {member.contactNumber
                        ? <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{member.contactNumber}</span>
                        : '—'}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Office Bearers Table */}
      {activeTab === 'officers' && (
        <Card className="bg-black/40 border-white/10 rounded-none overflow-hidden">
          <CardHeader className="border-b border-white/10" style={{ borderBottomWidth: '0.5px' }}>
            <CardTitle className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              Office_Bearers_Directory
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] uppercase text-accent">Name</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Position</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Society</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Email</TableHead>
                <TableHead className="font-mono text-[10px] uppercase text-accent">Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-mono py-8 animate-pulse text-muted-foreground">
                    FETCHING_REGISTRY...
                  </TableCell>
                </TableRow>
              ) : officers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-mono py-8 text-muted-foreground">
                    No office bearers found.
                  </TableCell>
                </TableRow>
              ) : (
                officers.map((officer, i) => (
                  <motion.tr
                    key={officer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="font-mono text-sm text-white">{officer.name}</TableCell>
                    <TableCell>
                      <Badge className="rounded-none bg-primary/20 text-primary border-primary/30 border text-[10px]">
                        {officer.position}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70">
                      {officer.society?.shortName ?? '—'}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" />{officer.email}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {officer.phone
                        ? <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{officer.phone}</span>
                        : '—'}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default RegistryPage;
