export interface User {
  _id: string;
  name: string;
  login: string;
  avatarUrl: string;
}

export interface Repository {
  _id: string;
  name: string;
  fullName: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee: User;
  createdBy: User;
  organization: string;
  repository: Repository;
  dueDate?: string;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  comments: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  content: string;
  author: User;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigneeId?: string;
  dueDate?: string;
  organizationId: string;
  repositoryId: string;
  tags?: string[];
  estimatedHours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  dueDate?: string;
  repositoryId?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface AddCommentRequest {
  content: string;
}

export interface TaskFilters {
  status?: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  repository?: string;
}

export interface TaskStats {
  statusBreakdown: {
    _id: string;
    count: number;
    totalEstimatedHours: number;
    totalActualHours: number;
  }[];
  priorityBreakdown: {
    _id: string;
    count: number;
  }[];
  totalTasks: number;
  overdueTasks: number;
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: Task[];
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

export interface TaskStatsResponse {
  success: boolean;
  message: string;
  data: TaskStats;
}

export interface CommentResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    title: string;
    comments: TaskComment[];
  };
} 