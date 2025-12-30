import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Edit2, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Bookings() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    clientId: "",
    serviceId: "",
    salaryMin: "",
    salaryMax: "",
    workProfile: "",
    notes: "",
  });

  const { data: bookings, refetch } = trpc.bookings.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();
  const createMutation = trpc.bookings.create.useMutation();
  const updateMutation = trpc.bookings.update.useMutation();

  const filteredBookings = selectedStatus === "all"
    ? bookings
    : bookings?.filter((b: any) => b.status === selectedStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        clientId: parseInt(formData.clientId),
        serviceId: parseInt(formData.serviceId),
        salaryMin: parseFloat(formData.salaryMin),
        salaryMax: parseFloat(formData.salaryMax),
        workProfile: formData.workProfile,
        notes: formData.notes,
      });
      toast.success("Booking created successfully");
      setIsOpen(false);
      setFormData({
        clientId: "",
        serviceId: "",
        salaryMin: "",
        salaryMax: "",
        workProfile: "",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create booking");
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({
        id: bookingId,
        status: newStatus as any,
      });
      toast.success("Booking status updated");
      refetch();
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-slate-100 text-slate-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-600 mt-2">Manage service bookings and requests</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" size={20} />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
              <DialogDescription>
                Create a new service booking request
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client *</label>
                  <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Service *</label>
                  <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services?.map((s: any) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Salary Min *</label>
                  <Input
                    type="number"
                    required
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="Minimum salary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Salary Max *</label>
                  <Input
                    type="number"
                    required
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="Maximum salary"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Work Profile</label>
                <Input
                  value={formData.workProfile}
                  onChange={(e) => setFormData({ ...formData, workProfile: e.target.value })}
                  placeholder="Job profile description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Create Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Status */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "in_progress", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            onClick={() => setSelectedStatus(status)}
            size="sm"
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Booking ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Salary Range</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredBookings?.map((booking: any) => (
              <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{booking.bookingId}</td>
                <td className="px-6 py-4">
                  <Select value={booking.status} onValueChange={(value) => handleStatusChange(booking.id, value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  ₹{booking.salaryMin} - ₹{booking.salaryMax}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Button variant="ghost" size="sm">
                    <Eye size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No bookings found. Create one to get started.</p>
        </Card>
      )}
    </div>
  );
}
