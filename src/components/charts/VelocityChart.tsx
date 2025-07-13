import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VelocityData {
  sprintName: string;
  plannedPoints: number;
  completedPoints: number;
  velocity: number;
}

interface VelocityChartProps {
  data: VelocityData[];
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">Team Velocity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="sprintName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="plannedPoints" 
            stroke="#8884d8" 
            name="Planned Points"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="completedPoints" 
            stroke="#82ca9d" 
            name="Completed Points"
          />
          <Line 
            type="monotone" 
            dataKey="velocity" 
            stroke="#ffc658" 
            name="Velocity"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
