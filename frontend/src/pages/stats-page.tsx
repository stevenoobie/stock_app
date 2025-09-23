import { useEffect, useState } from "react";
import axios from "axios";
import { API_URLS } from "@/constants/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface StatsResponse {
  totalSales: number;
  totalExpenses: number;
  profit: number;
  weights: {
    gold: number;
    silver: number;
    copper: number;
  };
  dailyData: [
    {
      date: Date;
      sales: number;
      profit: number;
    }
  ];
}

function StatsPage() {
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  );

  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_URLS.EXPENSES}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const materialData = stats?.weights
    ? [
        { name: "Gold", value: stats.weights.gold || 0 },
        { name: "Silver", value: stats.weights.silver || 0 },
        { name: "Copper", value: stats.weights.copper || 0 },
      ]
    : [];

  const totalSales = stats?.totalSales;
  const profit = stats?.profit;
  const profitPieData = [
    { name: "Total Sales", value: totalSales, color: "#FF3333" },
    { name: "Profit", value: profit, color: "#22C55E" },
  ];
  const COLORS = ["#FFD700", "#C0C0C0", "#B87333"];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Business Stats</h1>

      {/* Date filters */}
      <div className="flex gap-4">
        {/* Start Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick start date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
            />
          </PopoverContent>
        </Popover>

        {/* End Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick end date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardContent className="flex flex-col">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <h6 className="font-bold">Total Sales</h6>
                  <p className="text-2xl">${stats.totalSales.toFixed(2)}</p>
                </div>
                <div>
                  <h6 className="font-bold">Total Expenses</h6>
                  <p className="text-2xl">${stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div>
                  <h6 className="font-bold">Profit</h6>
                  <p className="text-2xl">${stats.profit.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Total Sales Vs Profit</CardTitle>
              <div className="text-xs bg-gray-100 dark:text-white dark:bg-gray-800 p-2 rounded-md font-bold">
                <div>
                  Profit Margin:{" "}
                  {stats.totalSales > 0
                    ? ((stats.profit * 100) / stats.totalSales).toFixed(2)
                    : "0.00"}{" "}
                  %
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {profitPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={_.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <Card className="h-[500px]">
        <CardHeader>
          <CardTitle>Sales vs Profit Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}}>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.dailyData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="#22C55E"
                    fill="#22C55E"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Bar Chart: Sales vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Sales vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Stats",
                        Sales: stats?.totalSales || 0,
                        Expenses: stats?.totalExpenses || 0,
                      },
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="Sales" fill="#89CFF0" radius={4} />
                    <Bar dataKey="Expenses" fill="#FF6B6B" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Material Weights */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Material Weights Sold (grams)</CardTitle>
            {stats && (
              <div className="text-xs bg-gray-100 dark:text-white dark:bg-gray-800 p-2 rounded-md font-bold">
                <div>Gold: {stats.weights.gold.toFixed(1)} g</div>
                <div>Silver: {stats.weights.silver.toFixed(1)} g</div>
                <div>Copper: {stats.weights.copper.toFixed(1)} g</div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {materialData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default StatsPage;
