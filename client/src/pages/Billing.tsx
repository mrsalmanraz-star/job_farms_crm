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
import { Calculator, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Billing() {
  const [salary, setSalary] = useState("");
  const [billingType, setBillingType] = useState("standard");
  const [calculatedBilling, setCalculatedBilling] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const { data: config } = trpc.admin.getConfig.useQuery();

  const handleCalculate = async () => {
    if (!salary) {
      toast.error("Please enter a salary amount");
      return;
    }

    setIsPending(true);
    try {
      const utils = trpc.useUtils();
      const result = await utils.billing.calculate.fetch({
        salary: parseFloat(salary),
        type: billingType as "standard" | "japa" | "trial",
      });
      setCalculatedBilling(result);
    } catch (error) {
      toast.error("Failed to calculate billing");
    } finally {
      setIsPending(false);
    }
  };

  const getBillingDescription = (type: string) => {
    switch (type) {
      case "standard":
        return "Standard billing: Full commission on salary";
      case "japa":
        return "JAPA billing: 50% commission on salary";
      case "trial":
        return "Trial billing: 1/30th of salary + trial fee";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
        <p className="text-slate-600 mt-2">Calculate commissions and manage payments</p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500 rounded-lg">
            <Calculator className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Billing Calculator</h2>
            <p className="text-slate-600">Calculate commission and GST</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-900">Salary Amount *</label>
            <Input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Enter salary amount"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-900">Billing Type *</label>
            <Select value={billingType} onValueChange={setBillingType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="japa">JAPA</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCalculate} className="w-full" disabled={isPending}>
              Calculate
            </Button>
          </div>
        </div>

        <p className="text-sm text-slate-600 mt-4">{getBillingDescription(billingType)}</p>
      </Card>

      {calculatedBilling && (
        <Card className="p-8 border-2 border-green-200 bg-green-50">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Calculation Result</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">Base Salary</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">₹{salary}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">Commission</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">₹{Number(calculatedBilling.commission).toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm">GST ({config?.gstRate}%)</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">₹{Number(calculatedBilling.gstAmount).toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-green-300 shadow-lg">
              <p className="text-slate-600 text-sm font-semibold">Total Amount</p>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{Number(calculatedBilling.totalAmount).toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Current System Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-600 text-sm">GST Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{config?.gstRate}%</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-600 text-sm">Trial Fee</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">₹{config?.trialFee}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-600 text-sm">Company Name</p>
            <p className="text-lg font-bold text-slate-900 mt-2">{config?.companyName || "JOB FARMS"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Billing Information</h3>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            <strong>Standard Billing:</strong> Full commission is charged on the base salary amount.
          </p>
          <p>
            <strong>JAPA Billing:</strong> 50% of the standard commission is charged.
          </p>
          <p>
            <strong>Trial Billing:</strong> A fixed trial fee is charged plus 1/30th of the base salary.
          </p>
          <p className="mt-4 p-3 bg-white rounded border border-blue-200">
            <strong>Note:</strong> GST is calculated on the commission amount and added to the total.
          </p>
        </div>
      </Card>
    </div>
  );
}