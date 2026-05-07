import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home/Home";
import Auth from "./pages/customer/Auth";
import VendorRegistration from "./pages/vendor/Registration";
import EventPlanningForm from "./pages/customer/EventPlanning.jsx"; // ✅ use the new form
import NotFound from "./pages/shared/NotFound";
import ErrorPage from "./components/ErrorPage";
import CorporateLogin from "./pages/corporate/Login";
import CorporateSignup from "./pages/corporate/SignUp.jsx";

import VendorList from './pages/customer/VendorList';
import VendorDetails from './pages/customer/VendorDetails';
import Chat from './pages/customer/Chat';

import AdminDashboard from "./pages/admin/Dashboard";
import VendorOnboarding from "./pages/vendor/Onboarding";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorChatList from "./pages/vendor/ChatList";
import VendorChat from "./pages/vendor/Chat";

import CorporateBooking from "./pages/corporate/Booking";
import UserDashboard from "./pages/customer/Dashboard";
import OtpVerification from "./pages/customer/OtpVerification";

import RefundPolicy from "./pages/info/RefundPolicy";
import CancellationPolicy from "./pages/info/CancellationPolicy";
import ContactUs from "./pages/info/ContactUs.jsx";
import AboutUs from "./pages/info/AboutUs.jsx";

import ChooseBooking from "./pages/customer/ChooseBooking";

import CorporateDashboard from './pages/corporate/Dashboard.jsx';
import TimelineBuilder from './pages/timeline/TimelineBuilder';
import Timeline from './pages/timeline/Timeline';
import Checkbox from './pages/checkbox/Checkbox';
import TimelinePicker from './pages/timeline/TimelinePicker';
import CheckboxPicker from './pages/checkbox/CheckboxPicker.jsx';
import PrebuiltCheckbox from './pages/checkbox/PrebuiltCheckbox.jsx';
import BudgetPicker from './pages/budget/BudgetPicker.jsx';
import BudgetAllocator from './pages/budget/BudgetAllocator.jsx';

// only chat list for customers (no Conversation/ActiveChat components)
import CustomerChatList from "./pages/customer/Chats";
import EventPlanning from "./pages/customer/EventPlanning.jsx";
import GiftHampersCakes from './pages/customer/GiftHampersCakes';

import BookingReviewPage from './pages/booking/BookingReviewPage';
import PaymentSelectionPage from './pages/booking/PaymentSelectionPage';
import PaymentProcessing from './pages/booking/PaymentProcessingPage';
import PaymentSuccessPage from './pages/booking/PaymentSuccessPage';
import PaymentFailedPage from './pages/booking/PaymentFailedPage';
import BookingConfirmation from './pages/booking/BookingConfirmation';


