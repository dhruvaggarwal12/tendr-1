import React from "react";
import SEO from "../../components/SEO";
import VendorRegistration from "./Registration";

export default function VendorOnboarding() {
  return (
    <>
      <SEO
        title="Register as an Event Vendor in Delhi NCR | Join Tendr"
        description="Join Tendr as a verified event vendor — decorators, caterers, photographers, DJs and more. Reach thousands of customers planning birthdays, anniversaries and corporate events across Delhi, Noida, Gurgaon and Ghaziabad."
        path="/vendor/register"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Vendor Registration", path: "/vendor/register" }]}
      />
      <VendorRegistration />
    </>
  );
}
