import { Helmet } from "react-helmet-async";

const BASE_URL = "https://tendr-1.vercel.app";
const DEFAULT_IMG = `${BASE_URL}/og-image.png`;

export default function SEO({ title, description, path = "", image = DEFAULT_IMG, noIndex = false }) {
  const fullTitle = title
    ? `${title} | Tendr`
    : "Tendr — Event Planning & Vendor Booking in Delhi NCR";

  const canonical = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
