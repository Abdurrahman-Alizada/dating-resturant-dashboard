import React, { useState, useEffect } from "react";
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
    <div className="container px-8">
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold">Your restaurants</p>
        <Link to="/add-restaurant">
          <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
            Add restaurant
          </button>
        </Link>
      </div>

      {restaurants.map((restaurant) => (
        <Link
          to={{ pathname: `/restaurant-detail/${restaurant._id}` }}
          state={{ menuURL: restaurant.menuURL, fileName: restaurant.name }}
          key={restaurant._id}
          className="bg-gray-100 rounded-lg flex justify-between p-4 mt-5"
        >
          <div className="flex">
            <div className="max-h-40 w-2/12">
              <img
                className="object-cover h-full"
                src="/resturant.png"
                alt="Restaurant"
              />
            </div>
            <div className="max-w-full w-8/12">
              <h5 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                {restaurant.name}
              </h5>
              <p className="mb-2 font-normal text-gray-700 dark:text-gray-400">
                {restaurant.address}
              </p>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {restaurant.description}
              </p>
            </div>
          </div>
          <div className="w-2/12">
            <div className="flex items-center mb-2">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
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
              <span className="ml-2">(70)</span>
            </div>
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
              Read reviews
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Restaurants;
