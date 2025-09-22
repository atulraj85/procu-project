"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Clock, Search, Plus, MoreVertical, Paperclip } from 'lucide-react';
import { useCurrentUser } from '@/hooks/auth';

// Types (unchanged)
interface Thread {
  thread_id: string;
  first_message_content : string;
  last_message_content: string;
  last_message_type: string;
  last_sender_type: string;
  last_sender_name: string;
  last_message_at: string;
  message_count: number;
}

interface Message {
  id: string;
  rfpId: string;
  threadId: string;
  senderId: string;
  senderType: 'USER' | 'VENDOR';
  senderName: string;
  senderEmail?: string;
  messageType: 'TEXT' | 'ATTACHMENT' | 'SYSTEM_MESSAGE';
  content: string;
  attachments?: any[];
  parentMessageId?: string;
  createdAt: string;
  rfpTitle?: string;
  rfpNumber?: string;
}

interface RFPConversationProps {
  rfpId: string;
}

const RFPConversation: React.FC<RFPConversationProps> = ({
  rfpId,
}) => {
  // State Management (unchanged)
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const user = useCurrentUser()
  
  // API Functions (unchanged)
  const fetchThreads = async () => {
    try {
      setThreadsLoading(true);
      const response = await fetch(`/api/conversations/threads?rfpId=${rfpId}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Fetched threads:', data.threads);
        setThreads(data.threads || []);
        
        // Only set active thread if none is selected
        if (data.threads?.length > 0 && !activeThreadId) {
          setActiveThreadId(data.threads[0].thread_id);
        }
      } else {
        console.error('Failed to fetch threads:', data.message);
      }
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setThreadsLoading(false);
    }
  };

  const fetchMessages = async (threadId: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(
        `/api/conversations/messages?rfpId=${rfpId}&threadId=${threadId}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (content: string, threadId?: string, isNewThread = false) => {
    if (!content.trim()) return;

    try {
      setSendingMessage(true);
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfpId,
          threadId: threadId || activeThreadId,
          senderId: user?.id,
          senderType: 'USER',
          messageType: 'TEXT',
          content: content.trim(),
          isNewThread,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newMessage = data.data;
        
        if (newMessage.threadId === activeThreadId) {
          setMessages(prev => [...prev, newMessage]);
        } else {
          setActiveThreadId(newMessage.threadId);
        }
        
        await fetchThreads();
        setNewMessage('');
        
        console.log('Message sent to thread:', newMessage.threadId);
      } else {
        console.error('Failed to send message:', data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const startNewThread = async () => {
    if (!newThreadTitle.trim()) return;
    
    try {
      setSendingMessage(true);
      
      const response = await fetch('/api/conversations/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rfpId,
          senderId: user?.id,
          senderType: 'USER',
          messageType: 'TEXT',
          content: `Starting discussion: ${newThreadTitle.trim()}`,
          isNewThread: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const newMessage = data.data;
        
        setActiveThreadId(newMessage.threadId);
        await fetchThreads();
        setMessages([]);
        setNewThreadTitle('');
        setShowNewThreadModal(false);
        
        console.log('New thread created:', newMessage.threadId);
      } else {
        console.error('Failed to create new thread:', data.message);
      }
    } catch (error) {
      console.error('Error creating new thread:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Effects (unchanged)
  useEffect(() => {
    const initializeConversation = async () => {
      setLoading(true);
      await fetchThreads();
      setLoading(false);
    };

    if (rfpId) {
      initializeConversation();
    }
  }, [rfpId]);

  useEffect(() => {
    if (activeThreadId) {
      console.log('Switching to thread:', activeThreadId);
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendingMessage && newMessage.trim()) {
        sendMessage(newMessage);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.last_message_content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.last_sender_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex w-full h-screen bg-gray-50">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r bg-white shadow-sm border-gray-200">
          <div className="p-4 border-b bg-green-700 border-green-800">
            <div className="h-6 bg-green-600 rounded animate-pulse mb-3"></div>
            <div className="h-10 bg-green-600 rounded animate-pulse"></div>
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border rounded-lg shadow-sm border-gray-200">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b bg-white shadow-sm border-gray-200">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
                  <div className="h-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen bg-gray-50">
      {/* Sidebar - Threads List */}
      <div className="w-80 border-r bg-white shadow-sm flex flex-col border-gray-200">
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-green-700 border-green-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Discussions</h2>
            <button
              onClick={() => setShowNewThreadModal(true)}
              className="p-2 text-white/90 hover:text-white rounded-lg transition-all duration-200 hover:bg-green-600"
              title="Start new discussion"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-200" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-600 placeholder-green-200 text-white"
            />
          </div>
        </div>

        {/* Threads List */}
        <div className="flex-1 overflow-y-auto">
          {threadsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 border rounded-lg animate-pulse shadow-sm border-gray-200">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-green-700">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p className="text-sm">No discussions yet</p>
              <button
                onClick={() => setShowNewThreadModal(true)}
                className="mt-2 text-sm font-medium text-green-600 hover:text-green-800 transition-colors"
              >
                Start the first discussion
              </button>
            </div>
          ) : (
            <div className="p-2">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.thread_id}
                  onClick={() => setActiveThreadId(thread.thread_id)}
                  className={`w-full p-3 mb-2 rounded-lg text-left transition-all duration-200 border ${
                    activeThreadId === thread.thread_id
                      ? 'bg-green-50 border-green-300 shadow-sm'
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-green-900">
  {(thread.first_message_content?.replace('Starting discussion: ', '') || '').substring(0, 40) || 'Untitled'}
</p>
                      <p className="text-xs truncate text-green-700 mt-1">
                        {thread.last_message_content || 'New discussion'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-green-600">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{thread.last_sender_name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className="text-xs text-green-500">
                        {formatTime(thread.last_message_at)}
                      </span>
                      {thread.message_count > 1 && (
                        <span className="text-xs px-2 py-0.5 rounded-full mt-1 font-medium bg-green-100 text-green-800">
                          {thread.message_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col pl-8">
        {activeThreadId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white shadow-sm border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Discussion Thread
                  </h3>
                  <p className="text-sm text-green-600">
                    RFP Conversation • {messages.length} messages
                  </p>
                </div>
                <button 
                  className="p-2 rounded-lg text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messagesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-8 h-8 bg-green-200 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-green-200 rounded animate-pulse w-1/4 mb-2"></div>
                        <div className="h-16 bg-green-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-green-300" />
                  <p className="text-green-700">No messages in this thread yet</p>
                  <p className="text-sm mt-1 text-green-600">Start the conversation below</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm ${
                        message.senderType === 'USER' ? 'bg-green-600' : 'bg-green-800'
                      }`}>
                        {message.senderName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline space-x-2 mb-1">
                          <span className="text-sm font-medium text-green-900">
                            {message.senderName}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            message.senderType === 'USER' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-green-200 text-green-900'
                          }`}>
                            {message.senderType}
                          </span>
                          <span className="text-xs text-green-500">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                        
                        <div className={`p-3 rounded-lg shadow-sm border ${
                          message.messageType === 'SYSTEM_MESSAGE'
                            ? 'bg-amber-100 border-amber-300'
                            : message.senderId === user?.id
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap text-green-900">
                            {message.content}
                          </p>
                          
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-sm text-green-700">
                                  <Paperclip className="w-4 h-4" />
                                  <span>{attachment.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="py-4 border-t bg-white shadow-sm border-gray-200">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none shadow-sm text-sm border-gray-300" 
                    disabled={sendingMessage}
                  />
                </div>
                <button
                  onClick={() => sendMessage(newMessage)}
                  disabled={sendingMessage || !newMessage.trim()}
                  className="px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-sm bg-green-600 hover:bg-green-700 font-medium"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-green-700">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-green-300" />
              <h3 className="text-lg font-medium mb-2">Select a discussion</h3>
              <p className="text-green-600">
                Choose a discussion thread from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Thread Modal */}
      {showNewThreadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-green-900">Start New Discussion</h3>
            <input
              type="text"
              placeholder="Enter discussion topic..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm border-gray-300"
              onKeyPress={(e) => e.key === 'Enter' && startNewThread()}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewThreadModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg transition-colors font-medium text-green-700 border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startNewThread}
                disabled={!newThreadTitle.trim()}
                className="flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 transition-all duration-200 shadow-sm bg-green-600 hover:bg-green-700 font-medium"
              >
                Start Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFPConversation;