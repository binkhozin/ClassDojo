import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BehaviorWithDetails } from "../../../types";
import { format, subDays, isSameDay } from "date-fns";

interface BehaviorTrendChartProps {
  behaviors: BehaviorWithDetails[];
}

export const BehaviorTrendChart: React.FC<BehaviorTrendChartProps> = ({
  behaviors,
}) => {
  // Generate last 7 days data
  const data = Array.from({ length: 7 })
    .map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayBehaviors = behaviors.filter((b) =>
        isSameDay(new Date(b.created_at!), date)
      );
      
      return {
        name: format(date, "MMM d"),
        positive: dayBehaviors.filter((b) => b.points > 0).length,
        negative: dayBehaviors.filter((b) => b.points < 0).length,
      };
    });

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: "8px", 
              border: "1px solid hsl(var(--border))",
              backgroundColor: "hsl(var(--background))"
            }}
          />
          <Line
            type="monotone"
            dataKey="positive"
            stroke="#22c55e"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line 
            type="monotone" 
            dataKey="negative" 
            stroke="#ef4444" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
