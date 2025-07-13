import React, { useState, useEffect } from 'react';
import { sprintsApi, issuesApi, analyticsApi, Sprint, Issue } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Calendar, BarChart3 } from 'lucide-react';
import { VelocityChart } from '@/components/charts/VelocityChart';
import { BurndownChart } from '@/components/charts/BurndownChart';

interface SprintBoardProps {
  projectId: string;
}

export const SprintBoard: React.FC<SprintBoardProps> = ({ projectId }) => {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [backlogIssues, setBacklogIssues] = useState<Issue[]>([]);
  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [burndownData, setBurndownData] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sprintsResponse, issuesResponse] = await Promise.all([
          sprintsApi.getProjectSprints(projectId),
          issuesApi.getAll(projectId)
        ]);
        
        setSprints(sprintsResponse.data);
        setBacklogIssues(issuesResponse.data.filter(issue => !issue.sprintId));
        
        const activeSprintData = sprintsResponse.data.find(s => s.status === 'Active');
        setActiveSprint(activeSprintData || null);
        
        try {
          const velocityResponse = await analyticsApi.getVelocityChart(projectId);
          setVelocityData(velocityResponse.data);
        } catch (error) {
          console.error('Failed to fetch velocity data:', error);
        }
        
        if (activeSprintData) {
          try {
            const burndownResponse = await analyticsApi.getBurndownChart(activeSprintData.id);
            setBurndownData(burndownResponse.data);
          } catch (error) {
            console.error('Failed to fetch burndown data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sprint data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintsApi.start(sprintId);
      const response = await sprintsApi.getProjectSprints(projectId);
      setSprints(response.data);
    } catch (error) {
      console.error('Failed to start sprint:', error);
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    try {
      await sprintsApi.complete(sprintId);
      const response = await sprintsApi.getProjectSprints(projectId);
      setSprints(response.data);
    } catch (error) {
      console.error('Failed to complete sprint:', error);
    }
  };

  const getStatusColor = (status: Sprint['status']) => {
    switch (status) {
      case 'Planning': return 'bg-gray-500';
      case 'Active': return 'bg-green-500';
      case 'Completed': return 'bg-blue-500';
      case 'Cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div>Loading sprints...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sprint Planning</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCharts(!showCharts)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </Button>
          <Button>Create Sprint</Button>
        </div>
      </div>

      {showCharts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <VelocityChart data={velocityData} />
            </CardContent>
          </Card>
          {activeSprint && burndownData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <BurndownChart data={burndownData} sprintName={activeSprint.name} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Sprints</h2>
          <div className="space-y-4">
            {sprints.filter(s => s.status === 'Active' || s.status === 'Planning').map((sprint) => (
              <Card key={sprint.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{sprint.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${getStatusColor(sprint.status)}`} />
                      <span className="text-sm text-gray-500">{sprint.status}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{sprint.goal}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </div>
                    <span>{sprint.issues?.length || 0} issues</span>
                  </div>
                  <div className="flex space-x-2">
                    {sprint.status === 'Planning' && (
                      <Button size="sm" onClick={() => handleStartSprint(sprint.id)}>
                        <Play className="w-4 h-4 mr-1" />
                        Start Sprint
                      </Button>
                    )}
                    {sprint.status === 'Active' && (
                      <Button size="sm" variant="outline" onClick={() => handleCompleteSprint(sprint.id)}>
                        <Square className="w-4 h-4 mr-1" />
                        Complete Sprint
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Product Backlog</h2>
          <div className="space-y-2">
            {backlogIssues.map((issue) => (
              <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {issue.type === 'Bug' ? '🐛' : 
                         issue.type === 'Task' ? '✅' : 
                         issue.type === 'Story' ? '📖' : '🎯'}
                      </span>
                      <span className="font-medium">{issue.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {issue.storyPoints && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {issue.storyPoints} SP
                        </span>
                      )}
                      <span className={`w-2 h-2 rounded-full ${
                        issue.priority === 'Critical' ? 'bg-red-500' :
                        issue.priority === 'High' ? 'bg-orange-500' :
                        issue.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
