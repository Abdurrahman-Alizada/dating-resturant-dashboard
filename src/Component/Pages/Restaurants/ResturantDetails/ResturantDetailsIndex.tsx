import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../../Helpers/Firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import DownloadPDFButton from "./DownloadPDF";

interface Restaurant {
  name: string;
  address: string;
  description: string;
  imagesUrl: string[];
  details: string;
  menuPdfUrl: string;
  additionalInfo: string;
  saftyInstruction: string;
  openingTime: { day: string; from: string; to: string }[];
}

const ResturantDetailsIndex: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const docSnap = await getDoc(
          doc(db, "restaurants", restaurantId || "")
        );
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
  }, [restaurantId]);

  const handleSave = async () => {
    if (restaurantId && restaurant) {
      try {
        await setDoc(doc(db, "restaurants", restaurantId), restaurant);
        alert("Restaurant details updated successfully");
        setEditMode(false); // Exit edit mode after saving
      } catch (error) {
        console.error("Error updating restaurant:", error);
      }
    }
  };

  const additionalInfoList = restaurant?.additionalInfo
    .split(".")
    .filter((info) => info);
  const safetyInstructionsList = restaurant?.saftyInstruction
    .split(".")
    .filter((info) => info);

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
            <div className="mt-3">
              {editMode ? (
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={restaurant?.name || ""}
                  onChange={(e) =>
                    setRestaurant({ ...restaurant!, name: e.target.value })
                  }
                />
              ) : (
                <p className="mt-2 text-gray-700">{restaurant?.name}</p>
              )}
            </div>

            <div className="mt-3">
              {editMode ? (
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={restaurant?.address || ""}
                  onChange={(e) =>
                    setRestaurant({ ...restaurant!, address: e.target.value })
                  }
                />
              ) : (
                <p className="mt-2 text-gray-700">{restaurant?.address}</p>
              )}
            </div>

            <div className="mt-3">
              {editMode ? (
                <textarea
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={restaurant?.description || ""}
                  onChange={(e) =>
                    setRestaurant({
                      ...restaurant!,
                      description: e.target.value,
                    })
                  }
                />
              ) : (
                <p className="mt-2 text-gray-700">{restaurant?.description}</p>
              )}
            </div>

            {/* Edit Button */}
            <button
              className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel Edit" : "Edit"}
            </button>

            {/* Save Button */}
            {editMode && (
              <button
                className="mt-6 mx-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8">
          <h3 className="text-2xl font-semibold">Additional Information</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {additionalInfoList?.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>

          {/* Opening Times */}
          <h3 className="text-2xl font-semibold mt-8">Opening Times</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {restaurant?.openingTime?.map((time, index) => (
              <li key={index}>
                {time.day}: {time.from} - {time.to}
              </li>
            ))}
          </ul>

          {/* Safety Instructions */}
          <h3 className="text-2xl mt-5 font-semibold">Safety Instructions</h3>
          <ul className="list-disc list-inside mt-2 text-gray-700">
            {safetyInstructionsList?.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ul>

          {/* Menu PDF */}
          <h3 className="text-2xl font-semibold mt-8">Menu PDF</h3>
          <DownloadPDFButton
            pdfUrl={restaurant.menuPdfUrl}
            fileName={restaurant.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ResturantDetailsIndex;
