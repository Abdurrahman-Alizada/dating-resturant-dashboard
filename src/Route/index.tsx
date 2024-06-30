import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../Layout/AuthLayout";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";
import ForgotPassword from "../Auth/ForgotPassword";
import MobileNumberLogin from "../Auth/MobileNumberLogin";
import DefaultLayout from "../Layout/DefaultLayout";
import Resturants from "../Component/Pages/Resturants/Resturants"
import NotFound from "../Component/Pages/NotFound/NotFound";
import ListYourResturantIndex from "../Component/Pages/ListYourResturant/ListYourResturantIndex";
import ResturantDetails from "../Component/Pages/Resturants/ResturantDetails/ResturantDetailsIndex";
import ReservationRequestIndex from "../Component/Pages/ReservationRequests/ReservationRequestIndex";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
  },
  {
    path: "/",
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "forgotpassword",
        element: <ForgotPassword />,
      },
      {
        path: "phone-login",
        element: <MobileNumberLogin />,
      },
    ],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "resturants",
        element: <Resturants />,
      },
      {
        path: "list-your-resturant",
        element: <ListYourResturantIndex />,
      },
      {
        path: "reservation-request",
        element: <ReservationRequestIndex />,
      },
      {
        path: "resturant-detail/:resturantId",
        element: <ResturantDetails />,
      }
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
export default routes;
