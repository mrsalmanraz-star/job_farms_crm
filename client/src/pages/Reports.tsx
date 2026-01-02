import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, TrendingUp, Users, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");
  const [selectedService, setSelectedService] = useState("all");

  const { data: bookings } = trpc.bookings.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: config } = trpc.admin.getConfig.useQuery();

  // Calculate statistics
  const stats = {
    totalBookings: bookings?.length || 0,
    totalClients: clients?.length || 0,
    activeBookings: bookings?.filter((b) => b.status === "confirmed").length || 0,
    pendingBookings: bookings?.filter((b) => b.status === "pending").length || 0,
  };

  // Prepare chart data
  const bookingsByStatus = [
    { name: "Pending", value: stats.pendingBookings, color: "#f59e0b" },
    { name: "Confirmed", value: stats.activeBookings, color: "#10b981" },
    { name: "Completed", value: bookings?.filter((b) => b.status === "completed").length || 0, color: "#3b82f6" },
    { name: "Cancelled", value: bookings?.filter((b) => b.status === "cancelled").length || 0, color: "#ef4444" },
  ];

  const monthlyData = [
    { month: "Jan", bookings: 12, revenue: 45000 },
    { month: "Feb", bookings: 19, revenue: 68000 },
    { month: "Mar", bookings: 15, revenue: 54000 },
    { month: "Apr", bookings: 25, revenue: 89000 },
    { month: "May", bookings: 22, revenue: 78000 },
    { month: "Jun", bookings: 28, revenue: 98000 },
  ];

  const handleExport = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No bookings to export");
      return;
    }

    const csvContent = [
      ["Booking ID", "Client ID", "Service ID", "Status", "Created Date"],
      ...bookings.map((b) => [
        b.bookingId,
        b.clientId,
        b.serviceId,
        b.status,
        new Date(b.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Bookings exported successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-2">View comprehensive booking and revenue analytics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Bookings</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-lg">
              <Calendar className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Active Bookings</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.activeBookings}</p>
            </div>
            <div className="p-4 bg-green-500 rounded-lg">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Clients</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.totalClients}</p>
            </div>
            <div className="p-4 bg-purple-500 rounded-lg">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Requests</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.pendingBookings}</p>
            </div>
            <div className="p-4 bg-orange-500 rounded-lg">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Status Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {bookingsByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Bookings Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Bookings Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Export Section */}
      <Card className="p-6 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Export Data</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download size={18} />
            Export Bookings as CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            Export Clients as CSV
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            Generate PDF Report
          </Button>
        </div>
      </Card>

      {/* Filter Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-900">Date Range</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">Service Type</label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="day-maid-10">Day Maid 10 Hours</SelectItem>
                <SelectItem value="day-maid-12">Day Maid 12 Hours</SelectItem>
                <SelectItem value="live-in">24-Hour Live-In</SelectItem>
                <SelectItem value="cook">Cook</SelectItem>
                <SelectItem value="nanny">Nanny</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Key Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-slate-600">Average Bookings per Month</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {Math.round((monthlyData.reduce((sum, m) => sum + m.bookings, 0) / monthlyData.length) * 10) / 10}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Average Revenue per Month</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              ₹{Math.round(monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length)}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Booking Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {stats.totalBookings > 0 ? Math.round((bookings?.filter((b) => b.status === "completed").length || 0) / stats.totalBookings * 100) : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
