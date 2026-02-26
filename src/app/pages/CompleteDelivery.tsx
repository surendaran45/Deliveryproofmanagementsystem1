import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { deliveryAPI } from "../services/api";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Camera, MapPin, Upload, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function CompleteDelivery() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [afterPhoto, setAfterPhoto] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState<string>("");
  const [completed, setCompleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "driver") {
      navigate("/");
      return;
    }

    // Get active delivery from location state or fetch
    if (location.state?.delivery) {
      setActiveDelivery(location.state.delivery);
    } else {
      fetchActiveDelivery();
    }
  }, [isAuthenticated, user, navigate, location]);

  const fetchActiveDelivery = async () => {
    try {
      const response = await deliveryAPI.getAll();
      const active = response.deliveries.find((d: any) => d.status === "In Transit");
      if (active) {
        setActiveDelivery(active);
      } else {
        toast.error("No active delivery found");
        navigate("/driver-dashboard");
      }
    } catch (error: any) {
      toast.error("Failed to fetch active delivery");
      navigate("/driver-dashboard");
    }
  };

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
      setAfterPhoto(base64String);
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

    if (!afterPhoto) {
      toast.error("Please upload a delivery photo");
      return;
    }

    if (latitude === null || longitude === null) {
      toast.error("Please capture delivery location");
      return;
    }

    if (!activeDelivery) {
      toast.error("No active delivery found");
      return;
    }

    setLoading(true);
    try {
      const response = await deliveryAPI.complete({
        delivery_id: activeDelivery.id,
        after_photo: afterPhoto,
        delivery_latitude: latitude,
        delivery_longitude: longitude,
      });

      setGeneratedOTP(response.otp || "");
      setCompleted(true);
      toast.success("Delivery completed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete delivery");
      console.error("Complete delivery error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (completed && generatedOTP) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-900">Delivery Completed!</CardTitle>
            <CardDescription>Your OTP has been generated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-500 bg-green-50">
              <AlertTitle className="text-green-900">Generated OTP</AlertTitle>
              <AlertDescription>
                <p className="text-4xl font-bold text-center text-green-700 py-4 tracking-wider">
                  {generatedOTP}
                </p>
                <p className="text-sm text-green-800 text-center">
                  Share this OTP with the recipient for verification
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Delivery Address:</strong> {activeDelivery?.delivery_address}
              </p>
              <p>
                <strong>Status:</strong> Delivered
              </p>
            </div>

            <Button onClick={() => navigate("/driver-dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl">🚚 Complete Delivery</CardTitle>
            <CardDescription>
              Capture delivery photo and location to complete your delivery
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeDelivery && (
              <Alert className="mb-6">
                <AlertTitle>Active Delivery</AlertTitle>
                <AlertDescription>
                  <p className="text-sm">
                    <strong>Delivery Address:</strong> {activeDelivery.delivery_address}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Delivery Photo (After Delivery)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="space-y-3">
                      <img
                        src={photoPreview}
                        alt="Delivery photo"
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
                        Take a photo of the delivery location
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
                <Label>Delivery Location</Label>
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
                      title="Delivery Location"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Completing Delivery..." : "Complete Delivery"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
