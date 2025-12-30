import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const { data: config, refetch } = trpc.admin.getConfig.useQuery();
  const updateMutation = trpc.admin.updateConfig.useMutation();

  const [formData, setFormData] = useState({
    gstRate: "",
    trialFee: "",
    officeAddress: "",
    officePhone1: "",
    officePhone2: "",
    officeEmail: "",
    website: "",
    companyName: "",
  });

  useEffect(() => {
    if (config) {
      setFormData({
        gstRate: config.gstRate ? String(config.gstRate) : "",
        trialFee: config.trialFee ? String(config.trialFee) : "",
        officeAddress: config.officeAddress || "",
        officePhone1: config.officePhone1 || "",
        officePhone2: config.officePhone2 || "",
        officeEmail: config.officeEmail || "",
        website: config.website || "",
        companyName: config.companyName || "",
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        gstRate: formData.gstRate ? parseFloat(formData.gstRate) : undefined,
        trialFee: formData.trialFee ? parseFloat(formData.trialFee) : undefined,
        officeAddress: formData.officeAddress || undefined,
        officePhone1: formData.officePhone1 || undefined,
        officePhone2: formData.officePhone2 || undefined,
        officeEmail: formData.officeEmail || undefined,
        website: formData.website || undefined,
        companyName: formData.companyName || undefined,
      });
      toast.success("Settings updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-600 mt-2">Configure billing rates and office information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Configuration */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500 rounded-lg">
              <SettingsIcon className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Billing Configuration</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-900">GST Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.gstRate}
                onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
                placeholder="18.00"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Goods and Services Tax rate applied to commissions</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900">Trial Fee (₹)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.trialFee}
                onChange={(e) => setFormData({ ...formData, trialFee: e.target.value })}
                placeholder="199.00"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Fixed fee charged for trial bookings</p>
            </div>
          </div>
        </Card>

        {/* Company Information */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Company Information</h2>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900">Company Name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="JOB FARMS"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Office Address</label>
              <Textarea
                value={formData.officeAddress}
                onChange={(e) => setFormData({ ...formData, officeAddress: e.target.value })}
                placeholder="Enter full office address"
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-900">Office Phone 1</label>
                <Input
                  value={formData.officePhone1}
                  onChange={(e) => setFormData({ ...formData, officePhone1: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900">Office Phone 2</label>
                <Input
                  value={formData.officePhone2}
                  onChange={(e) => setFormData({ ...formData, officePhone2: e.target.value })}
                  placeholder="+91 XXXXXXXXXX"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-900">Office Email</label>
                <Input
                  type="email"
                  value={formData.officeEmail}
                  onChange={(e) => setFormData({ ...formData, officeEmail: e.target.value })}
                  placeholder="info@jobfarms.com"
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900">Website</label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://jobfarms.com"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={updateMutation.isPending}>
            <Save className="mr-2" size={20} />
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>

      {/* Information Card */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Important Information</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>GST Rate is applied to all commissions calculated in the billing system</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Trial Fee is charged as a fixed amount for trial bookings</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Company information is used in generated documents and communications</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Changes to these settings will apply to all future bookings and calculations</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
