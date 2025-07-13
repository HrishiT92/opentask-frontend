import React, { useState, useEffect } from 'react';
import { dependenciesApi, Issue, issuesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';

interface IssueDependenciesProps {
  issueId: string;
  projectId: string;
}

interface Dependency {
  id: string;
  blockingIssueId: string;
  blockedIssueId: string;
  type: string;
  blockingIssue: Issue;
  blockedIssue: Issue;
}

export const IssueDependencies: React.FC<IssueDependenciesProps> = ({ issueId, projectId }) => {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [availableIssues, setAvailableIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [dependencyType, setDependencyType] = useState<string>('Blocks');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchDependencies();
    fetchAvailableIssues();
  }, [issueId, projectId]);

  const fetchDependencies = async () => {
    try {
      const response = await dependenciesApi.getByIssue(issueId);
      setDependencies(response.data);
    } catch (error) {
      console.error('Failed to fetch dependencies:', error);
    }
  };

  const fetchAvailableIssues = async () => {
    try {
      const response = await issuesApi.getByProject(projectId);
      setAvailableIssues(response.data.filter((issue: Issue) => issue.id !== issueId));
    } catch (error) {
      console.error('Failed to fetch available issues:', error);
    }
  };

  const addDependency = async () => {
    if (!selectedIssue) return;

    try {
      await dependenciesApi.create(issueId, selectedIssue, dependencyType);
      
      setSelectedIssue('');
      setIsAdding(false);
      fetchDependencies();
    } catch (error) {
      console.error('Failed to create dependency:', error);
    }
  };

  const removeDependency = async (dependencyId: string) => {
    try {
      await dependenciesApi.delete(issueId, dependencyId);
      fetchDependencies();
    } catch (error) {
      console.error('Failed to remove dependency:', error);
    }
  };

  const blockingDependencies = dependencies.filter(d => d.blockingIssueId === issueId);
  const blockedByDependencies = dependencies.filter(d => d.blockedIssueId === issueId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dependencies</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dependency
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableIssues.map((issue) => (
                      <SelectItem key={issue.id} value={issue.id}>
                        {issue.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dependencyType} onValueChange={setDependencyType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blocks">Blocks</SelectItem>
                    <SelectItem value="Relates">Relates</SelectItem>
                    <SelectItem value="Duplicates">Duplicates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2">
                <Button onClick={addDependency} disabled={!selectedIssue}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">This issue blocks:</h4>
          {blockingDependencies.length === 0 ? (
            <p className="text-sm text-gray-500">No blocking dependencies</p>
          ) : (
            <div className="space-y-2">
              {blockingDependencies.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{dep.blockedIssue.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDependency(dep.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">This issue is blocked by:</h4>
          {blockedByDependencies.length === 0 ? (
            <p className="text-sm text-gray-500">No blocking dependencies</p>
          ) : (
            <div className="space-y-2">
              {blockedByDependencies.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm">{dep.blockingIssue.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDependency(dep.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
