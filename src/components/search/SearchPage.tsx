import React, { useState } from 'react';
import { searchApi, Issue, Project } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'issues' | 'projects'>('issues');

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    assigneeId: '',
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      if (activeTab === 'issues') {
        const response = await searchApi.issues({
          query,
          ...filters,
        });
        setIssues(response.data.issues || []);
      } else {
        const response = await searchApi.projects(query);
        setProjects(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getPriorityColor = (priority: Issue['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500';
      case 'High': return 'bg-orange-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: Issue['type']) => {
    switch (type) {
      case 'Bug': return '🐛';
      case 'Task': return '✅';
      case 'Story': return '📖';
      case 'Epic': return '🎯';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Search</h1>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search issues, projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="flex space-x-4 border-b">
        <button
          className={`pb-2 px-1 ${activeTab === 'issues' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('issues')}
        >
          Issues
        </button>
        <button
          className={`pb-2 px-1 ${activeTab === 'projects' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('projects')}
        >
          Projects
        </button>
      </div>

      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="ToDo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Types</option>
              <option value="Bug">Bug</option>
              <option value="Task">Task</option>
              <option value="Story">Story</option>
              <option value="Epic">Epic</option>
            </select>
          </div>

          <div className="space-y-3">
            {issues.map((issue) => (
              <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTypeIcon(issue.type)}</span>
                      <div>
                        <h3 className="font-medium">{issue.title}</h3>
                        <p className="text-sm text-gray-500">{issue.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{issue.status}</span>
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(issue.priority)}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {project.name}
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {project.key}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="text-sm text-gray-500">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
