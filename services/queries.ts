import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrgsAndRepos, fetchTasks, toggleTasks } from './apis/dashboardApis';
import { DashboardResponse, TaskResponse } from '@/types/dashboard';
import {
  createTask,
  getTasksByOrganization,
  getTaskById,
  updateTask,
  deleteTask,
  addCommentToTask,
  getTaskStats
} from '@/services/apis/taskBoardApis';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  AddCommentRequest,
  TaskFilters
} from '@/types/taskBoard';

export const QUERY_KEYS = {
  DASHBOARD: {
    ORGS_AND_REPOS: 'dashboard-orgs-and-repos',
    TASKS: 'dashboard-tasks',
  },
  TASK_BOARD: {
    ALL: 'tasks',
    LISTS: 'tasks-list',
    DETAILS: 'tasks-detail',
    STATS: 'tasks-stats',
  },
} as const;

// Task Board Query Keys
export const taskKeys = {
  all: [QUERY_KEYS.TASK_BOARD.ALL] as const,
  lists: () => [...taskKeys.all, QUERY_KEYS.TASK_BOARD.LISTS] as const,
  list: (organizationId: string, filters?: TaskFilters) => 
    [...taskKeys.lists(), organizationId, filters] as const,
  details: () => [...taskKeys.all, QUERY_KEYS.TASK_BOARD.DETAILS] as const,
  detail: (taskId: string) => [...taskKeys.details(), taskId] as const,
  stats: (organizationId: string) => [...taskKeys.all, QUERY_KEYS.TASK_BOARD.STATS, organizationId] as const,
};

export function useOrgsAndRepos() {
  return useQuery<DashboardResponse>({
    queryKey: [QUERY_KEYS.DASHBOARD.ORGS_AND_REPOS],
    queryFn: fetchOrgsAndRepos,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useTasks(orgName: string, repoName: string, options?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<TaskResponse>({
    queryKey: [QUERY_KEYS.DASHBOARD.TASKS, orgName, repoName, options],
    queryFn: () => fetchTasks(orgName, repoName, options),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

export function useToggleTasks() {
  return useMutation({
    mutationFn: ({ repoId, enabled }: { repoId: string; enabled: boolean }) => 
      toggleTasks(repoId, enabled)
  });
}

// Task Board Queries
export const useTasksByOrganization = (
  organizationId: string,
  filters?: TaskFilters,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: taskKeys.list(organizationId, filters),
    queryFn: () => getTasksByOrganization(organizationId, filters),
    enabled: enabled && !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTaskById = (taskId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => getTaskById(taskId),
    enabled: enabled && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTaskStats = (organizationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: taskKeys.stats(organizationId),
    queryFn: () => getTaskStats(organizationId),
    enabled: enabled && !!organizationId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};