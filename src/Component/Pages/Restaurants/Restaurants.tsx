import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../../../Helpers/Firebase"; // Adjust the path to your firebaseConfig file
import { collection, getDocs, where, query } from "firebase/firestore";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<any[]>([]); // Define state to hold restaurants

  useEffect(() => {
    // Function to get userId from localStorage
    const getUserIdFromLocalStorage = () => {
      const storedUserId = localStorage.getItem("userId");
      return storedUserId ? storedUserId : "";
    };

    // Fetch restaurants when component mounts
    const fetchRestaurants = async () => {
      try {
        const userId = getUserIdFromLocalStorage();
        const q = query(collection(db, "restaurants"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const restaurantsData = querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        setRestaurants(restaurantsData);
      } catch (error) {
        console.error("Error fetching restaurants: ", error);
      }
    };

    fetchRestaurants(); // Call the async function

  }, []); // Empty dependency array ensures this effect runs only once

  const getSlug = (inputString: string) => {
    return inputString.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Restaurants</h1>
        <Link to="/list-your-restaurant">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300">
            Add Restaurant
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            to={{ pathname: `/restaurant-detail/${restaurant._id}` }}
            state={{ menuURL: restaurant.menuURL, fileName: restaurant.name }}
            key={restaurant._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-300 overflow-hidden"
          >
            <img
              className="object-cover h-40 w-full"
              src={restaurant?.imagesUrl[0]}
              alt="Restaurant"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h2>
              <p className="text-gray-700 mb-2">{restaurant.address}</p>
              <p className="text-gray-700 mb-4">{restaurant.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(4)].map((_, index) => (
                    <svg
                      key={index}
                      className="w-4 h-4 text-yellow-300"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                  ))}
                  <svg
                    className="w-4 h-4 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                  >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                  </svg>
                </div>
                <span className="ml-2 text-gray-600">(70)</span>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                Read reviews
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
