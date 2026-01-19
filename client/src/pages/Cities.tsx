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
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Cities() {
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    gstRate: "18",
  });

  const { data: cities } = trpc.cities.list.useQuery();
  const createCity = trpc.cities.create.useMutation();
  const updateCity = trpc.cities.update.useMutation();
  const deleteCity = trpc.cities.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("City name is required");
      return;
    }

    try {
      if (editingCity) {
        await updateCity.mutateAsync({
          id: editingCity.id,
          ...formData,
          gstRate: parseFloat(formData.gstRate),
        });
        toast.success("City updated successfully");
      } else {
        await createCity.mutateAsync({
          ...formData,
          gstRate: parseFloat(formData.gstRate),
        });
        toast.success("City created successfully");
      }
      
      setFormData({ name: "", state: "", gstRate: "18" });
      setEditingCity(null);
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to save city");
    }
  };

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      state: city.state || "",
      gstRate: city.gstRate.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      try {
        await deleteCity.mutateAsync(id);
        toast.success("City deleted successfully");
      } catch (error) {
        toast.error("Failed to delete city");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCity(null);
    setFormData({ name: "", state: "", gstRate: "18" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cities Management</h1>
          <p className="text-slate-600 mt-2">Manage cities and franchise locations</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add City
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingCity ? "Edit City" : "Add New City"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-900">City Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Mumbai, Bangalore"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g., Maharashtra"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900">GST Rate (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.gstRate}
                  onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                  placeholder="18"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1">
                {editingCity ? "Update City" : "Create City"}
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

      {/* Cities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities && cities.length > 0 ? (
          cities.map((city: any) => (
            <Card key={city.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{city.name}</h3>
                    <p className="text-sm text-slate-600">{city.state || "N/A"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(city)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(city.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">GST Rate:</span>
                  <span className="font-semibold text-slate-900">{city.gstRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    city.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {city.status}
                  </span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <MapPin size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No cities yet</p>
            <p className="text-slate-400 text-sm mt-2">Create your first city to get started</p>
          </Card>
        )}
      </div>

      {/* Information Card */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">City Management Tips</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Create Cities:</strong> Add new cities to expand your franchise network across different locations.
          </p>
          <p>
            <strong>GST Configuration:</strong> Set city-specific GST rates for accurate billing and compliance.
          </p>
          <p>
            <strong>City Admin Assignment:</strong> Assign city administrators to manage operations in each city independently.
          </p>
          <p>
            <strong>Multi-City Dashboard:</strong> Super Admin can view consolidated reports across all cities.
          </p>
        </div>
      </Card>
    </div>
  );
}
