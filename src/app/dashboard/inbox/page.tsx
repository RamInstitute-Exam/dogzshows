'use client';

import { useState, useEffect, useRef } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Loader2, MessageSquare, Send, Mail, User, ShieldAlert } from 'lucide-react';

interface ChatThread {
  partner: {
    id: string;
    email: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
    read: boolean;
  };
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
}

export default function InboxPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchThreads();
    // Refresh chats lists every 8 seconds
    const interval = setInterval(fetchThreads, 8000);
    return () => clearInterval(interval);
  }, []);

  // Poll active thread if selected
  useEffect(() => {
    if (!selectedPartnerId) return;
    fetchThreadMessages(selectedPartnerId, false);
    const interval = setInterval(() => {
      fetchThreadMessages(selectedPartnerId, false);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedPartnerId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchThreads = async () => {
    try {
      const res = await api.get('/messages/chats');
      setThreads(res.data || []);
    } catch (error) {
      console.error('Failed to fetch inbox threads:', error);
    } finally {
      setLoadingThreads(false);
    }
  };

  const fetchThreadMessages = async (partnerId: string, showSpinner = true) => {
    if (showSpinner) setLoadingMessages(true);
    try {
      const res = await api.get(`/messages/thread/${partnerId}`);
      setMessages(res.data || []);
    } catch (error) {
      console.error('Failed to load message thread:', error);
    } finally {
      if (showSpinner) setLoadingMessages(false);
    }
  };

  const handleSelectThread = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setNewMessage('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await api.post('/messages', {
        receiverId: selectedPartnerId,
        content: newMessage,
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      
      // Update thread last message client-side instantly
      setThreads(prev => 
        prev.map(t => 
          t.partner.id === selectedPartnerId 
            ? { ...t, lastMessage: { content: res.data.content, createdAt: res.data.createdAt, senderId: user?.userId || '', read: true } }
            : t
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to deliver message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const activeThread = threads.find(t => t.partner.id === selectedPartnerId);

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-10 w-full h-[calc(100vh-8rem)] flex flex-col">
        
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            <span>Chat Workspace Inbox</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Communicate directly with registered breeders and adoption leads.</p>
        </div>

        <div className="flex-1 bg-card border border-border/60 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          
          {/* LEFT THREAD LIST PANEL */}
          <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-150 flex flex-col bg-card/20">
            <div className="p-4 border-b border-border bg-card/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Conversations ({threads.length})</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loadingThreads ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs font-bold text-muted-foreground">Your inbox is empty</p>
                  <p className="text-muted-foregroundxs text-muted-foreground mt-1 leading-relaxed">Submit interest on dog listings to start chatting.</p>
                </div>
              ) : (
                threads.map((thread) => {
                  const isActive = thread.partner.id === selectedPartnerId;
                  const isUnread = !thread.lastMessage.read && thread.lastMessage.senderId !== user?.userId;
                  return (
                    <button
                      key={thread.partner.id}
                      onClick={() => handleSelectThread(thread.partner.id)}
                      className={`w-full text-left p-4.5 p-4 flex items-center space-x-3 transition-colors cursor-pointer ${
                        isActive ? 'bg-indigo-50/40 text-indigo-700' : 'hover:bg-card'
                      }`}
                    >
                      <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-indigo-200/40">
                        {thread.partner.email.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex justify-between items-baseline">
                          <p className={`text-xs font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-foreground'}`}>
                            {thread.partner.email}
                          </p>
                        </div>
                        <p className={`text-muted-foregroundxs truncate mt-1 leading-normal ${isUnread ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {thread.lastMessage.senderId === user?.userId ? 'You: ' : ''}
                          {thread.lastMessage.content}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 flex-shrink-0"></span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT CHAT WINDOW PANEL */}
          <main className="flex-1 flex flex-col justify-between bg-card relative">
            {selectedPartnerId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-150 bg-gray-55 bg-card/30 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200/40">
                      {activeThread?.partner.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{activeThread?.partner.email}</p>
                      <span className="text-muted-foregroundxs text-emerald-600 font-semibold flex items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1"></span>
                        Active Session
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages log */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-card/10">
                  {loadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === user?.userId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-100`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-semibold shadow-3xs border ${
                              isMe
                                ? 'bg-indigo-600 text-foreground border-indigo-500 rounded-tr-none'
                                : 'bg-card text-foreground border-border rounded-tl-none'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <span
                              className={`block text-muted-foregroundxs mt-1.5 text-right font-medium ${
                                isMe ? 'text-indigo-200' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 bg-card flex items-center space-x-3.5">
                  <input
                    type="text"
                    required
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sendingMessage}
                    className="w-full bg-card border border-border focus:bg-card text-gray-950 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-foreground p-3 rounded-xl transition-all shadow-md flex justify-center items-center cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-card/10">
                <div className="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-3">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-foreground text-base">Select a conversation</h3>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">Select an active contact thread on the sidebar panel to view chat session history logs.</p>
              </div>
            )}
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}

