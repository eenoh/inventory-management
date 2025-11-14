"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";



interface ChartData {
  week: String;
  products: Number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>

      <p className="text-sm text-gray-900 mt-1">
        <span className="font-semibold">Products: </span>
        {payload[0].value}
      </p>
    </div>
  );
};

export default function ProductChart({data} : {data: ChartData[]}) {
  console.log(data);
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{top:5, right: 30, left: 20, bottom: 5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="week" 
              stroke="#666" 
              fontSize={12} 
              tickLine={true} 
              axisLine={true} 
            />
            <YAxis 
              stroke="#666" 
              fontSize={12} 
              tickLine={true} 
              axisLine={true} 
              allowDecimals={false}
            />

            <Area 
              type="monotone" 
              dataKey="products" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.2} 
              strokeWidth={2} 
              dot={{fill: "#8b5cf6", r:2}} 
              activeDot={{fill: "#8b5cf6", r:4}} 
            />

            <Tooltip
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#374151", fontWeight: "500" }}
              />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}