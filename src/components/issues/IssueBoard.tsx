import React, { useState, useEffect } from 'react';
import { issuesApi, Issue } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Column {
  id: string;
  title: string;
  status: Issue['status'];
}

const columns: Column[] = [
  { id: 'todo', title: 'To Do', status: 'ToDo' },
  { id: 'inprogress', title: 'In Progress', status: 'InProgress' },
  { id: 'done', title: 'Done', status: 'Done' },
];

interface IssueBoardProps {
  projectId: string;
}

export const IssueBoard: React.FC<IssueBoardProps> = ({ projectId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await issuesApi.getAll(projectId);
        setIssues(response.data);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [projectId]);

  const getIssuesByStatus = (status: Issue['status']) => {
    return issues.filter(issue => issue.status === status);
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

  if (isLoading) {
    return <div>Loading board...</div>;
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
              {column.title}
              <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                {getIssuesByStatus(column.status).length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {getIssuesByStatus(column.status).map((issue) => (
                <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="mr-2">{getTypeIcon(issue.type)}</span>
                        {issue.title}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(issue.priority)}`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{issue.type}</span>
                      {issue.assignee && (
                        <span>{issue.assignee.firstName} {issue.assignee.lastName}</span>
                      )}
                    </div>
                    {issue.storyPoints && (
                      <div className="mt-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {issue.storyPoints} SP
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
