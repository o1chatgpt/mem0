"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts"

// Define common props for all chart types
interface ChartProps {
  data: any[]
  index: string
  valueFormatter?: (value: number) => string
}

// Bar Chart
interface BarChartProps extends ChartProps {
  categories: string[]
  colors?: string[]
  layout?: "horizontal" | "vertical"
  customTooltip?: (props: any) => JSX.Element | null
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
  valueFormatter = (value) => `${value}`,
  layout = "horizontal",
  customTooltip,
}: BarChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} layout={layout} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {layout === "horizontal" ? (
          <>
            <XAxis dataKey={index} />
            <YAxis tickFormatter={valueFormatter} />
          </>
        ) : (
          <>
            <XAxis type="number" tickFormatter={valueFormatter} />
            <YAxis type="category" dataKey={index} width={100} />
          </>
        )}
        <Tooltip formatter={(value: number) => valueFormatter(value)} content={customTooltip} />
        <Legend />
        {categories.map((category, i) => (
          <Bar key={category} dataKey={category} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

// Line Chart
interface LineChartProps extends ChartProps {
  categories: string[]
  colors?: string[]
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
  valueFormatter = (value) => `${value}`,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={(value: number) => valueFormatter(value)} />
        <Legend />
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[i % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

// Area Chart
interface AreaChartProps extends ChartProps {
  categories: string[]
  colors?: string[]
}

export function AreaChart({
  data,
  index,
  categories,
  colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"],
  valueFormatter = (value) => `${value}`,
}: AreaChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsAreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={index} />
        <YAxis tickFormatter={valueFormatter} />
        <Tooltip formatter={(value: number) => valueFormatter(value)} />
        <Legend />
        {categories.map((category, i) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            fill={colors[i % colors.length]}
            stroke={colors[i % colors.length]}
            fillOpacity={0.3}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
}

// Pie Chart
interface PieChartProps extends ChartProps {
  category: string
  colors?: string[]
}

export function PieChart({
  data,
  index,
  category,
  colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#6b7280",
    "#ec4899",
    "#14b8a6",
    "#f43f5e",
    "#84cc16",
  ],
  valueFormatter = (value) => `${value}`,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => valueFormatter(value)} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}

// Donut Chart
interface DonutChartProps extends ChartProps {
  category: string
  colors?: string[]
}

export function DonutChart({
  data,
  index,
  category,
  colors = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#6b7280",
    "#ec4899",
    "#14b8a6",
    "#f43f5e",
    "#84cc16",
  ],
  valueFormatter = (value) => `${value}`,
}: DonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          innerRadius={40}
          fill="#8884d8"
          dataKey={category}
          nameKey={index}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => valueFormatter(value)} />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
