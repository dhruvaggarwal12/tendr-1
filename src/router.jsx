import { createBrowserRouter, Outlet, ScrollRestoration } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import MobileBottomNav from "./components/MobileBottomNav";
import { fetchEventData } from "./redux/eventPlanningSlice";
import { syncProgressOnLogin } from "./utils/progressSync";

function AppInit() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  useEffect(() => {
    if (token) {
      dispatch(fetchEventData(token));
      syncProgressOnLogin(token);
    }
  }, [token, dispatch]);
  return null;
}

// Root layout — FloatingChatButton + VendorChatModal remain in App.jsx
// because they already use router.state + router.navigate() directly
// (not useNavigate/useLocation hooks), so they don't need Router context.
function RootLayout() {
  return (
    <>
      <AppInit />
      <ScrollRestoration />
      <PWAInstallPrompt />
      <MobileBottomNav />
      <Outlet />
    </>
  );
}

// ── Eagerly loaded (critical path — loaded on first visit) ──────────────────
import Home             from "./pages/Home/Home";
import Auth             from "./pages/customer/Auth";
import VendorList       from './pages/customer/VendorList';
import VendorDetails    from './pages/customer/VendorDetails';
import SearchResults    from './pages/search/SearchResults.jsx';
import NotFound         from "./pages/shared/NotFound";
import ErrorPage        from "./components/ErrorPage";
import OtpVerification  from "./pages/customer/OtpVerification";
// Eagerly loaded — Chats accessed via bottom nav, must not show blank Suspense screen
import CustomerChatList from "./pages/customer/Chats";

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
// CustomerChatList = eagerly loaded above (not lazy — must not show blank Suspense fallback)
const Chat                = lazy(() => import('./pages/customer/Chat'));
const ChooseBooking       = lazy(() => import("./pages/customer/ChooseBooking"));
const BaatKaro            = lazy(() => import("./pages/customer/BaatKaro"));
const GiftHampersCakes    = lazy(() => import('./pages/customer/GiftHampersCakes'));
const DecorFinder         = lazy(() => import('./pages/tools/DecorFinder.jsx'));
const FindByStyle         = lazy(() => import('./pages/customer/FindByStyle.jsx'));
const GuestList           = lazy(() => import('./pages/tools/GuestList.jsx'));
const PaymentTracker      = lazy(() => import('./pages/tools/PaymentTracker.jsx'));
const CategoryGallery     = lazy(() => import('./pages/gallery/CategoryGallery.jsx'));
const TimelineBuilder     = lazy(() => import('./pages/timeline/TimelineBuilder'));
const Timeline            = lazy(() => import('./pages/timeline/Timeline'));
const TimelinePicker      = lazy(() => import('./pages/timeline/TimelinePicker'));
const BudgetPicker        = lazy(() => import('./pages/budget/BudgetPicker.jsx'));
const BudgetAllocator     = lazy(() => import('./pages/budget/BudgetAllocator.jsx'));
const WeddingStationery   = lazy(() => import('./pages/stationery/WeddingStationery.jsx'));
const StationeryCustomizer= lazy(() => import('./pages/stationery/StationeryCustomizer.jsx'));
const BookingReviewPage   = lazy(() => import('./pages/booking/BookingReviewPage'));
const PaymentSelectionPage= lazy(() => import('./pages/booking/PaymentSelectionPage'));
const PaymentProcessing   = lazy(() => import('./pages/booking/PaymentProcessingPage'));
const PaymentSuccessPage  = lazy(() => import('./pages/booking/PaymentSuccessPage'));
const PaymentFailedPage   = lazy(() => import('./pages/booking/PaymentFailedPage'));
const BookingConfirmation = lazy(() => import('./pages/booking/BookingConfirmation'));
const ReviewForm          = lazy(() => import('./pages/review/ReviewForm'));
const FeedbackForm        = lazy(() => import('./pages/review/FeedbackForm'));
const GuidesStore         = lazy(() => import('./pages/guides/GuidesStore'));
const GuidePreview        = lazy(() => import('./pages/guides/GuidePreview'));
const GuideReader         = lazy(() => import('./pages/guides/GuideReader'));
const RefundPolicy        = lazy(() => import("./pages/info/RefundPolicy"));
const CancellationPolicy  = lazy(() => import("./pages/info/CancellationPolicy"));
const ContactUs           = lazy(() => import("./pages/info/ContactUs.jsx"));
const AboutUs             = lazy(() => import("./pages/info/AboutUs.jsx"));
const InstallApp          = lazy(() => import("./pages/install/InstallApp.jsx"));
const OccasionsPage       = lazy(() => import("./pages/occasions/OccasionsPage.jsx"));
const OccasionDetail      = lazy(() => import("./pages/occasions/OccasionDetail.jsx"));
const MemoriesPage        = lazy(() => import("./pages/memories/MemoriesPage.jsx"));
const MemoryProfile       = lazy(() => import("./pages/memories/MemoryProfile.jsx"));
const PartyPlacesPage     = lazy(() => import("./pages/party-places/PartyPlacesPage.jsx"));
const PartyPlaceProfile   = lazy(() => import("./pages/party-places/PartyPlaceProfile.jsx"));
const CommunityWall       = lazy(() => import("./pages/community/CommunityWall.jsx"));
const CelebrationHub      = lazy(() => import("./pages/celebration-hub/CelebrationHub.jsx"));
const FunActivitiesPage   = lazy(() => import("./pages/fun-activities/FunActivitiesPage.jsx"));
const HomeWeddingPlanner  = lazy(() => import("./pages/home-wedding/HomeWeddingPlanner.jsx"));


