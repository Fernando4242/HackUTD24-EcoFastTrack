"use client";

import { useState } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Fetch data function for SWR
const fetchAggregatedData = async (timeFilter: string) => {
  const response = await fetch(`/api/aggregated-data?timeFilter=${timeFilter}`);
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

export function Charts() {
  // Manage the selected time filter
  const [timeFilter, setTimeFilter] = useState("all-time");

  // Fetch data with the selected time filter
  const { data, error } = useSWR(
    `/api/aggregated-data?timeFilter=${timeFilter}`,
    () => fetchAggregatedData(timeFilter),
    {
      refreshInterval: 10000, // 10 seconds interval
    }
  );

  if (error) {
    return <div>Error fetching data</div>;
  }

  if (!data) {
    // Display loading screen
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-t-transparent border-solid rounded-full"></div>
      </div>
    );
  }

  // Transform data for each chart
  const transformData = (dataArray) =>
    dataArray.map((entry) => ({
      timestamp: new Date(entry.timestamp).toLocaleTimeString(),
      data: Number(entry.data),
    }));

  const transformedData = {
    solar: transformData(data.solar),
    water: transformData(data.water),
    temperature: transformData(data.temperature),
  };

  // Chart configurations
  const chartConfigs = {
    water: {
      label: "Water",
      color: "hsl(var(--chart-2))",
    },
    solar: {
      label: "Solar",
      color: "hsl(var(--chart-1))",
    },
    temperature: {
      label: "Temperature",
      color: "hsl(var(--chart-3))",
    },
  } satisfies Record<string, ChartConfig>;

  const renderChart = (dataKey, title, description) => {
    const chartData = transformedData[dataKey];
    const isEmptyData = !chartData || chartData.length === 0;

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfigs[dataKey]}>
            {isEmptyData ? (
              <div className="flex justify-center items-center h-[300px] text-red-500 text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12" y2="16"></line>
                  </svg>
                  No data available. The sensor may not be working.
                </span>
              </div>
            ) : (
              <LineChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  dataKey="data"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="data"
                  type="natural"
                  stroke={chartConfigs[dataKey].color}
                  strokeWidth={2}
                  dot={{
                    fill: chartConfigs[dataKey].color,
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            )}
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none text-muted-foreground">
                Timestamp-based {dataKey} data
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div>
      <div className="mb-4 w-[300px]">
        {/* Time Filter Selector */}
        <Select onValueChange={(value) => setTimeFilter(value)} defaultValue={timeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-time">All Time</SelectItem>
            <SelectItem value="last-10-minutes">Last 10 minutes</SelectItem>
            <SelectItem value="last-hour">Last Hour</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderChart("water", "Water Data", "Displaying water sensor data")}
        {renderChart("solar", "Solar Data", "Displaying solar sensor data")}
        {renderChart(
          "temperature",
          "Temperature Data",
          "Displaying temperature sensor data"
        )}
      </div>
    </div>
  );
}
