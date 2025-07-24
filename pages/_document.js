import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Primary Meta Tags */}
        <meta name="title" content="The Smith Agency - Boutique Staffing Portal" />
        <meta name="description" content="Professional staffing solutions for clients and staff. Access your portal to manage bookings, availability, and staffing needs." />
        <meta name="keywords" content="staffing, agency, bookings, portal, professional services" />
        <meta name="author" content="The Smith Agency" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tsa-portal.vercel.app/" />
        <meta property="og:title" content="The Smith Agency - Boutique Staffing Portal" />
        <meta property="og:description" content="Professional staffing solutions for clients and staff. Access your portal to manage bookings, availability, and staffing needs." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="The Smith Agency" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tsa-portal.vercel.app/" />
        <meta property="twitter:title" content="The Smith Agency - Boutique Staffing Portal" />
        <meta property="twitter:description" content="Professional staffing solutions for clients and staff. Access your portal to manage bookings, availability, and staffing needs." />
        <meta property="twitter:image" content="/og-image.png" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#ec4899" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
