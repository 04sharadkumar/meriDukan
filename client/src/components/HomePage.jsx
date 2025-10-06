import RecentAdded from "./Home/RecentAdded";
import FlashSale from "./Home/FlashSale";
import CustomerFavorites from "./Home/CustomerFavorites";
import Banner from "./Home/Banner";
import Catageory from "./Home/Catageory";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-200 font-sans">

       {/* Hero Banner Carousel */}
        <Banner />
      <main className="container mx-auto px-4 py-6">
        
       

        {/* Categories - 3D Tilt Effect */}

        <Catageory />

        <FlashSale />

        <CustomerFavorites />

        <RecentAdded />
      </main>
    </div>
  );
};

export default HomePage;
