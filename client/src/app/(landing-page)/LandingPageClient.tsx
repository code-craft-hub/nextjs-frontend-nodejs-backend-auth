"use client"

import { useGetCurrentUser } from "@/lib/queries";
import Link from "next/link";

const LandingPageClient = () => {
  const { data: user } = useGetCurrentUser();
  return <div>
    
    <Link href="/login">Login</Link>
    <Link href="/register">Register</Link>
  </div>;
};

export default LandingPageClient;

// "use client";
// import { useEffect } from "react";
// import Footer from "@/components/landing-page/Footer";
// import Hero from "@/components/landing-page/Hero";
// import Aos from "aos";
// import "aos/dist/aos.css";
// import FAQ from "@/components/landing-page/FAQ";
// import Pricing from "@/components/landing-page/Pricing";
// import ReactGA from "react-ga4";
// import Features from "@/components/landing-page/Features";
// import { useHealthCheckQuery } from "@/lib/queries";
// import Whatsapp from "@/components/landing-page/Whatsapp";
// import { Header } from "@/components/landing-page/Header";

// function LandingPageClient() {
//   useEffect(() => {
//     ReactGA.send({
//       hitType: "pageview",
//       page: window.location.pathname + window.location.search,
//       title: "Home page",
//     });
//     ReactGA.event({
//       category: "Home page view",
//       action: "Visit Home page",
//       label: "Home page view",
//     });
//   }, []);
//   useEffect(() => {
//     Aos.init({
//       duration: 900,
//       delay: 10,
//       once: true,
//     });
//   }, []);
//   const { error } = useHealthCheckQuery();
//   if (error) console.error("[HealthCheck] Failed:", error);
//   return (
//     <div className="w-full bg-bg lg:bg-cover lg:bg-no-repeat overflow-x-hidden">
//       <Header />
//       <Hero />
//       <Features />
//       <Pricing />
//       <FAQ />
//       <Whatsapp />
//       <Footer />
//     </div>
//   );
// }
// export default LandingPageClient;
