import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "../Helpers/Firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || "");
        console.log("user is", user);
      } else {
        setUserEmail("");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    setLoader(true);
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
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "restaurantOwners", user.uid));

      if (userDoc.exists()) {
        const token = await user.getIdToken();
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.uid);
        navigate("/restaurants");
      } else {
        setError("No record found for restaurant owner");
        auth.signOut();
      }
      setLoader(false);
    } catch (err: any) {
      CommonError(err);
    }
  };

  const handleGoogleLogin = async () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, "restaurantOwners", result.user.uid));

      if (userDoc.exists()) {
        const token = await result.user.getIdToken();
        localStorage.setItem("token", token);
        navigate("/restaurants");
      } else {
        setError("No record found for restaurant owner");
        auth.signOut();
      }
      setLoader(false);
    } catch (error: any) {
      CommonError(error);
    }
  };

  const CommonError = (err: any) => {
    setError(err.message);
    setLoader(false);
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return re.test(password);
  };

  return (
    <>
      <div
        className="h-screen flex justify-center items-center "
        style={{
          backgroundImage: "url(/bg.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="shadow-2xl bg-white rounded-t-full z-50 flex p-20 flex-col h-full">
          <div className="mt-12 flex flex-col justify-between ">
            <h1 className="text-lg xl:text-xl font-bold ">Signin to restaurant panel</h1>
            <div className="w-full flex-1 mt-6">
              <form className="mx-auto max-w-xs">
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                  type="email"
                  placeholder="Email/Username"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* <div className="flex my-4 justify-between items-center">
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
                  <Link
                    to={"/forgotpassword"}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Forgot password
                  </Link>
                </div> */}
                {error && <span className="mt-10 text-red-600">{error}</span>}

                {!loader ? (
                  <button
                    type="submit"
                    onClick={(e) => handleLogin(e)}
                    className="mt-5 tracking-wide font-semibold bg-[#97d721] text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                  >
                    Sign in
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
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                      />
                    </svg>
                    Sign in...
                  </button>
                )}
              </form>
            </div>
            {/* <p className="ml-2  text-sm text-gray-900 mt-8">
              Don’t have any account.{" "}
              <Link to={"/signup"}>
                <p className="text-[#97d721] font-bold"> Create Account </p>
              </Link>
            </p> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
