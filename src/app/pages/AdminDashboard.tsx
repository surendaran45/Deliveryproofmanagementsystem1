import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { deliveryAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { toast } from "sonner";
import { LogOut, CheckCircle, AlertCircle, MapPin, Package, User } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchDeliveries();
  }, [isAuthenticated, user, navigate]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await deliveryAPI.getAll();
      setDeliveries(response.deliveries);
    } catch (error: any) {
      toast.error("Failed to fetch deliveries");
      console.error("Fetch deliveries error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await deliveryAPI.resolve(id);
      toast.success("Delivery marked as resolved");
      fetchDeliveries();
    } catch (error: any) {
      toast.error("Failed to resolve delivery");
      console.error("Resolve error:", error);
    }
  };

  const handleDispute = async (id: string) => {
    try {
      await deliveryAPI.dispute(id);
      toast.success("Delivery marked as disputed");
      fetchDeliveries();
    } catch (error: any) {
      toast.error("Failed to dispute delivery");
      console.error("Dispute error:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Transit":
        return "bg-blue-500";
      case "Delivered":
        return "bg-green-500";
      case "Resolved":
        return "bg-gray-500";
      case "Disputed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const stats = {
    total: deliveries.length,
    inTransit: deliveries.filter((d) => d.status === "In Transit").length,
    delivered: deliveries.filter((d) => d.status === "Delivered").length,
    resolved: deliveries.filter((d) => d.status === "Resolved").length,
    disputed: deliveries.filter((d) => d.status === "Disputed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage all deliveries and drivers</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Deliveries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.inTransit}</p>
                <p className="text-sm text-gray-600">In Transit</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{stats.resolved}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.disputed}</p>
                <p className="text-sm text-gray-600">Disputed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries Table */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>All Deliveries</CardTitle>
            <CardDescription>Monitor and manage delivery records</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading deliveries...</p>
            ) : deliveries.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No deliveries yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Driver</th>
                      <th className="text-left p-3 font-medium">Address</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">OTP Verified</th>
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{delivery.driver?.name || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm max-w-xs truncate">
                              {delivery.delivery_address}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={getStatusColor(delivery.status)}>
                            {delivery.status}
                          </Badge>
                        </td>
                        <td className="p-3">
                          {delivery.otp_verified ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50">
                              Not Verified
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(delivery.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedDelivery(delivery)}
                                >
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Delivery Details</DialogTitle>
                                </DialogHeader>
                                {selectedDelivery && selectedDelivery.id === delivery.id && (
                                  <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="font-semibold mb-2">Warehouse Photo</h3>
                                        {selectedDelivery.before_photo ? (
                                          <img
                                            src={selectedDelivery.before_photo}
                                            alt="Warehouse"
                                            className="w-full rounded-lg border"
                                          />
                                        ) : (
                                          <p className="text-gray-500">No photo</p>
                                        )}
                                        <p className="text-sm text-gray-600 mt-2">
                                          <strong>Location:</strong>{" "}
                                          {selectedDelivery.warehouse_latitude},{" "}
                                          {selectedDelivery.warehouse_longitude}
                                        </p>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold mb-2">Delivery Photo</h3>
                                        {selectedDelivery.after_photo ? (
                                          <img
                                            src={selectedDelivery.after_photo}
                                            alt="Delivery"
                                            className="w-full rounded-lg border"
                                          />
                                        ) : (
                                          <p className="text-gray-500">No photo</p>
                                        )}
                                        {selectedDelivery.delivery_latitude && (
                                          <p className="text-sm text-gray-600 mt-2">
                                            <strong>Location:</strong>{" "}
                                            {selectedDelivery.delivery_latitude},{" "}
                                            {selectedDelivery.delivery_longitude}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <p>
                                        <strong>Driver:</strong> {selectedDelivery.driver?.name}
                                      </p>
                                      <p>
                                        <strong>Delivery Address:</strong>{" "}
                                        {selectedDelivery.delivery_address}
                                      </p>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge className={getStatusColor(selectedDelivery.status)}>
                                          {selectedDelivery.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>OTP:</strong> {selectedDelivery.otp || "Not generated"}
                                      </p>
                                      <p>
                                        <strong>OTP Verified:</strong>{" "}
                                        {selectedDelivery.otp_verified ? "Yes" : "No"}
                                      </p>
                                      <p>
                                        <strong>Created:</strong>{" "}
                                        {new Date(selectedDelivery.created_at).toLocaleString()}
                                      </p>
                                      {selectedDelivery.completed_at && (
                                        <p>
                                          <strong>Completed:</strong>{" "}
                                          {new Date(selectedDelivery.completed_at).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {delivery.status === "Delivered" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-700 border-green-300 hover:bg-green-50"
                                  onClick={() => handleResolve(delivery.id)}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-700 border-red-300 hover:bg-red-50"
                                  onClick={() => handleDispute(delivery.id)}
                                >
                                  <AlertCircle className="w-4 h-4 mr-1" />
                                  Dispute
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
