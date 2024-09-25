import { useEffect, useState } from "react";
import { storage, firestore, auth } from "../../../Helpers/Firebase";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { OpeningTime } from "../../../Helpers/types";

function ListYourResturantIndex() {
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [menuPdfUrl, setMenuPdfUrl] = useState<File | null>(null);
  const [info, setInfo] = useState<{ name: string; imageUrl: string }[]>([]);
  const [openingTime, setOpeningTime] = useState<OpeningTime[]>([]);

  const [saftyInstruction, setSaftyInstruction] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setLoading] = useState(false); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
  const [userId, serUserId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        serUserId(user.uid);
      } else {
        alert("first login then add restaurant");
      }
    });
    return unsubscribe;
  }, []);

  const onMenuChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      // Ensure the file is a PDF
      if (selectedFile.type !== "application/pdf") {
        console.error("Only PDF files are allowed");
        return;
      }
      setMenuPdfUrl(selectedFile);
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImageFiles(selectedFiles);
    }
  };

  const generateUniqueFileName = (originalName: string, restaurantName: string): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7); // Generate a random string
    const fileExtension = originalName.split(".").pop(); // Get file extension
    const uniqueFileName = `${restaurantName}-${timestamp}-${randomString}.${fileExtension}`;
    return uniqueFileName;
  };

  const uploadImages = async (imageFiles: File[], restaurantName: string): Promise<string[]> => {
    try {
      const urls: string[] = [];

      for (const imageFile of imageFiles) {
        const uniqueFileName = generateUniqueFileName(imageFile.name, restaurantName);
        const storageRef = ref(storage, `restaurant_images/${uniqueFileName}`);
        const snapshot = await uploadBytesResumable(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
        urls.push(downloadURL);
      }

      return urls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images. Please try again.");
    }
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleTimeChange = (dayIndex: number, field: string, value: string) => {
    const updatedOpeningTime = [...openingTime];
    updatedOpeningTime[dayIndex] = {
      ...updatedOpeningTime[dayIndex],
      [field]: value,
    };
    setOpeningTime(updatedOpeningTime);
  };

  const handleCheckboxChange = (dayIndex: number, isChecked: boolean) => {
    const updatedOpeningTime = [...openingTime];
    updatedOpeningTime[dayIndex] = {
      ...updatedOpeningTime[dayIndex],
      isOff: isChecked,
    };
    setOpeningTime(updatedOpeningTime);
  };

  const formatTime = (hour: any, minute: any, amPm: any) => {
    return `${hour || '8'}:${minute || '00'} ${amPm || 'AM'}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!menuPdfUrl) {
      console.error("Please upload a PDF file");
      return;
    }

    setLoading(true); // Start loading state

    try {
      // Upload menu PDF
      const uniqueMenuFileName = generateUniqueFileName(menuPdfUrl.name, restaurantName);
      const menuStorageRef = ref(storage, `hotel_menus/${uniqueMenuFileName}`);
      const menuSnapshot = await uploadBytes(menuStorageRef, menuPdfUrl);
      const menuDownloadURL = await getDownloadURL(menuSnapshot.ref);

      // Upload images
      const uploadedImageUrls = await uploadImages(imageFiles, restaurantName);

      const formattedOpeningTime = openingTime.map((time, index) => ({
        day: daysOfWeek[index],
        from: formatTime(time.fromHour, time.fromMinute, time.fromAmPm),
        to: formatTime(time.toHour, time.toMinute, time.toAmPm),
      }));

      // Add restaurant to Firestore
      await addDoc(collection(firestore, "restaurants"), {
        name: restaurantName,
        category: category,
        address: address,
        latitude: latitude,
        longitude: longitude,
        description: description,
        imagesUrl: uploadedImageUrls,
        phoneNumber: phoneNumber,
        menuPdfUrl: menuDownloadURL,
        info: info,
        openingTime: formattedOpeningTime,
        saftyInstruction: saftyInstruction,
        additionalInfo: additionalInfo,
        userId: userId,
      });

      console.log("Restaurant created successfully!");

      // Clear form fields and state
      setRestaurantName("");
      setCategory("");
      setAddress("");
      setLatitude("");
      setLongitude("");
      setDescription("");
      setImageFiles([]);
      setPhoneNumber("");
      setMenuPdfUrl(null);
      setInfo([]);
      setOpeningTime([]);
      setSaftyInstruction("");
      setAdditionalInfo("");
      navigate("/restaurants");
    } catch (error) {
      console.error("Error creating restaurant:", error);
      setError("Failed to create restaurant. Please try again."); // Set error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="p-5 shadow-lg">
      <p className="text-lg font-bold mb-10">List your Restaurant</p>
      <form className="max-w-6xl" onSubmit={handleSubmit}>
        <div className="flex flex-wrap justify-between items-center">
          <div className="mb-5 w-6/12">
            <label className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
              Choose category
            </label>
            <select
              id="category"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Fast Food</option>
              <option>Fine Dining</option>
              <option>Casual Dining</option>
              <option>Cafe</option>
            </select>
          </div>

          <div className="mb-5 w-5/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Business Name
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Address
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-7/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Latitude
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-7/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Longitude
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Description
            </label>
            <textarea
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Phone Number
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>


          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Safety Instructions
            </label>
            <textarea
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={saftyInstruction}
              onChange={(e) => setSaftyInstruction(e.target.value)}
            />
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Additional Information
            </label>
            <textarea
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />
          </div>

          <div className="mb-5 w-7/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Upload Menu PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={onMenuChange}
              required
            />
          </div>

          <div className="mb-5 w-7/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Upload Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={onImageChange}
            />
          </div>

          {/* <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Info
            </label>
            <input
              type="text"
              placeholder="Enter info in format: name,imageUrl"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const [name, imageUrl] = (
                    e.target as HTMLInputElement
                  ).value.split(",");
                  setInfo([...info, { name, imageUrl }]);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
            <ul className="list-disc list-inside">
              {info.map((item, index) => (
                <li key={index}>
                  {item.name} - {item.imageUrl}
                </li>
              ))}
            </ul>
          </div> */}

          <div className="my-5 w-full">
            <label className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
              Opening Time (Use up/down keys on keyboard or enter values)
            </label>

            <ul className="list-disc list-inside">
              {openingTime.map((time, index) => (
                <li key={index}>
                  {daysOfWeek[index]}: {time?.fromHour}:{time?.fromMinute} {time?.fromAmPm} - {time?.toHour}:{time?.toMinute} {time?.toAmPm} 
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap mt-5 justify-between items-center">
              {daysOfWeek.map((day, index) => (
                <div key={index} className="mb-5 w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    {day}
                  </label>
                  <div className="flex items-center">
                    <div className="w-1/4">
                      <label className="block mb-2 text-sm text-gray-900 dark:text-white">
                        From
                      </label>
                      <div className="flex items-center">
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
                          value={openingTime[index]?.fromHour || ""}
                          onChange={(e) =>
                            handleTimeChange(index, "fromHour", e.target.value)
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="">Hour</option>
                          {Array.from(Array(12).keys()).map((hour) => (
                            <option
                              key={hour + 1}
                              value={(hour + 1).toString().padStart(2, "0")}
                            >
                              {(hour + 1).toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
                          value={openingTime[index]?.fromMinute || ""}
                          onChange={(e) =>
                            handleTimeChange(
                              index,
                              "fromMinute",
                              e.target.value
                            )
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="">Minute</option>
                          {Array.from(Array(60).keys()).map((minute) => (
                            <option
                              key={minute}
                              value={minute.toString().padStart(2, "0")}
                            >
                              {minute.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={openingTime[index]?.fromAmPm || ""}
                          onChange={(e) =>
                            handleTimeChange(index, "fromAmPm", e.target.value)
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="w-1/4">
                      <label className="block mb-2 text-sm text-gray-900 dark:text-white">
                        To
                      </label>
                      <div className="flex items-center">
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
                          value={openingTime[index]?.toHour || ""}
                          onChange={(e) =>
                            handleTimeChange(index, "toHour", e.target.value)
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="">Hour</option>
                          {Array.from(Array(12).keys()).map((hour) => (
                            <option
                              key={hour + 1}
                              value={(hour + 1).toString().padStart(2, "0")}
                            >
                              {(hour + 1).toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
                          value={openingTime[index]?.toMinute || ""}
                          onChange={(e) =>
                            handleTimeChange(index, "toMinute", e.target.value)
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="">Minute</option>
                          {Array.from(Array(60).keys()).map((minute) => (
                            <option
                              key={minute}
                              value={minute.toString().padStart(2, "0")}
                            >
                              {minute.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <select
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={openingTime[index]?.toAmPm || ""}
                          onChange={(e) =>
                            handleTimeChange(index, "toAmPm", e.target.value)
                          }
                          disabled={openingTime[index]?.isOff}
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>
                    </div>
                    <div className="w-1/4 ml-4">
                      <label className="block mb-2 text-sm text-gray-900 dark:text-white">
                        Closed
                      </label>
                      <input
                        type="checkbox"
                        checked={openingTime[index]?.isOff}
                        onChange={(e) =>
                          handleCheckboxChange(index, e.target.checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>

  );
}

export default ListYourResturantIndex;
