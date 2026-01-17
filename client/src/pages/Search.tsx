import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { toast } from "sonner";

export default function SearchPage() {
  const [searchType, setSearchType] = useState("clients");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterService, setFilterService] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: bookings } = trpc.bookings.list.useQuery();

  const performSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    let filtered: any[] = [];
    const query = searchQuery.toLowerCase();

    if (searchType === "clients") {
      filtered = (clients || []).filter((client) =>
        client.name.toLowerCase().includes(query) ||
        client.mobile1.includes(query) ||
        (client.email && client.email.toLowerCase().includes(query))
      );
    } else if (searchType === "bookings") {
      filtered = (bookings || []).filter((booking) => {
        const matchesQuery =
          booking.bookingId.toLowerCase().includes(query) ||
          booking.clientId.toString().includes(query);
        const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
        const matchesService = filterService === "all" || booking.serviceId.toString() === filterService;
        return matchesQuery && matchesStatus && matchesService;
      });
    }

    setResults(filtered);
    setHasSearched(true);
    toast.success(`Found ${filtered.length} results`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterService("all");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Advanced Search</h1>
        <p className="text-slate-600 mt-2">Search and filter clients and bookings</p>
      </div>

      {/* Search Form */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Search Criteria</h2>

        <div className="space-y-6">
          {/* Search Type */}
          <div>
            <label className="text-sm font-medium text-slate-900">Search Type</label>
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Search Clients</SelectItem>
                <SelectItem value="bookings">Search Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Query */}
          <div>
            <label className="text-sm font-medium text-slate-900">
              {searchType === "clients" ? "Client Name, Phone, or Email" : "Booking ID or Client ID"}
            </label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === "clients" ? "e.g., John Doe or 9876543210" : "e.g., BK001"}
              className="mt-2"
              onKeyPress={(e) => e.key === "Enter" && performSearch()}
            />
          </div>

          {/* Filters for Bookings */}
          {searchType === "bookings" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-900">Booking Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-900">Service Type</label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      <SelectItem value="1">Day Maid 10 Hours</SelectItem>
                      <SelectItem value="2">Day Maid 12 Hours</SelectItem>
                      <SelectItem value="3">24-Hour Live-In</SelectItem>
                      <SelectItem value="4">Cook</SelectItem>
                      <SelectItem value="5">Nanny</SelectItem>
                      <SelectItem value="6">Elderly Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {/* Search Buttons */}
          <div className="flex gap-3">
            <Button onClick={performSearch} size="lg" className="flex-1 flex items-center justify-center gap-2">
              <Search size={18} />
              Search
            </Button>
            <Button onClick={clearSearch} variant="outline" size="lg" className="flex-1 flex items-center justify-center gap-2">
              <X size={18} />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Search Results ({results.length})
          </h2>

          {results.length > 0 ? (
            <div className="space-y-4">
              {searchType === "clients" ? (
                // Client Results
                <div className="space-y-4">
                  {results.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4 hover:bg-slate-50 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{client.name}</p>
                          <p className="text-sm text-slate-600">Phone: {client.phone}</p>
                          {client.email && <p className="text-sm text-slate-600">Email: {client.email}</p>}
                          {client.address && <p className="text-sm text-slate-600">Address: {client.address}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">ID: {client.id}</p>
                          <p className="text-xs text-slate-500">
                            Joined: {new Date(client.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Booking Results
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left">Booking ID</th>
                        <th className="px-4 py-2 text-left">Client ID</th>
                        <th className="px-4 py-2 text-left">Service</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Created Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((booking) => (
                        <tr key={booking.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-2 font-mono text-blue-600">{booking.bookingId}</td>
                          <td className="px-4 py-2">{booking.clientId}</td>
                          <td className="px-4 py-2">Service #{booking.serviceId}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                              booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-600">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No results found</p>
              <p className="text-slate-400 text-sm mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </Card>
      )}

      {/* Search Tips */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Search Tips</h3>
        <div className="space-y-2 text-sm text-slate-700">
          <p>
            <strong>For Clients:</strong> Search by name, phone number, or email address. Results are case-insensitive.
          </p>
          <p>
            <strong>For Bookings:</strong> Search by booking ID or client ID, then use filters to narrow down by status and service type.
          </p>
          <p>
            <strong>Filters:</strong> Combine multiple filters for more precise results.
          </p>
          <p>
            <strong>Keyboard Shortcut:</strong> Press Enter to search after typing your query.
          </p>
        </div>
      </Card>
    </div>
  );
}
