import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function Clients() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile1: "",
    mobile2: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const { data: clients, refetch } = trpc.clients.list.useQuery();
  const createMutation = trpc.clients.create.useMutation();
  const updateMutation = trpc.clients.update.useMutation();
  const deleteMutation = trpc.clients.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...formData });
        toast.success("Client updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Client created successfully");
      }
      setIsOpen(false);
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        mobile1: "",
        mobile2: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to save client");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Client deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete client");
      }
    }
  };

  const handleEdit = (client: any) => {
    setEditingId(client.id);
    setFormData({
      name: client.name,
      email: client.email || "",
      mobile1: client.mobile1,
      mobile2: client.mobile2 || "",
      address: client.address || "",
      city: client.city || "",
      state: client.state || "",
      zipCode: client.zipCode || "",
      notes: client.notes || "",
    });
    setIsOpen(true);
  };

  const openNewClientDialog = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      mobile1: "",
      mobile2: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-2">Manage your client database</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewClientDialog}>
              <Plus className="mr-2" size={20} />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                Fill in the client details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile 1 *</label>
                  <Input
                    required
                    value={formData.mobile1}
                    onChange={(e) => setFormData({ ...formData, mobile1: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile 2</label>
                  <Input
                    value={formData.mobile2}
                    onChange={(e) => setFormData({ ...formData, mobile2: e.target.value })}
                    placeholder="Alternative mobile"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ZIP Code</label>
                  <Input
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="ZIP"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Update" : "Create"} Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client: any) => (
          <Card key={client.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{client.name}</h3>
                <span className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                  client.status === "active" ? "bg-green-100 text-green-800" :
                  client.status === "inactive" ? "bg-yellow-100 text-yellow-800" :
                  "bg-slate-100 text-slate-800"
                }`}>
                  {client.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(client)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Edit2 size={18} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Phone size={16} />
                <span>{client.mobile1}</span>
              </div>
              {client.mobile2 && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} />
                  <span>{client.mobile2}</span>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={16} />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {clients?.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-600">No clients yet. Create one to get started.</p>
        </Card>
      )}
    </div>
  );
}
