import { axiosInstance } from './axiosInstance';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  AddCommentRequest,
  TaskFilters,
  TasksResponse,
  TaskResponse,
  TaskStatsResponse,
  CommentResponse
} from '@/types/taskBoard';

// 1. Create Task
export const createTask = async (taskData: CreateTaskRequest): Promise<TaskResponse> => {
  const response = await axiosInstance.post('/api/tasks', taskData);
  return response.data;
};

// 2. Get Tasks by Organization
export const getTasksByOrganization = async (
  organizationId: string,
  filters?: TaskFilters
): Promise<TasksResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.assignee) params.append('assignee', filters.assignee);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.repository) params.append('repository', filters.repository);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await axiosInstance.get(`/api/tasks/organization/${organizationId}${queryString}`);
  return response.data;
};

// 3. Get Task by ID
export const getTaskById = async (taskId: string): Promise<TaskResponse> => {
  const response = await axiosInstance.get(`/api/tasks/${taskId}`);
  return response.data;
};

// 4. Update Task
export const updateTask = async (taskId: string, taskData: UpdateTaskRequest): Promise<TaskResponse> => {
  const response = await axiosInstance.put(`/api/tasks/${taskId}`, taskData);
  return response.data;
};

// 5. Delete Task
export const deleteTask = async (taskId: string): Promise<{ success: boolean; message: string; data: null }> => {
  const response = await axiosInstance.delete(`/api/tasks/${taskId}`);
  return response.data;
};

// 6. Add Comment to Task
export const addCommentToTask = async (taskId: string, commentData: AddCommentRequest): Promise<CommentResponse> => {
  const response = await axiosInstance.post(`/api/tasks/${taskId}/comments`, commentData);
  return response.data;
};

// 7. Get Task Statistics
export const getTaskStats = async (organizationId: string): Promise<TaskStatsResponse> => {
  const response = await axiosInstance.get(`/api/tasks/stats/${organizationId}`);
  return response.data;
}; 