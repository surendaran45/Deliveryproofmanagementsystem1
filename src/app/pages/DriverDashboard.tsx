import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { deliveryAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Truck, Package, LogOut, MapPin } from "lucide-react";

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "driver") {
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

      // Find active delivery (In Transit)
      const active = response.deliveries.find((d: any) => d.status === "In Transit");
      setActiveDelivery(active || null);
    } catch (error: any) {
      toast.error("Failed to fetch deliveries");
      console.error("Fetch deliveries error:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Active Delivery Alert */}
        {activeDelivery && (
          <Card className="mb-6 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Active Delivery in Progress</CardTitle>
              <CardDescription className="text-blue-700">
                Complete this delivery before starting a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Delivery Address:</strong> {activeDelivery.delivery_address}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong>{" "}
                  <Badge className={getStatusColor(activeDelivery.status)}>
                    {activeDelivery.status}
                  </Badge>
                </p>
                <Button
                  onClick={() => navigate("/complete-delivery", { state: { delivery: activeDelivery } })}
                  className="mt-2"
                >
                  Complete This Delivery
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-xl transition-shadow border-2 hover:border-blue-500"
            onClick={() => {
              if (activeDelivery) {
                toast.warning("Complete your active delivery first");
              } else {
                navigate("/warehouse-pickup");
              }
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">📦 Warehouse Pickup</CardTitle>
                  <CardDescription>Start a new delivery from warehouse</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Take a photo at the warehouse, capture GPS location, and enter delivery address to
                begin your delivery.
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer hover:shadow-xl transition-shadow border-2 ${
              activeDelivery ? "hover:border-green-500" : "opacity-50"
            }`}
            onClick={() => {
              if (activeDelivery) {
                navigate("/complete-delivery", { state: { delivery: activeDelivery } });
              } else {
                toast.warning("No active delivery to complete");
              }
            }}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">🚚 Complete Delivery</CardTitle>
                  <CardDescription>Finish delivery and generate OTP</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Take a photo at delivery location, capture GPS, and complete the delivery to generate
                an OTP.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Your delivery history</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Loading deliveries...</p>
            ) : deliveries.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No deliveries yet</p>
            ) : (
              <div className="space-y-3">
                {deliveries.slice(0, 5).map((delivery) => (
                  <div
                    key={delivery.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <p className="font-medium">{delivery.delivery_address}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(delivery.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(delivery.status)}>{delivery.status}</Badge>
                      {delivery.otp_verified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          OTP Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
