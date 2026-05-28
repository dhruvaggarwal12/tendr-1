import { createBrowserRouter } from "react-router-dom";

// ─── Wedding Stationery Sub-App ───────────────────────────────────────────────
// Accessible at /wedding — standalone design + ordering system (localStorage only)
// To DISABLE: comment out the { path: "/wedding/*", ... } route below
import WeddingApp from "./wedding-stationery/WeddingApp";
// ─────────────────────────────────────────────────────────────────────────────

import Home from "./pages/Home/Home";
import Auth from "./pages/customer/Auth";
import VendorRegistration from "./pages/vendor/Registration";
import ApplicationStatus from "./pages/vendor/ApplicationStatus";
import TopRatedVendors from "./pages/customer/TopRatedVendors";
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
import AftermoviePicker from './pages/aftermovie/AftermoviePicker.jsx';
import AftermovieCustomizer from './pages/aftermovie/AftermovieCustomizer.jsx';
import InvitationFlyerPicker from './pages/invitation/InvitationFlyerPicker.jsx';
import TemplateGallery from './pages/invitation/TemplateGallery.jsx';
import InvitationCustomizer from './pages/invitation/InvitationCustomizer.jsx';
import WeddingStationery from './pages/stationery/WeddingStationery.jsx';
import StationeryCustomizer from './pages/stationery/StationeryCustomizer.jsx';
import PaymentTracker from './pages/tools/PaymentTracker.jsx';
import GuestList from './pages/tools/GuestList.jsx';
import DecorFinder from './pages/tools/DecorFinder.jsx';
import CategoryGallery from './pages/gallery/CategoryGallery.jsx';

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
import ReviewForm from './pages/review/ReviewForm';


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

  {
    path: "/top-rated/:category",
    element: <TopRatedVendors />,
    errorElement: <ErrorPage />,
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
      { path: "status", element: <ApplicationStatus /> },
      // Vendor dashboard disabled for now
      // { path: "dashboard", element: <VendorDashboard /> },
      // { path: "chats", element: <VendorChatList /> },
      // { path: "chat", element: <VendorChat /> },
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
    {
      path: "/review",
      element: <ReviewForm />,
      errorElement: <ErrorPage />,
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
    element: <Checkbox />,
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
  { path: '/aftermovie', element: <AftermoviePicker />, errorElement: <ErrorPage /> },
  { path: '/aftermovie/customize/:id', element: <AftermovieCustomizer />, errorElement: <ErrorPage /> },
  { path: '/invitation', element: <InvitationFlyerPicker />, errorElement: <ErrorPage /> },
  { path: '/invitation/templates/:id', element: <TemplateGallery />, errorElement: <ErrorPage /> },
  { path: '/invitation/customize', element: <InvitationCustomizer />, errorElement: <ErrorPage /> },
  { path: '/stationery', element: <WeddingStationery />, errorElement: <ErrorPage /> },
  { path: '/stationery/:id', element: <StationeryCustomizer />, errorElement: <ErrorPage /> },
  { path: '/payment-tracker', element: <PaymentTracker />, errorElement: <ErrorPage /> },
  { path: '/guest-list', element: <GuestList />, errorElement: <ErrorPage /> },
  { path: '/decor-finder', element: <DecorFinder />, errorElement: <ErrorPage /> },
  { path: '/gallery/:category', element: <CategoryGallery />, errorElement: <ErrorPage /> },

  // ── Wedding Stationery Sub-App (/wedding/*) ──────────────────────────────
  // Remove this route to disable the sub-app completely
  {
    path: "/wedding/*",
    element: <WeddingApp />,
    errorElement: <ErrorPage />,
  },
  // ─────────────────────────────────────────────────────────────────────────
]);


export default router;