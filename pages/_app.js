import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
import ErrorBoundary from "../components/ErrorBoundary";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <Component {...pageProps} />
        <Analytics />
      </SessionProvider>
    </ErrorBoundary>
  );
}
