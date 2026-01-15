'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import GroupsSidebar from '@/components/community/GroupsSidebar';
import ChannelSidebar from '@/components/community/ChannelSidebar';
import ChatWindow from '@/components/community/ChatWindow';
import { useAuth } from '@/contexts/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/community/groups');
      const data = await res.json();
      if (data.groups) {
        setGroups(data.groups);
        // Auto-select first group and its first channel
        if (data.groups.length > 0) {
          const firstGroup = data.groups[0];
          setActiveGroup(firstGroup);
          if (firstGroup.channels && firstGroup.channels.length > 0) {
            setActiveChannel(firstGroup.channels[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGroup = (group) => {
    setActiveGroup(group);
    if (group.channels && group.channels.length > 0) {
      setActiveChannel(group.channels[0]);
    } else {
      setActiveChannel(null);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/community/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName })
      });
      const data = await res.json();
      if (data.success) {
        setGroups([...groups, data.group]);
        setActiveGroup(data.group);
        setActiveChannel(data.group.channels[0]);
        setIsGroupModalOpen(false);
        setNewGroupName('');
      }
    } catch (e) {
      console.error('Group creation failed:', e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim() || !activeGroup) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/community/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroup.id,
          name: newChannelName,
          type: 'TEXT'
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedGroup = {
          ...activeGroup,
          channels: [...(activeGroup.channels || []), data.channel]
        };
        setActiveGroup(updatedGroup);
        // Update groups list too
        setGroups(groups.map(g => g.id === updatedGroup.id ? updatedGroup : g));
        setActiveChannel(data.channel);
        setIsChannelModalOpen(false);
        setNewChannelName('');
      }
    } catch (e) {
      console.error('Channel creation failed:', e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 bg-[#0D0D0D] flex overflow-hidden z-[9999]">
        {/* 1st Column: Groups Sidebar */}
        <GroupsSidebar
          groups={groups}
          activeGroup={activeGroup}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={() => setIsGroupModalOpen(true)}
        />

        {/* 2nd Column: Channel List */}
        <ChannelSidebar
          activeGroup={activeGroup}
          activeChannel={activeChannel}
          onSelectChannel={setActiveChannel}
          user={user}
          onCreateChannel={() => setIsChannelModalOpen(true)}
        />

        {/* 3rd Column: Main Chat Window */}
        <ChatWindow
          activeChannel={activeChannel}
          user={user}
        />
      </div>

      {/* Group Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Create New Village</h2>
            <form onSubmit={handleCreateGroup}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Village Name</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter village name..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:border-[#00D09C] outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsGroupModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-[#00D09C] text-[#0D0D0D] font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Village'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Channel Modal */}
      {isChannelModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-6">Create New Channel</h2>
            <form onSubmit={handleCreateChannel}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 block">Channel Name</label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g. soil-quality"
                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:border-[#00D09C] outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChannelModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-[#00D09C] text-[#0D0D0D] font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Channel'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !groups.length && (
        <div className="fixed inset-0 bg-[#0D0D0D] z-[10000] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00D09C] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Building Digital Village...</span>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
