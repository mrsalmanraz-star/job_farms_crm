import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.list.useQuery();

  const pendingBookings = bookings?.filter((b: any) => b.status === "pending").length || 0;
  const confirmedBookings = bookings?.filter((b: any) => b.status === "confirmed").length || 0;
  const totalClients = clients?.length || 0;

  const stats = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "bg-blue-500",
      action: () => navigate("/clients"),
    },
    {
      label: "Active Bookings",
      value: confirmedBookings,
      icon: Calendar,
      color: "bg-green-500",
      action: () => navigate("/bookings"),
    },
    {
      label: "Pending Requests",
      value: pendingBookings,
      icon: AlertCircle,
      color: "bg-yellow-500",
      action: () => navigate("/bookings"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to JOB FARMS CRM System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={stat.action}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => navigate("/clients")} variant="outline" className="h-12">
            View All Clients
          </Button>
          <Button onClick={() => navigate("/bookings")} variant="outline" className="h-12">
            Manage Bookings
          </Button>
          <Button onClick={() => navigate("/billing")} variant="outline" className="h-12">
            View Billing
          </Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Bookings</h2>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings?.slice(0, 5).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{booking.bookingId}</p>
                  <p className="text-sm text-slate-600">Status: {booking.status}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                  booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-slate-100 text-slate-800"
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No bookings yet</p>
        )}
      </Card>
    </div>
  );
}
