import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  
  // Modal states
  isCreateProjectModalOpen: boolean;
  isDeleteProjectModalOpen: boolean;
  selectedProjectId?: string;
  
  // Toast/notification states
  notification?: {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    id: string;
  };
  
  // Sidebar states
  isSidebarOpen: boolean;
  
  // Filter/search states
  projectsFilter: {
    search: string;
    status: 'all' | 'active' | 'expired' | 'inactive';
    sortBy: 'created_at' | 'name' | 'expires_at';
    sortOrder: 'asc' | 'desc';
  };
}

interface UIActions {
  // Loading actions
  setLoading: (loading: boolean, message?: string) => void;
  
  // Modal actions
  openCreateProjectModal: () => void;
  closeCreateProjectModal: () => void;
  openDeleteProjectModal: (projectId: string) => void;
  closeDeleteProjectModal: () => void;
  
  // Notification actions
  showNotification: (type: UIState['notification']['type'], message: string) => void;
  hideNotification: () => void;
  
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Filter actions
  setProjectsSearch: (search: string) => void;
  setProjectsStatus: (status: UIState['projectsFilter']['status']) => void;
  setProjectsSort: (
    sortBy: UIState['projectsFilter']['sortBy'],
    sortOrder?: UIState['projectsFilter']['sortOrder']
  ) => void;
  resetProjectsFilter: () => void;
}

const initialProjectsFilter: UIState['projectsFilter'] = {
  search: '',
  status: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      isLoading: false,
      loadingMessage: undefined,
      isCreateProjectModalOpen: false,
      isDeleteProjectModalOpen: false,
      selectedProjectId: undefined,
      notification: undefined,
      isSidebarOpen: false,
      projectsFilter: initialProjectsFilter,

      // Loading actions
      setLoading: (loading, message) =>
        set({ isLoading: loading, loadingMessage: message }),

      // Modal actions
      openCreateProjectModal: () => set({ isCreateProjectModalOpen: true }),
      closeCreateProjectModal: () => set({ isCreateProjectModalOpen: false }),
      openDeleteProjectModal: (projectId) =>
        set({ isDeleteProjectModalOpen: true, selectedProjectId: projectId }),
      closeDeleteProjectModal: () =>
        set({ isDeleteProjectModalOpen: false, selectedProjectId: undefined }),

      // Notification actions
      showNotification: (type, message) =>
        set({
          notification: {
            type,
            message,
            id: Date.now().toString(),
          },
        }),
      hideNotification: () => set({ notification: undefined }),

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Filter actions
      setProjectsSearch: (search) =>
        set((state) => ({
          projectsFilter: { ...state.projectsFilter, search },
        })),
      setProjectsStatus: (status) =>
        set((state) => ({
          projectsFilter: { ...state.projectsFilter, status },
        })),
      setProjectsSort: (sortBy, sortOrder) =>
        set((state) => ({
          projectsFilter: {
            ...state.projectsFilter,
            sortBy,
            sortOrder: sortOrder || state.projectsFilter.sortOrder,
          },
        })),
      resetProjectsFilter: () => set({ projectsFilter: initialProjectsFilter }),
    }),
    {
      name: 'dupi-ui-store',
    }
  )
);