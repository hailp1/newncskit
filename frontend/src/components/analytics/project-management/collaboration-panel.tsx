'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Crown, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Clock,
  Check,
  X,
  MoreHorizontal,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { analyticsService, AnalysisProject } from '@/services/analytics';
import { formatDistanceToNow } from 'date-fns';

interface CollaborationPanelProps {
  project: AnalysisProject;
  onUpdate: (project: AnalysisProject) => void;
}

interface Collaborator {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canInvite: boolean;
    canExport: boolean;
  };
  joinedAt: string;
  status: 'active' | 'pending' | 'inactive';
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  message?: string;
  sentAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

const ROLE_PERMISSIONS = {
  owner: {
    canEdit: true,
    canDelete: true,
    canInvite: true,
    canExport: true
  },
  editor: {
    canEdit: true,
    canDelete: false,
    canInvite: true,
    canExport: true
  },
  viewer: {
    canEdit: false,
    canDelete: false,
    canInvite: false,
    canExport: true
  }
};

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  project,
  onUpdate
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    loadCollaborators();
  }, [project.id]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const collaboratorsData = await analyticsService.getProjectCollaborators(project.id);
      // Handle both array and object responses
      if (Array.isArray(collaboratorsData)) {
        setCollaborators(collaboratorsData);
        setPendingInvitations([]);
      } else {
        setCollaborators((collaboratorsData as any).collaborators || []);
        setPendingInvitations((collaboratorsData as any).pendingInvitations || []);
      }
    } catch (error) {
      console.error('Failed to load collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setLoading(true);
      await analyticsService.inviteCollaborator(project.id, {
        userEmail: inviteEmail,
        role: inviteRole,
        permissions: ROLE_PERMISSIONS[inviteRole],
        message: inviteMessage
      });
      
      // Reload collaborators to get updated list
      await loadCollaborators();
      
      // Reset form
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteMessage('');
      setShowInviteForm(false);
      
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!window.confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      setLoading(true);
      // This would be implemented in the analytics service
      // await analyticsService.removeCollaborator(project.id, collaboratorId);
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (collaboratorId: string, newRole: string) => {
    try {
      setLoading(true);
      // This would be implemented in the analytics service
      // await analyticsService.updateCollaboratorRole(project.id, collaboratorId, newRole);
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      setLoading(true);
      // This would be implemented in the analytics service
      // await analyticsService.resendInvitation(invitationId);
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      setLoading(true);
      // This would be implemented in the analytics service
      // await analyticsService.cancelInvitation(invitationId);
      await loadCollaborators();
    } catch (error) {
      console.error('Failed to cancel invitation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'editor': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Project Collaboration</h3>
          <p className="text-sm text-gray-600">
            Manage team members and their access to this project
          </p>
        </div>
        <Button 
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite Collaborator
        </Button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invite New Collaborator</CardTitle>
            <CardDescription>
              Send an invitation to collaborate on this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'editor' | 'viewer') => setInviteRole(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Viewer</div>
                        <div className="text-xs text-gray-500">Can view and export results</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Editor</div>
                        <div className="text-xs text-gray-500">Can edit project and invite others</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="invite-message">Personal Message (Optional)</Label>
              <Textarea
                id="invite-message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Add a personal message to the invitation..."
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteCollaborator}
                disabled={!inviteEmail.trim() || loading}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Invitation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Members ({collaborators.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {collaborators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborators yet</h3>
              <p className="text-gray-600">Invite team members to collaborate on this project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={collaborator.avatar} />
                      <AvatarFallback>
                        {collaborator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{collaborator.name}</span>
                        {collaborator.role === 'owner' && (
                          <Badge variant="outline" className="text-xs">Owner</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{collaborator.email}</div>
                      <div className="text-xs text-gray-500">
                        Joined {formatDistanceToNow(new Date(collaborator.joinedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(collaborator.role)}>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(collaborator.role)}
                        {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                      </div>
                    </Badge>
                    
                    {collaborator.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChangeRole(collaborator.id, 'editor')}>
                            <Edit className="h-4 w-4 mr-2" />
                            Make Editor
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeRole(collaborator.id, 'viewer')}>
                            <Eye className="h-4 w-4 mr-2" />
                            Make Viewer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveCollaborator(collaborator.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invitations ({pendingInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvitations.map(invitation => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-gray-600">
                        Invited as {invitation.role} • {formatDistanceToNow(new Date(invitation.sentAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleResendInvitation(invitation.id)}>
                          <Send className="h-4 w-4 mr-2" />
                          Resend
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-600" />
                <span className="font-medium">Owner</span>
              </div>
              <span className="text-sm text-gray-600">Full access to all project features</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Editor</span>
              </div>
              <span className="text-sm text-gray-600">Can edit project and invite collaborators</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Viewer</span>
              </div>
              <span className="text-sm text-gray-600">Can view and export project results</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};