import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { deliveryAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Camera, MapPin, Upload } from "lucide-react";

export default function WarehousePickup() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const [beforePhoto, setBeforePhoto] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "driver") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setBeforePhoto(base64String);
      setPhotoPreview(base64String);
      toast.success("Photo uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const getLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        toast.success("Location captured successfully");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get location. Please enable location services.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!beforePhoto) {
      toast.error("Please upload a warehouse photo");
      return;
    }

    if (latitude === null || longitude === null) {
      toast.error("Please capture warehouse location");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter delivery address");
      return;
    }

    setLoading(true);
    try {
      const response = await deliveryAPI.start({
        before_photo: beforePhoto,
        warehouse_latitude: latitude,
        warehouse_longitude: longitude,
        delivery_address: deliveryAddress.trim(),
      });

      toast.success("Delivery started successfully!");
      navigate("/driver-dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to start delivery");
      console.error("Start delivery error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate("/driver-dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">📦 Warehouse Pickup</CardTitle>
            <CardDescription>
              Capture warehouse photo and location to start your delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Warehouse Photo (Before Delivery)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="space-y-3">
                      <img
                        src={photoPreview}
                        alt="Warehouse photo"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Camera className="w-12 h-12 mx-auto text-gray-400" />
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Take a photo of the warehouse/pickup location
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Warehouse Location</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={gettingLocation}
                    className="flex-shrink-0"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {gettingLocation ? "Getting Location..." : "Get Location"}
                  </Button>
                  {latitude !== null && longitude !== null && (
                    <div className="flex-1 flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>
                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Google Maps Embed */}
                {latitude !== null && longitude !== null && (
                  <div className="mt-3 border rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="250"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}&zoom=15`}
                      allowFullScreen
                      title="Warehouse Location"
                    />
                  </div>
                )}
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Delivery Address</Label>
                <Textarea
                  id="delivery-address"
                  placeholder="Enter the full delivery address..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Starting Delivery..." : "Start Delivery"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
