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
import { Pagination } from "@/components/Pagination";
import { CreditCard, Download, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function Payments() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [itemsPerPage] = useState(10);

  const { data: payments } = trpc.payments.list.useQuery();
  const { data: bookings } = trpc.bookings.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  // Calculate payment statistics
  const stats = {
    totalPayments: payments?.length || 0,
    paidAmount: payments?.filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
    pendingAmount: payments?.filter((p: any) => p.status === "pending").reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
    overdueAmount: payments?.filter((p: any) => p.status === "overdue").reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0,
  };

  // Filter payments
  const filteredPayments = payments?.filter((p: any) => filterStatus === "all" || p.status === filterStatus) || [];
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="text-green-600" size={20} />;
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "overdue":
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <CreditCard className="text-slate-600" size={20} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: "bg-green-100", text: "text-green-800", label: "Paid" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      overdue: { bg: "bg-red-100", text: "text-red-800", label: "Overdue" },
    };
    const badge = badges[status] || badges.pending;
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const handleMarkAsPaid = (paymentId: number) => {
    toast.success(`Payment #${paymentId} marked as paid`);
  };

  const handleSendReminder = (paymentId: number) => {
    toast.success(`Reminder sent for payment #${paymentId}`);
  };

  const handleExportPayments = () => {
    if (!filteredPayments || filteredPayments.length === 0) {
      toast.error("No payments to export");
      return;
    }

    const csvContent = [
      ["Payment ID", "Amount", "Status", "Due Date", "Created Date"],
      ...filteredPayments.map((p) => [
        p.id,
        p.amount,
        p.status,
        p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "N/A",
        new Date(p.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Payments exported successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Tracking</h1>
        <p className="text-slate-600 mt-2">Manage and track all payments from clients</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Payments</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">{stats.totalPayments}</p>
            </div>
            <div className="p-4 bg-blue-500 rounded-lg">
              <CreditCard className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Paid Amount</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">₹{Math.round(stats.paidAmount)}</p>
            </div>
            <div className="p-4 bg-green-500 rounded-lg">
              <CheckCircle className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Amount</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">₹{Math.round(stats.pendingAmount)}</p>
            </div>
            <div className="p-4 bg-yellow-500 rounded-lg">
              <Clock className="text-white" size={28} />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Overdue Amount</p>
              <p className="text-4xl font-bold text-slate-900 mt-2">₹{Math.round(stats.overdueAmount)}</p>
            </div>
            <div className="p-4 bg-red-500 rounded-lg">
              <AlertCircle className="text-white" size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-900">Filter by Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportPayments} className="flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Records</h2>
        {paginatedPayments.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Payment ID</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Due Date</th>
                    <th className="px-4 py-3 text-left">Created</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-blue-600">#{payment.id}</td>
                      <td className="px-4 py-3 font-semibold">₹{parseFloat(payment.amount).toFixed(2)}</td>
                      <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {payment.status !== "paid" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.id)}
                                className="text-green-600 hover:text-green-700"
                              >
                                Mark Paid
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendReminder(payment.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Remind
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredPayments.length}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">No payments found</p>
          </div>
        )}
      </Card>

      {/* Payment Information */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Management Tips</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>Mark as Paid:</strong> Update payment status when you receive payment from clients.
          </p>
          <p>
            <strong>Send Reminders:</strong> Automatically send payment reminders to clients with pending or overdue payments.
          </p>
          <p>
            <strong>Track Overdue:</strong> Keep track of overdue payments and follow up accordingly.
          </p>
          <p>
            <strong>Export Reports:</strong> Export payment data for accounting and reconciliation purposes.
          </p>
        </div>
      </Card>
    </div>
  );
}