import LaunchLivePage from "./pages/LaunchLivePage";

const router = createBrowserRouter([
  {
    path: "/launch-live",
    element: <LaunchLivePage />,
  },
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
    path: "/baat-karo",
    element: <BaatKaro />,
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
    {
      path: "/feedback",
      element: <FeedbackForm />,
      errorElement: <ErrorPage />,
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
    path: "/install",
    element: <InstallApp />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/occasions",
    element: <OccasionsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/occasions/:slug",
    element: <OccasionDetail />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/party-places",
    element: <PartyPlacesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/party-places/:id",
    element: <PartyPlaceProfile />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/community",
    element: <CommunityWall />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/celebration-hub",
    element: <CelebrationHub />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/fun-activities",
    element: <FunActivitiesPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/home-wedding-planner",
    element: <HomeWeddingPlanner />,
    errorElement: <ErrorPage />,
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
  { path: '/memories', element: <MemoriesPage />, errorElement: <ErrorPage /> },
  { path: '/memories/:id', element: <MemoryProfile />, errorElement: <ErrorPage /> },
  { path: '/stationery', element: <WeddingStationery />, errorElement: <ErrorPage /> },
  { path: '/stationery/:id', element: <StationeryCustomizer />, errorElement: <ErrorPage /> },
  { path: '/payment-tracker', element: <PaymentTracker />, errorElement: <ErrorPage /> },
  { path: '/guest-list', element: <GuestList />, errorElement: <ErrorPage /> },
  { path: '/decor-finder',  element: <DecorFinder />,  errorElement: <ErrorPage /> },
  { path: '/find-by-style', element: <FindByStyle />, errorElement: <ErrorPage /> },
  { path: '/search', element: <SearchResults />, errorElement: <ErrorPage /> },
  { path: '/gallery/:category', element: <CategoryGallery />, errorElement: <ErrorPage /> },
  { path: '/guides', element: <GuidesStore />, errorElement: <ErrorPage /> },
  { path: '/guides/:slug', element: <GuidePreview />, errorElement: <ErrorPage /> },
  { path: '/guides/:slug/read', element: <GuideReader />, errorElement: <ErrorPage /> },

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