import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  type: 'Bug' | 'Task' | 'Story' | 'Epic';
  status: 'ToDo' | 'InProgress' | 'Done' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectId: string;
  assigneeId?: string;
  sprintId?: string;
  parentIssueId?: string;
  storyPoints?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User;
  project?: Project;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Completed' | 'Cancelled';
  projectId: string;
  createdAt: string;
  updatedAt: string;
  issues?: Issue[];
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  author: User;
  replies?: Comment[];
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (firstName: string, lastName: string, email: string, password: string) =>
    api.post('/auth/register', { firstName, lastName, email, password }),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const projectsApi = {
  getAll: () => api.get<Project[]>('/projects'),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Project>('/projects', project),
  update: (id: string, project: Partial<Project>) =>
    api.put<Project>(`/projects/${id}`, project),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getMembers: (id: string) => api.get(`/projects/${id}/members`),
  addMember: (id: string, userId: string, role: string) =>
    api.post(`/projects/${id}/members`, { userId, role }),
};

export const issuesApi = {
  getAll: (projectId?: string) => 
    api.get<Issue[]>('/issues', { params: { projectId } }),
  getByProject: (projectId: string) => api.get<Issue[]>(`/projects/${projectId}/issues`),
  getById: (id: string) => api.get<Issue>(`/issues/${id}`),
  create: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Issue>('/issues', issue),
  update: (id: string, issue: Partial<Issue>) =>
    api.put<Issue>(`/issues/${id}`, issue),
  delete: (id: string) => api.delete(`/issues/${id}`),
  updateStatus: (id: string, status: Issue['status']) =>
    api.patch(`/issues/${id}/status`, { status }),
};

export const sprintsApi = {
  getProjectSprints: (projectId: string) =>
    api.get<Sprint[]>(`/sprints/project/${projectId}`),
  getById: (id: string) => api.get<Sprint>(`/sprints/${id}`),
  create: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) =>
    api.post<Sprint>('/sprints', sprint),
  update: (id: string, sprint: Partial<Sprint>) =>
    api.put<Sprint>(`/sprints/${id}`, sprint),
  delete: (id: string) => api.delete(`/sprints/${id}`),
  start: (id: string) => api.post(`/sprints/${id}/start`),
  complete: (id: string) => api.post(`/sprints/${id}/complete`),
  getActive: (projectId: string) =>
    api.get<Sprint>(`/sprints/project/${projectId}/active`),
  getVelocity: (id: string) => api.get(`/sprints/${id}/velocity`),
  getBurndown: (id: string) => api.get(`/sprints/${id}/burndown`),
};

export const commentsApi = {
  getIssueComments: (issueId: string) =>
    api.get<Comment[]>(`/comments/issue/${issueId}`),
  create: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'author'>) =>
    api.post<Comment>('/comments', comment),
  update: (id: string, content: string) =>
    api.put<Comment>(`/comments/${id}`, { content }),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export const searchApi = {
  issues: (params: {
    query?: string;
    projectId?: string;
    status?: string;
    assigneeId?: string;
    priority?: string;
    type?: string;
    sprintId?: string;
    page?: number;
    pageSize?: number;
  }) => api.get('/search/issues', { params }),
  projects: (query?: string) =>
    api.get('/search/projects', { params: { query } }),
};

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const analyticsApi = {
  getDashboard: (projectId?: string) =>
    api.get('/analytics/dashboard', { params: { projectId } }),
  getVelocityChart: (projectId: string) =>
    api.get(`/analytics/velocity/${projectId}`),
  getBurndownChart: (sprintId: string) =>
    api.get(`/analytics/burndown/${sprintId}`),
};

export const dependenciesApi = {
  getByIssue: (issueId: string) => api.get(`/issues/${issueId}/dependencies`),
  create: (blockingIssueId: string, blockedIssueId: string, type: string) => 
    api.post(`/issues/${blockingIssueId}/dependencies`, { blockedIssueId, type }),
  delete: (issueId: string, dependencyId: string) => 
    api.delete(`/issues/${issueId}/dependencies/${dependencyId}`)
};
