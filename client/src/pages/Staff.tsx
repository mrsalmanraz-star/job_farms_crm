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
import { Plus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

export default function Staff() {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    availability: "available",
    cityId: "",
    franchiseId: "",
  });

  const { data: staff } = trpc.staff.list.useQuery();
  const { data: cities } = trpc.cities.list.useQuery();
  const { data: franchises } = trpc.franchises.list.useQuery();
  const createStaff = trpc.staff.create.useMutation();
  const updateStaff = trpc.staff.update.useMutation();
  const deleteStaff = trpc.staff.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff.mutateAsync({
          id: editingStaff.id,
          ...formData,
          cityId: formData.cityId ? parseInt(formData.cityId) : undefined,
          franchiseId: formData.franchiseId ? parseInt(formData.franchiseId) : undefined,
        });
        toast.success("Staff updated successfully");
      } else {
        await createStaff.mutateAsync({
          ...formData,
          cityId: formData.cityId ? parseInt(formData.cityId) : 1,
          franchiseId: formData.franchiseId ? parseInt(formData.franchiseId) : 1,
        });
        toast.success("Staff added successfully");
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        designation: "",
        availability: "available",
        cityId: "",
        franchiseId: "",
      });
      setEditingStaff(null);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to save staff");
    }
  };

  const handleEdit = (s: any) => {
    setEditingStaff(s);
    setFormData({
      name: s.name,
      email: s.email || "",
      phone: s.phone,
      designation: s.designation || "",
      availability: s.availability,
      cityId: s.cityId.toString(),
      franchiseId: s.franchiseId.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaff.mutateAsync(id);
        toast.success("Staff deleted successfully");
      } catch (error) {
        toast.error("Failed to delete staff");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      designation: "",
      availability: "available",
      cityId: "",
      franchiseId: "",
    });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "on_leave":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Staff Management</h1>
          <p className="text-slate-600 mt-2">Manage maids and staff members</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Staff
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingStaff ? "Edit Staff" : "Add New Staff"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-900">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="10-digit phone number"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Designation</label>
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g., Maid, Cook, Nanny"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">City</label>
                <Select value={formData.cityId} onValueChange={(val) => setFormData({ ...formData, cityId: val })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city: any) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">Availability</label>
                <Select value={formData.availability} onValueChange={(val) => setFormData({ ...formData, availability: val })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1">
                {editingStaff ? "Update Staff" : "Add Staff"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff && staff.length > 0 ? (
          staff.map((s: any) => (
            <Card key={s.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Users className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                    <p className="text-sm text-slate-600">{s.designation || "Staff"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(s)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Phone:</span>
                  <span className="font-mono text-slate-900">{s.phone}</span>
                </div>
                {s.email && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Email:</span>
                    <span className="text-sm text-slate-900">{s.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Availability:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getAvailabilityColor(s.availability)}`}>
                    {s.availability.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Users size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No staff members yet</p>
            <p className="text-slate-400 text-sm mt-2">Add your first staff member to get started</p>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="p-6 bg-green-50 border-2 border-green-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Staff Management Tips</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Add Staff:</strong> Register all maids and staff members with their details and availability status.
          </p>
          <p>
            <strong>Track Availability:</strong> Update availability status to manage booking assignments efficiently.
          </p>
          <p>
            <strong>Performance Tracking:</strong> Monitor performance ratings and client feedback for each staff member.
          </p>
          <p>
            <strong>Document Management:</strong> Store and manage staff documents for compliance and verification.
          </p>
        </div>
      </Card>
    </div>
  );
}
