import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BurndownData {
  day: string;
  remainingWork: number;
  idealBurndown: number;
  actualBurndown: number;
}

interface BurndownChartProps {
  data: BurndownData[];
  sprintName: string;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({ data, sprintName }) => {
  return (
    <div className="w-full h-80">
      <h3 className="text-lg font-semibold mb-4">Sprint Burndown - {sprintName}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="idealBurndown" 
            stroke="#8884d8" 
            name="Ideal Burndown"
            strokeDasharray="5 5"
          />
          <Line 
            type="monotone" 
            dataKey="actualBurndown" 
            stroke="#82ca9d" 
            name="Actual Burndown"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="remainingWork" 
            stroke="#ff7300" 
            name="Remaining Work"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
