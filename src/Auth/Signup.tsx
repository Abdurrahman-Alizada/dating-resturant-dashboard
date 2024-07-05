import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, firestore } from "../Helpers/Firebase"; // Make sure to import firestore
import { ErrorMessage, Field, Form, Formik } from "formik";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [loader, setLoader] = useState(false);
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
      } else {
        setUserEmail("");
      }
    });
    return unsubscribe;
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Invalid email");
      setLoader(false);
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character"
      );
      setLoader(false);
      return;
    }
    try {
      setLoader(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid;
      const userDetails = {
        name: email.split("@")[0], // Extract name from email, customize as needed
        email,
        userId,
        password,
        isOnline: true,
        lastOnlineTime: new Date().toISOString(),
      };

      // Save user details in Firestore
      await setDoc(doc(firestore, "restaurantOwners", userId), userDetails);

      // Store user ID in localStorage
      localStorage.setItem("userId", userId);

      navigate("/login");
      setLoader(false);
    } catch (err: any) {
      setError(err.message);
      setLoader(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password:string) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return re.test(password);
  };

  const handleGoogleLogin = async () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userId = user.uid;
      const token = await user.getIdToken();
      const userDetails = {
        name: user.displayName,
        email: user.email,
        userId,
        isOnline: true,
        lastOnlineTime: new Date().toISOString(),
      };

      // Save user details in Firestore
      await setDoc(doc(firestore, "restaurantOwners", userId), userDetails);

      // Store user ID in localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);

      navigate("/resturants");
      setLoader(false);
    } catch (error: any) {
      setError(error.message);
      setLoader(false);
    }
  };

  return (
    <>
      <div className="h-screen max-w-screen bg-white flex justify-center items-center"
      style={{
        backgroundImage: "url(/bg.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
        <div className="shadow-2xl bg-white rounded-t-full z-50 flex p-20 flex-col h-full">
          <div className="mt-12 flex flex-col justify-between">
            <h1 className="text-2xl xl:text-3xl font-bold">Sign up</h1>
            <div className="w-full flex-1 mt-6">
              <form className="mx-auto max-w-xs">
                <input
                  type="email"
                  name="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  placeholder="Email/Username"
                />

                <input
                  type="password"
                  name="password"
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <div className="flex my-4 justify-between items-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      Remember me
                    </label>
                  </div>
                  <p className="ml-2 block text-sm text-gray-900">
                    Forgot password
                  </p>
                </div>
                {error && <span className="mt-10 text-red-600">{error}</span>}

                {!loader ? (
                  <button
                    type="submit"
                    onClick={(e) => handleSignup(e)}
                    className="mt-5 tracking-wide font-semibold bg-[#97d721] text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    Sign up
                  </button>
                ) : (
                  <button
                    disabled
                    type="button"
                    className="mt-5 tracking-wide font-semibold bg-[#97d721] text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    <svg
                      aria-hidden="true"
                      role="status"
                      className="inline w-4 h-4 mr-3 text-white animate-spin"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5652 10.4717 44.0585 10.1071C47.9245 9.47964 51.8739 9.45606 55.7864 10.0376C60.8783 10.8046 65.7866 12.6436 70.1807 15.4642C74.5749 18.2849 78.3772 22.0472 81.2926 26.5173C83.6066 29.7198 85.3664 33.2534 86.5045 36.9769C87.2886 39.4118 89.5422 40.9381 91.9676 40.301C93.9676 39.7639 95.3552 39.0409 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    Processing...
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="mt-5 tracking-wide font-semibold bg-[#f8f8f8] text-gray-100 w-full py-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  <div className="bg-white p-2 rounded-full">
                    <svg
                      className="w-6 h-6"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M24 9.5c3.5 0 6.2 1.5 8.1 2.7l6-6.1C34.6 3.4 29.8 1.5 24 1.5 14.7 1.5 6.8 7.3 3.4 15.2l7 5.4C12.1 14.5 17.5 9.5 24 9.5z"
                        fill="#EA4335"
                      />
                      <path
                        d="M46.5 24.5c0-1.7-.2-3.5-.5-5H24v9.5h12.8C35.8 33 30.4 37.5 24 37.5c-6.5 0-12-4.3-14.2-10.2l-7 5.4c3.4 7.9 11.3 13.7 21.2 13.7 6.1 0 11.3-2.1 15.5-5.6 4.4-3.8 7-9.5 7-16.3z"
                        fill="#4285F4"
                      />
                      <path
                        d="M9.8 28.4C9 26.3 8.5 24.1 8.5 21.8s.5-4.5 1.3-6.6l-7-5.4C1 13.5 0 17.1 0 21.8c0 4.7 1 8.3 2.8 11.9l7-5.3z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M24 48c6.8 0 12.6-2.3 16.8-6.2l-7.7-6.4c-2.1 1.6-4.9 2.6-9.1 2.6-5.9 0-10.8-4-12.5-9.5l-7.3 5.6c3.8 7.5 11.5 12.9 20.2 12.9z"
                        fill="#34A853"
                      />
                      <path d="M0 0h48v48H0z" fill="none" />
                    </svg>
                  </div>
                  <span className="ml-4 text-black">Sign up with Google</span>
                </button>
                <div className="my-12 border-b text-center">
                  <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                    Or sign Up with e-mail
                  </div>
                </div>
              </form>
              <div className="mx-auto max-w-xs relative">
                <div className="mb-2">
                  <Link to="/login">
                    <span className=" text-xs font-display font-semibold text-gray-700 cursor-pointer">
                      Already a user? Login
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
