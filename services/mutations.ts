import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinWaitListApi } from "./apis/joinWaitListApi";
import { toast } from "sonner";
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
import { taskKeys } from './queries';


type WaitlistResponse = {
  success: boolean;
  message: string;
  data: {
    email: string;
    _id: string;
    joinedAt: string;
    __v: number;
  };
};

export const useJoinWaitList = () => {
  const queryClient = useQueryClient();
  
  return useMutation<WaitlistResponse, Error, string>({
    mutationFn: joinWaitListApi,
    onSuccess: () => {
      toast.success("Successfully joined the waitlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join the waitlist");
    },
  });
};

// Task Board Mutations
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => createTask(taskData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch tasks for the organization
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: taskKeys.stats(variables.organizationId),
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, taskData }: { taskId: string; taskData: UpdateTaskRequest }) =>
      updateTask(taskId, taskData),
    onSuccess: (data, variables) => {
      // Update the specific task in cache
      queryClient.setQueryData(
        taskKeys.detail(variables.taskId),
        data
      );
      
      // Invalidate lists to refetch updated data
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: taskKeys.stats(data.data.organization),
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (data, taskId) => {
      // Remove the task from cache
      queryClient.removeQueries({
        queryKey: taskKeys.detail(taskId),
      });
      
      // Invalidate lists to refetch updated data
      queryClient.invalidateQueries({
        queryKey: taskKeys.lists(),
      });
      
      // Note: We can't invalidate stats here since we don't have the organizationId
      // The stats will be updated when the user navigates or refetches
    },
  });
};

export const useAddCommentToTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, commentData }: { taskId: string; commentData: AddCommentRequest }) =>
      addCommentToTask(taskId, commentData),
    onSuccess: (data, variables) => {
      // Update the specific task in cache with new comments
      queryClient.setQueryData(
        taskKeys.detail(variables.taskId),
        data
      );
    },
  });
};