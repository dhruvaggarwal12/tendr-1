import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import { lazy, useEffect } from "react";

// Root layout — adds a lightweight fade-in on every page transition
function RootLayout() {
  const { key } = useLocation();
  return <div key={key} className="route-fade"><Outlet /></div>;
}

// ── Eagerly loaded (critical path — loaded on first visit) ──────────────────
import Home             from "./pages/Home/Home";
import Auth             from "./pages/customer/Auth";
import VendorList       from './pages/customer/VendorList';
import VendorDetails    from './pages/customer/VendorDetails';
import TopRatedVendors  from "./pages/customer/TopRatedVendors";
import SearchResults    from './pages/search/SearchResults.jsx';
import NotFound         from "./pages/shared/NotFound";
import ErrorPage        from "./components/ErrorPage";
import OtpVerification  from "./pages/customer/OtpVerification";

// ── Lazy loaded (not on critical path — split into separate chunks) ─────────
const WeddingApp          = lazy(() => import("./wedding-stationery/WeddingApp"));
const EventPlanningForm   = lazy(() => import("./pages/customer/EventPlanning.jsx"));
const EventPlanning       = lazy(() => import("./pages/customer/EventPlanning.jsx"));
const AdminDashboard      = lazy(() => import("./pages/admin/Dashboard"));
const VendorRegistration  = lazy(() => import("./pages/vendor/Registration"));
const ApplicationStatus   = lazy(() => import("./pages/vendor/ApplicationStatus"));
const VendorOnboarding    = lazy(() => import("./pages/vendor/Onboarding"));
const VendorDashboard     = lazy(() => import("./pages/vendor/Dashboard"));
const VendorChatList      = lazy(() => import("./pages/vendor/ChatList"));
const VendorChat          = lazy(() => import("./pages/vendor/Chat"));
const CorporateLogin      = lazy(() => import("./pages/corporate/Login"));
const CorporateSignup     = lazy(() => import("./pages/corporate/SignUp.jsx"));
const CorporateBooking    = lazy(() => import("./pages/corporate/Booking"));
const CorporateDashboard  = lazy(() => import('./pages/corporate/Dashboard.jsx'));
const UserDashboard       = lazy(() => import("./pages/customer/Dashboard"));
const CustomerChatList    = lazy(() => import("./pages/customer/Chats"));
const Chat                = lazy(() => import('./pages/customer/Chat'));
const ChooseBooking       = lazy(() => import("./pages/customer/ChooseBooking"));
const GiftHampersCakes    = lazy(() => import('./pages/customer/GiftHampersCakes'));
const DecorFinder         = lazy(() => import('./pages/tools/DecorFinder.jsx'));
const GuestList           = lazy(() => import('./pages/tools/GuestList.jsx'));
const PaymentTracker      = lazy(() => import('./pages/tools/PaymentTracker.jsx'));
const CategoryGallery     = lazy(() => import('./pages/gallery/CategoryGallery.jsx'));
const TimelineBuilder     = lazy(() => import('./pages/timeline/TimelineBuilder'));
const Timeline            = lazy(() => import('./pages/timeline/Timeline'));
const TimelinePicker      = lazy(() => import('./pages/timeline/TimelinePicker'));
const Checkbox            = lazy(() => import('./pages/checkbox/Checkbox'));
const CheckboxPicker      = lazy(() => import('./pages/checkbox/CheckboxPicker.jsx'));
const PrebuiltCheckbox    = lazy(() => import('./pages/checkbox/PrebuiltCheckbox.jsx'));
const BudgetPicker        = lazy(() => import('./pages/budget/BudgetPicker.jsx'));
const BudgetAllocator     = lazy(() => import('./pages/budget/BudgetAllocator.jsx'));
const AftermoviePicker    = lazy(() => import('./pages/aftermovie/AftermoviePicker.jsx'));
const AftermovieCustomizer= lazy(() => import('./pages/aftermovie/AftermovieCustomizer.jsx'));
const InvitationFlyerPicker=lazy(() => import('./pages/invitation/InvitationFlyerPicker.jsx'));
const TemplateGallery     = lazy(() => import('./pages/invitation/TemplateGallery.jsx'));
const InvitationCustomizer= lazy(() => import('./pages/invitation/InvitationCustomizer.jsx'));
const WeddingStationery   = lazy(() => import('./pages/stationery/WeddingStationery.jsx'));
const StationeryCustomizer= lazy(() => import('./pages/stationery/StationeryCustomizer.jsx'));
const BookingReviewPage   = lazy(() => import('./pages/booking/BookingReviewPage'));
const PaymentSelectionPage= lazy(() => import('./pages/booking/PaymentSelectionPage'));
const PaymentProcessing   = lazy(() => import('./pages/booking/PaymentProcessingPage'));
const PaymentSuccessPage  = lazy(() => import('./pages/booking/PaymentSuccessPage'));
const PaymentFailedPage   = lazy(() => import('./pages/booking/PaymentFailedPage'));
const BookingConfirmation = lazy(() => import('./pages/booking/BookingConfirmation'));
const ReviewForm          = lazy(() => import('./pages/review/ReviewForm'));
const RefundPolicy        = lazy(() => import("./pages/info/RefundPolicy"));
const CancellationPolicy  = lazy(() => import("./pages/info/CancellationPolicy"));
const ContactUs           = lazy(() => import("./pages/info/ContactUs.jsx"));
const AboutUs             = lazy(() => import("./pages/info/AboutUs.jsx"));


const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
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
  { path: '/search', element: <SearchResults />, errorElement: <ErrorPage /> },
  { path: '/gallery/:category', element: <CategoryGallery />, errorElement: <ErrorPage /> },

  // ── Wedding Stationery Sub-App (/wedding/*) ──────────────────────────────
  // Remove this route to disable the sub-app completely
  {
    path: "/wedding/*",
    element: <WeddingApp />,
    errorElement: <ErrorPage />,
  },
  // ─────────────────────────────────────────────────────────────────────────
  ], // end children of RootLayout
  }, // end RootLayout route
]);


export default router;