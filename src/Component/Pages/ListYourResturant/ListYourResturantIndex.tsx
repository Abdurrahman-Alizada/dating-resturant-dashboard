import firebase from "firebase/app";
import { useEffect, useState } from "react";
import { storage, firestore, auth } from "../../../Helpers/Firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

function ListYourResturantIndex() {
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [productService, setProductService] = useState("");
  const [specialize, setSpecialize] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setLoading] = useState(false); // State to track loading state
  const [error, setError] = useState<string | null>(null); // State to track errors
  const [userId, serUserId] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        serUserId(user.uid)
      } else {
         alert("first login then add resturant")
      }
    });
    return unsubscribe;
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      // Ensure the file is a PDF
      if (selectedFile.type !== "application/pdf") {
        console.error("Only PDF files are allowed");
        return;
      }
      setFile(selectedFile);
    }
  };

  const generateUniqueFileName = (originalName: string): string => {
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(7); // Generate a random string
    const fileExtension = originalName.split(".").pop(); // Get file extension
    const uniqueFileName = `${restaurantName}-${timestamp}-${randomString}.${fileExtension}`;
    return uniqueFileName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      console.error("Please upload a PDF file");
      return;
    }

    setLoading(true); // Start loading state

    try {
      // Generate unique file name
      const uniqueFileName = generateUniqueFileName(file.name);

      // Upload file to Firebase Storage
      const storageRef = ref(storage, `hotel_menus/${uniqueFileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Add restaurant info to Firestore
      await addDoc(collection(firestore, "restaurants"), {
        name: restaurantName,
        category: category,
        address: address,
        paymentMethod: paymentMethod,
        productService: productService,
        specialize: specialize,
        description: description,
        menuURL: downloadURL,
        userId: userId
      });

      console.log("Restaurant created successfully!");

      // Reset form fields after successful submission (if needed)
      setRestaurantName("");
      setCategory("");
      setAddress("");
      setPaymentMethod("");
      setProductService("");
      setSpecialize("");
      setDescription("");
      setFile(null);
      navigate("/resturants");
    } catch (error) {
      console.error("Error creating restaurant:", error);
      setError("Failed to create restaurant. Please try again."); // Set error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };
  return (
    <div className="p-5 shadow-lg ">
      <p className="text-lg font-bold mb-10">List your Restaurant</p>
      <form className="max-w-6xl " onSubmit={handleSubmit}>
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
          <div className="mb-5  w-5/12">
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
          <div className="mb-5  w-full">
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

          <div className="mb-5 w-full">
            <label className="block mb-2 text-md font-medium text-gray-900 dark:text-white">
              Add payment methods
            </label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option>Credit Card</option>
              <option>Cash</option>
              <option>PayPal</option>
              <option>Bank Transfer</option>
            </select>

            <button
              type="button"
              className="border mt-2 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center "
            >
              Add more
            </button>
          </div>

          <div className="mb-5 w-6/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Product & Service
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={productService}
              onChange={(e) => setProductService(e.target.value)}
              required
            />
            <button
              type="button"
              className="border mt-2 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center "
            >
              Add more
            </button>
          </div>

          <div className="mb-5 w-5/12">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Specialize
            </label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={specialize}
              onChange={(e) => setSpecialize(e.target.value)}
              required
            />
            <button
              type="button"
              className="border mt-2 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-8 py-2.5 text-center "
            >
              Add more
            </button>
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Add Description
            </label>
            <textarea
              className="w-full px-3 py-2 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="message"
              rows={5}
              placeholder="Enter your message..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-5 w-full">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Upload menu (pdf)
            </label>
            <input
              className="block w-full p-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
              onChange={onChange}
              type="file"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="text-white bg-[#97d721]  font-medium rounded-lg w-full sm:w-auto px-8 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          {isLoading && (
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-4 h-4 me-3 text-white animate-spin"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
          )}
          Upload now
        </button>
      </form>
    </div>
  );
}

export default ListYourResturantIndex;
