"use client";
import {useEffect} from "react"
import FAQ from "@/components/landing-page/FAQ";
import Features from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import { Header } from "@/components/landing-page/Header";
import Hero from "@/components/landing-page/Hero";
import Pricing from "@/components/landing-page/Pricing";
import Whatsapp from "@/components/landing-page/Whatsapp";
import { useAuth } from "@/hooks/use-auth";
import ReactGA from "react-ga4";
import Aos from "aos";
import "aos/dist/aos.css";
import { useHealthCheckQuery } from "@/lib/queries";

const LandingPageClient = () => {
  const { user } = useAuth();
  console.log("USER IN LANDING PAGE CLIENT : ", user);
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname + window.location.search,
      title: "Home page",
    });
    ReactGA.event({
      category: "Home page view",
      action: "Visit Home page",
      label: "Home page view",
    });
  }, []);
  useEffect(() => {
    Aos.init({
      duration: 900,
      delay: 10,
      once: true,
    });
  }, []);
  const { error } = useHealthCheckQuery();
  if (error) console.error("[HealthCheck] Failed:", error);
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Whatsapp />
      <Footer />
    </div>
  );
};

export default LandingPageClient;

