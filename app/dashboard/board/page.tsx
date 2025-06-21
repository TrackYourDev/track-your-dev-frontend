'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  MessageSquare, 
  X, 
  GripVertical, 
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useOrgsAndRepos, useTasksByOrganization } from '@/services/queries';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/services/mutations';
import { AppStore } from '@/lib/store';
import { useStoreState } from 'pullstate';
import { Task as TaskType, CreateTaskRequest } from '@/types/taskBoard';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const BoardPage = () => {
  // Organization and repository data
  const { data: orgsData, isLoading: isLoadingOrgs } = useOrgsAndRepos();
  const selectedOrg = useStoreState(AppStore, s => s.selectedOrg);
  
  // Get organization ID from selected org
  const selectedOrgData = orgsData?.data?.results?.find(org => org.organization.name === selectedOrg);
  const organizationId = selectedOrgData?.organization.id;

  // Task data
  const { 
    data: tasksData, 
    isLoading: isLoadingTasks, 
    error: tasksError,
    refetch: refetchTasks 
  } = useTasksByOrganization(organizationId || '', undefined, !!organizationId);

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // Local state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you manage your tasks, provide insights about your board, and answer questions about your project. How can I help you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatWidth, setChatWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Handle API errors
  useEffect(() => {
    if (tasksError) {
      toast.error('Failed to load tasks. Please try again.');
    }
  }, [tasksError]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${newMessage}". Let me help you with that. This is a simulated AI response - in a real implementation, this would connect to your AI service.`,
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < 800) {
          setChatWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const addTask = async (status: TaskType['status']) => {
    if (!newTaskTitle.trim() || !organizationId || !selectedOrgData) {
      toast.error('Please fill in the task title and ensure organization is selected.');
      return;
    }

    const taskData: CreateTaskRequest = {
      title: newTaskTitle,
      description: newTaskDescription,
      status,
      priority: 'medium',
    //   assigneeId: selectedOrgData.organization.id, 
      organizationId,
      repositoryId: selectedOrgData.repositories[0]?.id.toString() || '', // Default to first repo
      tags: [],
      estimatedHours: 0
    };

    try {
      await createTaskMutation.mutateAsync(taskData);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowNewTaskInput(null);
      toast.success('Task created successfully!');
    } catch (error) {
      toast.error('Failed to create task. Please try again.');
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskType['status']) => {
    try {
      await updateTaskMutation.mutateAsync({
        taskId,
        taskData: { status: newStatus }
      });
      toast.success('Task moved successfully!');
    } catch (error) {
      toast.error('Failed to move task. Please try again.');
      // Refetch to ensure UI is in sync
      refetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const getPriorityColor = (priority: TaskType['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: TaskType['status']) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'done': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTasksByStatus = (status: TaskType['status']) => {
    return tasksData?.data?.filter(task => task.status === status) || [];
  };

  const TaskCard = ({ task }: { task: TaskType }) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => deleteTask(task._id)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {task.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
            <span className="text-xs text-gray-500">{task.priority}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="w-3 h-3" />
            <span>{task?.assignee?.name || 'Unassigned'}</span>
          </div>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {task.estimatedHours && task.estimatedHours > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{task.estimatedHours}h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TaskColumn = ({ 
    title, 
    status, 
    tasks, 
    color 
  }: { 
    title: string; 
    status: TaskType['status']; 
    tasks: TaskType[]; 
    color: string;
  }) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNewTaskInput(status)}
          className="h-6 w-6 p-0"
          disabled={createTaskMutation.isPending}
        >
          {createTaskMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showNewTaskInput === status && (
        <div className="mb-3">
          <Input
            placeholder="Enter task title..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask(status)}
            className="mb-2"
            autoFocus
          />
          <Textarea
            placeholder="Enter task description (optional)..."
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            className="mb-2"
            rows={2}
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => addTask(status)}
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Add'
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowNewTaskInput(null)}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task._id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('taskId', task._id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData('taskId');
              moveTask(taskId, status);
            }}
          >
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );

  // Loading state
  if (isLoadingOrgs || isLoadingTasks) {
    return (
      <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="mt-4 text-gray-400">Loading tasks...</p>
      </main>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">Failed to load tasks</p>
        <Button onClick={() => refetchTasks()}>Try Again</Button>
      </main>
    );
  }

  // No organization selected
  if (!selectedOrg || !organizationId) {
    return (
      <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col items-center justify-center">
        <p className="text-gray-400">Please select an organization to view tasks</p>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col relative">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-8 border-b border-neutral-800">
        <h1 className="text-xl font-semibold">Task Board</h1>
        <Button
          variant="outline"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {isChatOpen ? 'Hide Chat' : 'Show Chat'}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Board Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex gap-6 h-full">
            <TaskColumn
              title="TODO"
              status="todo"
              tasks={getTasksByStatus('todo')}
              color="bg-gray-500"
            />
            <TaskColumn
              title="Under Progress"
              status="in-progress"
              tasks={getTasksByStatus('in-progress')}
              color="bg-blue-500"
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={getTasksByStatus('done')}
              color="bg-green-500"
            />
          </div>
        </div>

        {/* Resizable Chat Panel */}
        {isChatOpen && (
          <>
            <div
              className="w-1 bg-neutral-800 cursor-col-resize hover:bg-neutral-600 transition-colors"
              onMouseDown={handleMouseDown}
            >
              <div className="w-full h-full flex items-center justify-center">
                <GripVertical className="w-4 h-4 text-neutral-400" />
              </div>
            </div>
            
            <div
              ref={chatContainerRef}
              className="bg-neutral-900 border-l border-neutral-800 flex flex-col"
              style={{ width: chatWidth }}
            >
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-neutral-800 text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default BoardPage;