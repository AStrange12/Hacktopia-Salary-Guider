"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

type SpendingSplitCardProps = {
  needs: number;
  wants: number;
  savings: number;
  income: number;
};

export default function SpendingSplitCard({ needs, wants, savings, income }: SpendingSplitCardProps) {
  const chartData = [
    { name: "Needs", value: needs, fill: "hsl(var(--chart-1))" },
    { name: "Wants", value: wants, fill: "hsl(var(--chart-2))" },
    { name: "Savings", value: savings, fill: "hsl(var(--chart-3))" },
  ];

  const chartConfig = {
    value: {
      label: "Amount",
    },
    Needs: {
      label: "Needs",
      color: "hsl(var(--chart-1))",
    },
    Wants: {
      label: "Wants",
      color: "hsl(var(--chart-2))",
    },
    Savings: {
      label: "Savings",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const totalSpent = needs + wants;
  const hasData = totalSpent > 0 || savings > 0;

  return (
    <Card className="flex flex-col lg:col-span-3">
      <CardHeader>
        <CardTitle>Spending Split (This Month)</CardTitle>
        <CardDescription>Based on the 50/30/20 rule</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {hasData ? (
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14">
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    );
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Legend
                  content={({ payload }) => {
                    return (
                      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
                        {payload?.map((entry, index) => (
                           <li key={`item-${index}`} className="flex items-center gap-2">
                             <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                             <span>{entry.value}</span>
                           </li>
                        ))}
                      </ul>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] flex-col items-center justify-center space-y-2 text-center">
            <p className="text-muted-foreground">No data for this month.</p>
            <p className="text-sm text-muted-foreground">Add expenses to see your spending split.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
