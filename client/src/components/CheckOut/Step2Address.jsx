import axios from "axios";
import toast from "react-hot-toast";
import {getCookie} from "../../utils/cookieHelper"





export default function Step2Address({ step, setStep, formData, handleInputChange}) {
  if (step !== 2) return null;

  

  const handleSaveAddress = async () => {

    
    try {

      const authToken = getCookie("authToken");
     
  

      const response = await axios.post(
        "http://localhost:5000/api/save-address/address", 
        formData, 
        {headers: { Authorization: `Bearer ${authToken}` },}     
      );

      if (response.data.success) {
        toast.success("Address saved successfully!");
        setStep(3); // move to next step
      }

       // ✅ Pass shipping info to Step3
        setStep(3, {
          shippingInfo: {
            name: formData.name,
            mobile: formData.mobile,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            
          },
        });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    }
  };

  return (
    <div className="border-b border-gray-200 bg-blue-50">
      {/* Header */}
      <div className="flex justify-between items-center p-6 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
        <h2 className="font-semibold text-lg flex items-center gap-3">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-blue-600 text-white shadow-md">
            2
          </span>
          DELIVERY ADDRESS
        </h2>
        <span className="text-blue-600 text-sm">
          {formData.name ? "✓ " + formData.name : "Not completed"}
        </span>
      </div>

      {/* Form */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Mobile Number</label>
            <input
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Mobile Number"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-medium mb-2">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Full Address"
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="City"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Pincode"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSaveAddress}
          className="mt-6 w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          disabled={!formData.name || !formData.mobile || !formData.address || !formData.city || !formData.pincode}
        >
          SAVE & CONTINUE
        </button>
      </div>
    </div>
  );
}