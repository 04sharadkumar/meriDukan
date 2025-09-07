import { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const LiveAddress = () => {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const getPincode = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use OpenStreetMap Nominatim API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();

          // Find pincode
          const postcode = data.address.postcode || "Not found";
          setPincode(postcode);
        } catch (error) {
          console.error("Error fetching pincode:", error);
          setPincode("Error");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setPincode("Permission denied");
        setLoading(false);
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <FaMapMarkerAlt className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Delivery Address</h2>
            <p className="text-sm text-gray-600">
              {pincode
                ? `Your pincode: ${pincode}`
                : "Select a saved address or enter a new one"}
            </p>
          </div>
        </div>
        <button
          onClick={getPincode}
          className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          {loading ? "Locating..." : "Use my location"}
        </button>
      </div>
    </div>
  );
};

export default LiveAddress;
