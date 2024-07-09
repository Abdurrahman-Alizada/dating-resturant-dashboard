import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../../Helpers/Firebase";
import { doc, getDoc } from "firebase/firestore";
// import DownloadPDFButton from "./DownloadPDF";
import Reviews from "./Reviews";

interface Restaurant {
  name: string;
  address: string;
  description: string;
  imagesUrl: string[];
  details: string;
  menuURL: string;
  additionalInfo: string;
  saftyInstruction: string;
  openingTime: { day: string; from: string; to: string }[];
}

const ResturantDetailsIndex: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        // const docRef = ;
        const docSnap = await getDoc(
          doc(db, "restaurants", restaurantId || "")
        );
        console.log("fetch", docSnap);
        if (docSnap.exists()) {
          setRestaurant(docSnap.data() as Restaurant);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching restaurant details: ", error);
      }
    };

    if (restaurantId) {
      fetchRestaurantDetails();
    }
    console.log("first", restaurantId);
  }, [restaurantId]);

  const additionalInfoList = restaurant?.additionalInfo.split('.').filter(info => info);
  const safetyInstructionsList = restaurant?.saftyInstruction.split('.').filter(info => info);

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="max-w-6xl w-full px-8">
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col md:flex-row items-center">
          <div className="h-40 w-40 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              className="object-cover h-full w-full"
              src={restaurant?.imagesUrl[0] || "/restaurant.png"}
              alt="Restaurant"
            />
          </div>
          <div className="md:ml-6 flex-grow">
            <h2 className="text-3xl font-bold text-gray-900">
              {restaurant.name}
            </h2>
            <p className="mt-2 text-gray-700">{restaurant.address}</p>
            <p className="mt-2 text-gray-700">{restaurant.description}</p>
            <div className="flex items-center mt-4">
              <div className="flex items-center">
                {[...Array(4)].map((_, index) => (
                  <svg
                    key={index}
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927a1 1 0 011.902 0l1.317 4.055a1 1 0 00.95.69h4.26a1 1 0 01.592 1.805l-3.452 2.5a1 1 0 00-.364 1.118l1.317 4.056a1 1 0 01-1.54 1.118l-3.452-2.5a1 1 0 00-1.175 0l-3.452 2.5a1 1 0 01-1.54-1.118l1.317-4.056a1 1 0 00-.364-1.118l-3.452-2.5a1 1 0 01.592-1.805h4.26a1 1 0 00.95-.69L9.049 2.927z" />
                  </svg>
                ))}
                <svg
                  className="w-5 h-5 text-gray-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927a1 1 0 011.902 0l1.317 4.055a1 1 0 00.95.69h4.26a1 1 0 01.592 1.805l-3.452 2.5a1 1 0 00-.364 1.118l1.317 4.056a1 1 0 01-1.54 1.118l-3.452-2.5a1 1 0 00-1.175 0l-3.452 2.5a1 1 0 01-1.54-1.118l1.317-4.056a1 1 0 00-.364-1.118l-3.452-2.5a1 1 0 01.592-1.805h4.26a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
              </div>
              <span className="ml-2 text-gray-600">(70 reviews)</span>
            </div>
            <div className="mt-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                Read reviews
              </span>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h3 className="text-2xl font-semibold">Additional Information</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {additionalInfoList?.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
          <h3 className="text-2xl font-semibold mt-8">Opening Times</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {restaurant?.openingTime?.map((time, index) => (
              <li key={index}>
                {time.day}: {time.from} - {time.to}
              </li>
            ))}
          </ul>
          <h3 className="text-2xl mt-5 font-semibold">Safety Instructions</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {safetyInstructionsList?.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>
          <h3 className="text-2xl font-semibold mt-8">Menu PDF</h3>
          {/* <DownloadPDFButton
            pdfUrl={restaurant.menuURL}
            fileName={restaurant.name}
          /> */}
        </div>
        <Reviews />
      </div>
    </div>
  );
};

export default ResturantDetailsIndex;
