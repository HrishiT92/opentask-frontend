import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ActivityTimelineProps {
  entityId: string;
  entityType: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ entityId, entityType }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/activity/${entityType}/${entityId}`);
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [entityId, entityType]);

  if (isLoading) {
    return <div>Loading activity...</div>;
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return '➕';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      case 'assigned': return '👤';
      case 'status_changed': return '🔄';
      case 'commented': return '💬';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      case 'assigned': return 'text-purple-600';
      case 'status_changed': return 'text-orange-600';
      case 'commented': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Activity Timeline</h3>
      
      {activities.length === 0 ? (
        <p className="text-gray-500">No activity recorded</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getActionIcon(activity.action)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {activity.user.firstName} {activity.user.lastName}
                      </span>
                      <span className={`text-sm ${getActionColor(activity.action)}`}>
                        {activity.action.replace('_', ' ')}
                      </span>
                    </div>
                    {activity.details && (
                      <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
