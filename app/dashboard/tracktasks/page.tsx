'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectCards, Project } from '@/components/ProjectCards';
import { ProjectTasksTimeline, Task } from '@/components/ProjectTasksTimeline';
import { Button } from '@/components/ui/button';
import { Bell, Pen, ArrowUp, Loader2 } from 'lucide-react';
import { PlanSprintModal } from '@/components/PlanSprintModal';
import { useOrgsAndRepos, useToggleTasks } from '@/services/queries';
import { AppStore, setSelectedOrg } from '@/lib/store';
import { useStoreState } from 'pullstate';
import { fetchTasks } from '@/services/apis/dashboardApis';
import { Commit, CommitTask } from '@/types/dashboard';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { AxiosError } from 'axios';

function TrackTasks() {
  // --- Begin Dashboard logic ---
  const { data, isLoading, isFetching, error } = useOrgsAndRepos();
  const toggleTasksMutation = useToggleTasks();
  const [selected, setSelected] = useState(0);
  const [shortcutLabel, setShortcutLabel] = useState('');
  const [isMac, setIsMac] = useState(false);
  const [taskView, setTaskView] = useState<'technical' | 'non-technical'>('technical');
  const [isPlanSprintOpen, setIsPlanSprintOpen] = useState(false);
  const selectedOrg = useStoreState(AppStore, s => s.selectedOrg);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Local state to track enabled repositories
  const [enabledRepos, setEnabledRepos] = useState<Set<number>>(new Set());
  
  // Initialize enabled repos from API data
  useEffect(() => {
    if (data?.data?.results) {
      const initialEnabledRepos = new Set<number>();
      data.data.results.forEach(org => {
        org.repositories.forEach(repo => {
          if (repo.enabledForTasks) {
            initialEnabledRepos.add(repo.id);
          }
        });
      });
      setEnabledRepos(initialEnabledRepos);
    }
  }, [data?.data?.results]);

  // Get base projects data without enabled state
  const baseProjects = React.useMemo(() => {
    if (!data?.data?.results) return [];
    
    const orgData = data.data.results.find(result => result.organization.name === selectedOrg);
    if (!orgData?.repositories) return [];
    
    return orgData.repositories.map(repo => ({
      name: repo.name,
      category: '', // Leaving category blank as requested
      id: repo.id
    }));
  }, [data, selectedOrg]);

  // Get the selected project with its enabled state
  const selectedProject = React.useMemo(() => {
    if (!baseProjects[selected]) return null;
    return {
      ...baseProjects[selected],
      enabledForTasks: enabledRepos.has(baseProjects[selected].id)
    };
  }, [baseProjects, selected, enabledRepos]);

  const isTasksEnabled = selectedProject?.enabledForTasks ?? false;

  // Filter tasks based on the current view
  const filteredTasks = tasks.filter(task => task.type === taskView);

  const loadTasks = useCallback(async (page: number) => {
    if (!selectedProject?.name || !isTasksEnabled) return;
    
    setIsLoadingTasks(true);
    try {
      const response = await fetchTasks(selectedOrg, selectedProject.name, {
        page,
        pageSize: 10 // Increased page size for better UX
      });
      
      const newTasks = response.data.commits.flatMap((commit: Commit) => {
        const tasks = commit.tasks;
        const technicalTasks = tasks.technicalTasks;
        const nonTechnicalTasks = tasks.nonTechnicalTasks;

        return [
          ...technicalTasks.map((task: CommitTask) => ({
            id: `${commit._id}-technical-${task.title}`,
            title: task.title,
            description: task.description,
            timestamp: commit.commitTime,
            developer: { name: commit.author, avatarUrl: '' },
            type: 'technical' as const,
            project: selectedProject.name,
          })),
          ...nonTechnicalTasks.map((task: CommitTask) => ({
            id: `${commit._id}-non-technical-${task.title}`,
            title: task.title,
            description: task.description,
            timestamp: commit.commitTime,
            developer: { name: commit.author, avatarUrl: '' },
            type: 'non-technical' as const,
            project: selectedProject.name,
          }))
        ];
      });

      setTasks(prev => page === 1 ? newTasks : [...prev, ...newTasks]);
      setHasMore(newTasks.length === 10); // Check if we got a full page of results
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [selectedOrg, selectedProject, isTasksEnabled]);

  const handleToggleTasks = useCallback(() => {
    if (selectedProject) {
      const newEnabled = !isTasksEnabled;
      
      // Optimistically update local state
      setEnabledRepos(prev => {
        const next = new Set(prev);
        if (newEnabled) {
          next.add(selectedProject.id);
        } else {
          next.delete(selectedProject.id);
        }
        return next;
      });

      // If enabling tasks, start loading them immediately
      if (newEnabled) {
        setTasks([]);
        setCurrentPage(1);
        loadTasks(1);
      } else {
        setTasks([]);
      }

      // Call toggle API in background
      toggleTasksMutation.mutate(
        { repoId: selectedProject.id.toString(), enabled: newEnabled },
        {
          onError: () => {
            // Revert optimistic update on error
            setEnabledRepos(prev => {
              const next = new Set(prev);
              if (!newEnabled) {
                next.add(selectedProject.id);
              } else {
                next.delete(selectedProject.id);
              }
              return next;
            });
          }
        }
      );
    }
  }, [selectedProject, isTasksEnabled, toggleTasksMutation, loadTasks]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingTasks && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadTasks(nextPage);
    }
  }, [currentPage, isLoadingTasks, hasMore, loadTasks]);

  // Load initial tasks when project is selected or tasks are enabled
  useEffect(() => {
    setCurrentPage(1);
    setTasks([]);
    if (isTasksEnabled && selectedProject) {
      loadTasks(1);
    }
  }, [selectedProject, isTasksEnabled, loadTasks]);

  // Reset selected project when organization changes
  React.useEffect(() => {
    if (baseProjects.length > 0) {
      setSelected(0); // Select first project by default
    } else {
      setSelected(-1); // No project selected when array is empty
    }
  }, [selectedOrg, baseProjects]);

  // Detect platform for shortcut label
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mac =
        navigator.platform.toLowerCase().includes('mac') ||
        navigator.userAgent.toLowerCase().includes('mac');
      setIsMac(mac);
      setShortcutLabel(mac ? '⌘ + P' : 'Ctrl + P');
    }
  }, []);

  // Keyboard navigation for project cards, org switching, and Plan a sprint shortcut
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      const orgs = data?.data?.results || [];
      const currentOrgIndex = orgs.findIndex(org => org.organization.name === selectedOrg);

      // Organization switching with Cmd/Ctrl + Arrow Up/Down
      if ((isMac && e.metaKey) || (!isMac && e.ctrlKey)) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentOrgIndex > 0) {
            setSelectedOrg(orgs[currentOrgIndex - 1].organization.name);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentOrgIndex < orgs.length - 1) {
            setSelectedOrg(orgs[currentOrgIndex + 1].organization.name);
          }
        }
      }

      // Project navigation
      if (e.key === 'ArrowLeft') {
        setSelected((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'ArrowRight') {
        setSelected((prev) => (prev < baseProjects.length - 1 ? prev + 1 : prev));
      }

      // Plan a sprint shortcut
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'p') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        handlePlanSprintShortcut();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac, baseProjects.length, data, selectedOrg]);

  function handlePlanSprintShortcut() {
    setIsPlanSprintOpen(true);
  }

  // Handle scroll to show/hide scroll top button
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      setShowScrollTop(scrollContainerRef.current.scrollTop > 100);
    }
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const response = await fetch('/api/auth/verify-github');
      const data = await response.json();
      console.log(data);
      if(data.authenticated === false) {
        router.push('/');
      }
    };
    checkAuthentication();
  }, [router]);

  // Add a computed loading state that considers both operations
  const isTaskToggleLoading = toggleTasksMutation.isPending || isFetching;

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Add this effect to handle 403 errors
  useEffect(() => {
    if (error instanceof AxiosError && error.response?.status === 403 && error.response?.data?.message === "Subscription required to access this feature") {
      setShowSubscriptionModal(true);
    }
  }, [error]);

  return (
    <main className="flex-1 min-h-screen bg-[#101011] text-white p-0 flex flex-col relative">
      {/* Mini bar */}
      <div className="flex justify-end items-center h-16 px-8 border-b border-neutral-800">
        {/* <Button variant="ghost" size="icon" className="text-white mr-2">
          <Bell className="w-5 h-5" />
        </Button> */}
        <Button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md bg-neutral-800"
          onClick={handlePlanSprintShortcut}
        >
          <Pen className="w-4 h-4" />
          <span className="font-medium text-sm">Plan a sprint</span>
          {shortcutLabel && (
            <span className="ml-2 text-xs text-neutral-400 border border-neutral-700 rounded px-2 py-0.5">{shortcutLabel}</span>
          )}
        </Button>
      </div>
      {/* Scrollable content area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-8 py-6 text-neutral-400">Loading projects...</div>
        ) : (
          <>
            <ProjectCards 
              projects={baseProjects.map(project => ({
                ...project,
                enabledForTasks: enabledRepos.has(project.id)
              }))} 
              selected={selected} 
              setSelected={setSelected} 
            />
            {selectedProject && (
              <div className="px-8 py-2">
                {isTasksEnabled ? (
                  <div className="flex items-center justify-end gap-2 text-sm text-neutral-400">
                    <span>Task Tracking</span>
                    <div className="relative">
                      <Switch
                        checked={isTasksEnabled}
                        onCheckedChange={handleToggleTasks}
                        className="data-[state=checked]:bg-primary"
                        disabled={isTaskToggleLoading}
                      />
                      {isTaskToggleLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 rounded-md">
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Button
                      onClick={handleToggleTasks}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10 hover:text-primary relative"
                      disabled={isTaskToggleLoading}
                    >
                      <span className="flex items-center gap-2">
                        {isTaskToggleLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Pen className="w-4 h-4" />
                        )}
                        Enable Task Tracking
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {/* Project tasks timeline */}
        {selectedProject && isTasksEnabled ? (
          <div className="h-full">
            <ProjectTasksTimeline
              tasks={filteredTasks}
              view={taskView}
              onViewChange={setTaskView}
              onJumpToDate={() => {}}
              onAddTask={() => {}}
              onEditTask={() => {}}
              isLoading={isLoadingTasks}
              onLoadMore={handleLoadMore}
              hasMore={hasMore}
            />
          </div>
        ) : (
          <div className="p-8">
          </div>
        )}
      </div>
      {/* Scroll to top button */}
      <Button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        size="icon"
      >
        <ArrowUp className="w-6 h-6" />
      </Button>
      <PlanSprintModal
        isOpen={isPlanSprintOpen}
        onClose={() => setIsPlanSprintOpen(false)}
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </main>
  );
}

export default TrackTasks; 