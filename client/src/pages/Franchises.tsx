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
import { Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function Franchises() {
  const [showForm, setShowForm] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    cityId: "",
    commissionPercentage: "10",
  });

  const { data: franchises } = trpc.franchises.list.useQuery();
  const { data: cities } = trpc.cities.list.useQuery();
  const createFranchise = trpc.franchises.create.useMutation();
  const updateFranchise = trpc.franchises.update.useMutation();
  const deleteFranchise = trpc.franchises.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.cityId) {
      toast.error("Franchise name and city are required");
      return;
    }

    try {
      if (editingFranchise) {
        await updateFranchise.mutateAsync({
          id: editingFranchise.id,
          name: formData.name,
          cityId: parseInt(formData.cityId),
          commissionPercentage: parseFloat(formData.commissionPercentage),
        });
        toast.success("Franchise updated successfully");
      } else {
        await createFranchise.mutateAsync({
          name: formData.name,
          cityId: parseInt(formData.cityId),
          commissionPercentage: parseFloat(formData.commissionPercentage),
        });
        toast.success("Franchise created successfully");
      }
      
      setFormData({ name: "", cityId: "", commissionPercentage: "10" });
      setEditingFranchise(null);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to save franchise");
    }
  };

  const handleEdit = (franchise: any) => {
    setEditingFranchise(franchise);
    setFormData({
      name: franchise.name,
      cityId: franchise.cityId.toString(),
      commissionPercentage: franchise.commissionPercentage.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this franchise?")) {
      try {
        await deleteFranchise.mutateAsync(id);
        toast.success("Franchise deleted successfully");
      } catch (error) {
        toast.error("Failed to delete franchise");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingFranchise(null);
    setFormData({ name: "", cityId: "", commissionPercentage: "10" });
  };

  const getCityName = (cityId: number) => {
    return cities?.find((c: any) => c.id === cityId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Franchises Management</h1>
          <p className="text-slate-600 mt-2">Manage franchise operations and commissions</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Franchise
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingFranchise ? "Edit Franchise" : "Add New Franchise"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-900">Franchise Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mumbai Central Franchise"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">City *</label>
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
                <label className="text-sm font-medium text-slate-900">Commission Percentage (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.commissionPercentage}
                  onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                  placeholder="10"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1">
                {editingFranchise ? "Update Franchise" : "Create Franchise"}
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

      {/* Franchises List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {franchises && franchises.length > 0 ? (
          franchises.map((franchise: any) => (
            <Card key={franchise.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Building2 className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{franchise.name}</h3>
                    <p className="text-sm text-slate-600">{getCityName(franchise.cityId)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(franchise)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(franchise.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Commission:</span>
                  <span className="font-semibold text-slate-900">{franchise.commissionPercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Wallet Balance:</span>
                  <span className="font-semibold text-green-600">₹{parseFloat(franchise.walletBalance).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    franchise.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {franchise.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No franchises yet</p>
            <p className="text-slate-400 text-sm mt-2">Create your first franchise to expand operations</p>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="p-6 bg-purple-50 border-2 border-purple-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Franchise Management Tips</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Create Franchises:</strong> Add franchises under each city to manage independent operations.
          </p>
          <p>
            <strong>Commission Setup:</strong> Set commission percentages for each franchise to track earnings.
          </p>
          <p>
            <strong>Wallet Tracking:</strong> Monitor franchise wallet balance and earnings automatically.
          </p>
          <p>
            <strong>Franchise Admin Assignment:</strong> Assign franchise administrators to manage day-to-day operations.
          </p>
        </div>
      </Card>
    </div>
  );
}
