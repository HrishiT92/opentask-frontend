import React, { useState, useEffect } from 'react';
import { issuesApi, Issue } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Filter } from 'lucide-react';

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

type SwimlaneType = 'none' | 'status' | 'priority' | 'assignee';

interface SortableIssueCardProps {
  issue: Issue;
  onIssueClick?: (issue: Issue) => void;
}

const SortableIssueCard: React.FC<SortableIssueCardProps> = ({ issue, onIssueClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onIssueClick?.(issue)}
    >
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
  );
};

interface IssueBoardProps {
  projectId: string;
}

export const IssueBoard: React.FC<IssueBoardProps> = ({ projectId }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [swimlaneType, setSwimlaneType] = useState<SwimlaneType>('none');
  const [filters, setFilters] = useState({
    assignee: '',
    status: '',
    sprint: '',
    labels: '',
  });

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await issuesApi.getByProject(projectId);
        setIssues(response.data);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [projectId]);

  const getFilteredIssues = () => {
    return issues.filter(issue => {
      if (filters.assignee && issue.assigneeId !== filters.assignee) return false;
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.sprint && issue.sprintId !== filters.sprint) return false;
      return true;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIssue = issues.find(issue => issue.id === active.id);
    if (!activeIssue) return;

    const newStatus = over.id as Issue['status'];
    if (activeIssue.status === newStatus) return;

    try {
      await issuesApi.update(activeIssue.id, {
        ...activeIssue,
        status: newStatus,
      });

      setIssues(prev => prev.map(issue =>
        issue.id === activeIssue.id
          ? { ...issue, status: newStatus }
          : issue
      ));
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const getSwimlanes = () => {
    if (swimlaneType === 'none') return [{ id: 'default', title: '', issues: getFilteredIssues() }];
    
    const groupedIssues: { [key: string]: Issue[] } = {};
    
    getFilteredIssues().forEach(issue => {
      let key = 'unassigned';
      
      switch (swimlaneType) {
        case 'priority':
          key = issue.priority;
          break;
        case 'assignee':
          if (issue.assignee) {
            key = issue.assigneeId || 'unassigned';
          }
          break;
        default:
          break;
      }
      
      if (!groupedIssues[key]) {
        groupedIssues[key] = [];
      }
      groupedIssues[key].push(issue);
    });
    
    return Object.entries(groupedIssues).map(([key, issues]) => ({
      id: key,
      title: key === 'unassigned' ? 'Unassigned' : 
             swimlaneType === 'priority' ? key :
             issues[0]?.assignee ? `${issues[0].assignee.firstName} ${issues[0].assignee.lastName}` : 'Unassigned',
      issues,
    }));
  };

  if (isLoading) {
    return <div>Loading board...</div>;
  }

  const activeIssue = activeId ? issues.find(issue => issue.id === activeId) : null;

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Assignees</SelectItem>
            {/* Add assignee options dynamically */}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="ToDo">To Do</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm font-medium">Swimlanes:</span>
          <Select value={swimlaneType} onValueChange={(value: SwimlaneType) => setSwimlaneType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="assignee">Assignee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ assignee: '', status: '', sprint: '', labels: '' })}
        >
          Clear Filters
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {getSwimlanes().map((swimlane) => (
            <div key={swimlane.id} className="space-y-4">
              {swimlaneType !== 'none' && (
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  {swimlane.title}
                </h2>
              )}
              
              <div className="flex space-x-6 overflow-x-auto pb-6">
                {columns.map((column) => {
                  const columnIssues = swimlane.issues.filter(issue => issue.status === column.status);
                  
                  return (
                    <div key={`${swimlane.id}-${column.id}`} className="flex-shrink-0 w-80">
                      <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                          {column.title}
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            {columnIssues.length}
                          </span>
                        </h3>
                        
                        <SortableContext
                          items={columnIssues.map(issue => issue.id)}
                          strategy={verticalListSortingStrategy}
                          id={column.status}
                        >
                          <div className="space-y-3" data-column-id={column.status}>
                            {columnIssues.map((issue) => (
                              <SortableIssueCard key={issue.id} issue={issue} />
                            ))}
                          </div>
                        </SortableContext>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeIssue && <SortableIssueCard issue={activeIssue} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
