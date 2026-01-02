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
import { FileText, Download, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Invoices() {
  const [selectedBooking, setSelectedBooking] = useState("");
  const [invoicePreview, setInvoicePreview] = useState<any>(null);

  const { data: bookings } = trpc.bookings.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: config } = trpc.admin.getConfig.useQuery();

  const generateInvoice = () => {
    if (!selectedBooking) {
      toast.error("Please select a booking");
      return;
    }

    const booking = bookings?.find((b) => b.bookingId === selectedBooking);
    const client = clients?.find((c) => c.id === booking?.clientId);

    if (!booking || !client) {
      toast.error("Booking or client not found");
      return;
    }

    // Calculate invoice details
    const salaryMin = parseFloat(booking.salaryMin);
    const commission = salaryMin;
    const gstAmount = Math.round(commission * (Number(config?.gstRate) || 18) / 100 * 100) / 100;
    const totalAmount = commission + gstAmount;

    const invoice = {
      invoiceNumber: `INV-${booking.bookingId}`,
      date: new Date().toLocaleDateString(),
      booking,
      client,
      commission,
      gstAmount,
      totalAmount,
    };

    setInvoicePreview(invoice);
    toast.success("Invoice generated successfully");
  };

  const downloadPDF = () => {
    if (!invoicePreview) {
      toast.error("Please generate an invoice first");
      return;
    }

    // Create a simple HTML representation for PDF
    const htmlContent = `
      <html>
        <head>
          <title>Invoice ${invoicePreview.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-number { font-size: 24px; font-weight: bold; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 18px; }
            table { width: 100%; margin: 20px 0; }
            th { text-align: left; padding: 10px; background: #f0f0f0; }
            td { padding: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="invoice-number">${invoicePreview.invoiceNumber}</div>
            <p>${config?.companyName || "JOB FARMS"}</p>
            <p>${config?.officeAddress || "Office Address"}</p>
          </div>

          <div class="details">
            <h3>Bill To:</h3>
            <p><strong>${invoicePreview.client.name}</strong></p>
            <p>Phone: ${invoicePreview.client.phone}</p>
            <p>Email: ${invoicePreview.client.email || "N/A"}</p>
          </div>

          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Service Commission</td>
              <td>₹${invoicePreview.commission.toFixed(2)}</td>
            </tr>
            <tr>
              <td>GST (${config?.gstRate}%)</td>
              <td>₹${invoicePreview.gstAmount.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td>Total Amount</td>
              <td>₹${invoicePreview.totalAmount.toFixed(2)}</td>
            </tr>
          </table>

          <div class="details">
            <p><strong>Invoice Date:</strong> ${invoicePreview.date}</p>
            <p><strong>Booking ID:</strong> ${invoicePreview.booking.bookingId}</p>
            <p><strong>Status:</strong> ${invoicePreview.booking.status}</p>
          </div>

          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Thank you for your business!</p>
            <p>${config?.officePhone1 || "Phone"} | ${config?.officeEmail || "Email"}</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoicePreview.invoiceNumber}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Invoice downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoice Management</h1>
        <p className="text-slate-600 mt-2">Generate and manage invoices for bookings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Generation Form */}
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FileText className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Generate Invoice</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900">Select Booking *</label>
              <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings?.map((booking) => (
                    <SelectItem key={booking.id} value={booking.bookingId}>
                      {booking.bookingId} - Client #{booking.clientId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={generateInvoice} size="lg" className="w-full">
              <FileText className="mr-2" size={18} />
              Generate Invoice
            </Button>
          </div>

          {/* Invoice Information */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Details</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                <strong>Invoice Number:</strong> Auto-generated from booking ID
              </p>
              <p>
                <strong>Items Included:</strong>
              </p>
              <ul className="ml-4 space-y-1">
                <li>✓ Service commission</li>
                <li>✓ GST calculation ({config?.gstRate}%)</li>
                <li>✓ Total amount due</li>
                <li>✓ Client and booking details</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Invoice Preview */}
        <Card className="p-8 bg-gradient-to-br from-slate-50 to-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Invoice Preview</h2>

          {invoicePreview ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-slate-200 shadow-sm">
                {/* Invoice Header */}
                <div className="text-center mb-6 pb-6 border-b-2">
                  <p className="text-sm text-slate-600">{config?.companyName || "JOB FARMS"}</p>
                  <p className="text-2xl font-bold text-slate-900">{invoicePreview.invoiceNumber}</p>
                  <p className="text-xs text-slate-500 mt-2">{invoicePreview.date}</p>
                </div>

                {/* Bill To */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Bill To</p>
                  <p className="font-bold text-slate-900">{invoicePreview.client.name}</p>
                  <p className="text-sm text-slate-600">{invoicePreview.client.phone}</p>
                </div>

                {/* Invoice Items */}
                <table className="w-full mb-6">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 text-slate-700">Service Commission</td>
                      <td className="py-2 text-right font-semibold">₹{invoicePreview.commission.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 text-slate-700">GST ({config?.gstRate}%)</td>
                      <td className="py-2 text-right font-semibold">₹{invoicePreview.gstAmount.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="py-3 font-bold text-slate-900">Total Amount</td>
                      <td className="py-3 text-right font-bold text-blue-600 text-lg">₹{invoicePreview.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer */}
                <div className="text-xs text-slate-500 text-center pt-4 border-t">
                  <p>Booking ID: {invoicePreview.booking.bookingId}</p>
                  <p>Status: {invoicePreview.booking.status}</p>
                </div>
              </div>

              <Button onClick={downloadPDF} size="lg" className="w-full flex items-center justify-center gap-2">
                <Download size={18} />
                Download Invoice
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] text-center">
              <div>
                <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Select a booking and click "Generate Invoice" to see preview</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Invoices</h3>
        {bookings && bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left">Invoice #</th>
                  <th className="px-4 py-2 text-left">Client</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => {
                  const client = clients?.find((c) => c.id === booking.clientId);
                  const amount = parseFloat(booking.salaryMin) + Math.round(parseFloat(booking.salaryMin) * (Number(config?.gstRate) || 18) / 100 * 100) / 100;
                  return (
                    <tr key={booking.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2 font-mono text-blue-600">INV-{booking.bookingId}</td>
                      <td className="px-4 py-2">{client?.name || "Unknown"}</td>
                      <td className="px-4 py-2 font-semibold">₹{amount.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Button variant="ghost" size="sm" className="flex items-center gap-1">
                          <Eye size={16} />
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">No invoices available</p>
        )}
      </Card>
    </div>
  );
}