const router = createBrowserRouter([
  { 
    path: "/", 
    element: <Home />, 
    errorElement: <ErrorPage /> 
  },
  {
    path: '/timeline-picker',
    element: <TimelinePicker />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/timeline',
    element: <TimelineBuilder />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/prebuilt-timeline',
    element: <Timeline />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/checklist',
    element: <Checkbox />,
    errorElement: <ErrorPage />,
  },
  
{ 
    path: '/corporate', 
    element: <CorporateBooking />,
    errorElement: <ErrorPage />
  },
  
  { 
    path: '/corporate/booking', 
    element: <CorporateBooking />,
    errorElement: <ErrorPage />
  },
  {
    path: '/corporateEventPlanning',
    element: <CorporateLogin />,
    errorElement: <ErrorPage />
  },

  { 
    path: "/AdminDashboard", 
    element: <AdminDashboard />,
    errorElement: <ErrorPage /> 
  },
  { 
    path: "/CorporateDashboard", 
    element: <CorporateDashboard />, 
    errorElement: <ErrorPage /> 
  },
  {
    path: '/otp',
    element: <OtpVerification />,
    errorElement: <ErrorPage />
  },
  { 
    path: '*', 
    element: <NotFound />,
    errorElement: <ErrorPage />
  },
  {
    path: '/UserDashboard',
    element: <UserDashboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/dashboard',
    element: <UserDashboard />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/corporate-signup',
    element: <CorporateSignup />,
    errorElement: <ErrorPage />,
  },
  //     {
  //       path: '/login',
  //   element: <CustomerAuth />,
  //   errorElement: <ErrorPage />
  // },
  //     {
  //   path: '/signup',
  //   element: <CustomerAuth />,
  //   errorElement: <ErrorPage />
  // },

  { 
    path: "/VendorRegistration", 
    element: <VendorRegistration />, 
    errorElement: <ErrorPage /> 
  },
  { 
    path: '/plan-event/form', 
    element: <EventPlanning />, 
    errorElement: <ErrorPage />
  },
  {
    path: '/chat',
    element: <Chat />,
    errorElement: <ErrorPage />,
  },
  {
    // legacy static route, keep for compatibility
    path: '/VendorDetails',
    element: <VendorDetails />,
    errorElement: <ErrorPage />,
  },
  {
    // preferred dynamic route
    path: '/vendor/:id',
    element: <VendorDetails />,
    errorElement: <ErrorPage />,
  },

  { 
    path: "/listings", 
    element: <VendorList />, 
    errorElement: <ErrorPage /> 
  },

  { 
    path: "/listings/:vendorType",
    element: <VendorList />, 
    errorElement: <ErrorPage /> 
  },

  // Auth
  { 
    path: "/login", 
    element: <Auth />, errorElement: <ErrorPage /> 
  },

  { 
    path: "/signup", 
    element: <Auth />, 
    errorElement: <ErrorPage /> 
  },
  {
    path: '/CorporateBooking',
    element: <CorporateBooking />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/vendor',
    errorElement: <ErrorPage />,
    children: [
      { path: "register", element: <VendorOnboarding /> },
      { path: "dashboard", element: <VendorDashboard /> },
      { path: "chats", element: <VendorChatList /> },
      { path: "chat", element: <VendorChat /> },
    ],
  },

  // Customer chat list (you-do-it)
  { 
    path: "/chats", 
    element: <CustomerChatList />, 
    errorElement: <ErrorPage /> 
  },

  // Booking entry
  { 
    path: "/booking", 
    element: <ChooseBooking />, 
    errorElement: <ErrorPage /> 
  },
    {
      path: "/booking/review",
      element: <BookingReviewPage />
    },
    {
      path: "/booking/payment",
      element: <PaymentSelectionPage />
    },
    {
      path: "/booking/payment-processing",
      element: <PaymentProcessing />
    },
    {
      path: "/booking/payment-success",
      element: <PaymentSuccessPage />
    },
    {
      path: "/booking/payment-failed",
      element: <PaymentFailedPage />
    },
    {
      path: "/booking/confirmation",
      element: <BookingConfirmation />
    },

  // Single form route (reads ?bookingType=you-do-it|let-us-do-it)
  { 
    path: "/plan-event/form", 
    element: <EventPlanningForm />, 
    errorElement: <ErrorPage /> 
  },

  // Info pages
  {
    path: "/contact-us",
    element: <ContactUs />,
    errorElement: <ErrorPage />
  },

  {
    path: "/about-us",
    element: <AboutUs />,
    errorElement: <ErrorPage />
  },

  { 
    path: "/refund-policy", 
    element: <RefundPolicy />, 
    errorElement: <ErrorPage /> 
  },

  { 
    path: "/cancellation-policy", 
    element: <CancellationPolicy />, 
    errorElement: <ErrorPage /> 
  },

  { 
    path: "/event-planning", 
    element: <EventPlanningForm />, 
    errorElement: <ErrorPage /> 
  },

  { 
    path: "*", 
    element: <NotFound />, 
    errorElement: <ErrorPage /> 
  },
  {
    path: '/checklist-picker',
    element: <CheckboxPicker />,
    errorElement: <ErrorPage />
  },
  {
    path: '/prebuilt-checklist',
    element: <PrebuiltCheckbox />,
    errorElement: <ErrorPage />
  },
  {
    path: '/budget-picker',
    element: <BudgetPicker />,
    errorElement: <ErrorPage />
  },
  {
    path: '/budget-allocator',
    element: <BudgetAllocator />,
    errorElement: <ErrorPage />
  },
  {
    path: '/gift-hampers-cakes',
    element: <GiftHampersCakes />,
    errorElement: <ErrorPage />,
  },
]);


export default router;