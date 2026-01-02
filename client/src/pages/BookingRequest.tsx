import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function BookingRequest() {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [salary, setSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: config } = trpc.admin.getConfig.useQuery();

  const generateMessage = () => {
    if (!clientName || !clientPhone || !serviceType || !salary) {
      toast.error("Please fill all required fields");
      return;
    }

    const serviceNames: Record<string, string> = {
      "day-maid-10": "Day Maid (10 Hours)",
      "day-maid-12": "Day Maid (12 Hours)",
      "live-in": "24-Hour Live-In",
      cook: "Cook",
      nanny: "Nanny",
      elderly: "Elderly Care",
    };

    const message = `Hello ${clientName},

Thank you for choosing JOB FARMS for your service needs!

📋 *Booking Details:*
• Service: ${serviceNames[serviceType] || serviceType}
• Salary Range: ₹${salary}
• Status: Pending Confirmation

${notes ? `📝 *Special Notes:*\n${notes}\n` : ""}
Our team will review your request and confirm within 24 hours.

📞 Contact: ${config?.officePhone1 || "+91 XXXXXXXXXX"}
🌐 Website: ${config?.website || "www.jobfarms.com"}
📧 Email: ${config?.officeEmail || "info@jobfarms.com"}

Thank you for your trust!
${config?.companyName || "JOB FARMS"} Team`;

    setGeneratedMessage(message);
    toast.success("Message generated successfully");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    toast.success("Message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    if (!generatedMessage) {
      toast.error("Please generate a message first");
      return;
    }

    const phoneNumber = clientPhone.replace(/\D/g, "");
    const encodedMessage = encodeURIComponent(generatedMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Booking Request Generator</h1>
        <p className="text-slate-600 mt-2">Create and send WhatsApp booking requests to clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Section */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Booking Details</h2>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-slate-900">Client Name *</label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Phone Number *</label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+91 XXXXXXXXXX"
                className="mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">Include country code for WhatsApp</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Service Type *</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day-maid-10">Day Maid (10 Hours)</SelectItem>
                  <SelectItem value="day-maid-12">Day Maid (12 Hours)</SelectItem>
                  <SelectItem value="live-in">24-Hour Live-In</SelectItem>
                  <SelectItem value="cook">Cook</SelectItem>
                  <SelectItem value="nanny">Nanny</SelectItem>
                  <SelectItem value="elderly">Elderly Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Salary Range *</label>
              <Input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Enter salary amount"
                className="mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Additional Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requirements or notes"
                rows={4}
                className="mt-2"
              />
            </div>

            <Button onClick={generateMessage} size="lg" className="w-full">
              Generate Message
            </Button>
          </div>
        </Card>

        {/* Message Preview Section */}
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Message Preview</h2>

          {generatedMessage ? (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-green-200 min-h-[300px] whitespace-pre-wrap text-sm text-slate-700 font-mono">
                {generatedMessage}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy Message
                    </>
                  )}
                </Button>
                <Button
                  onClick={openWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Send on WhatsApp
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700">
                <p className="font-semibold mb-2">💡 Tip:</p>
                <p>Click "Send on WhatsApp" to open WhatsApp with the message pre-filled, or copy and paste manually.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] text-center">
              <div>
                <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">Fill in the details and click "Generate Message" to see preview</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Template Information */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Message Template Information</h3>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            The booking request message includes all essential information for the client:
          </p>
          <ul className="space-y-2 ml-4">
            <li>✓ Personalized greeting with client name</li>
            <li>✓ Service type and salary details</li>
            <li>✓ Any special notes or requirements</li>
            <li>✓ Company contact information</li>
            <li>✓ Professional closing</li>
          </ul>
          <p className="mt-4">
            The message is formatted for WhatsApp with proper line breaks and emoji for better readability.
          </p>
        </div>
      </Card>
    </div>
  );
}
