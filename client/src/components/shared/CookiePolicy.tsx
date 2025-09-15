import { useEffect, useState } from "react";
import { Button } from "../ui";
import Cookies from "js-cookie";
const CookiePolicy = () => {
  const [toggleCookie, setToggleCookie] = useState(false);
  const changeCookieState = () => {
    setToggleCookie(!toggleCookie);
    Cookies.set("policy", toggleCookie.toString());
  };

  useEffect(() => {
    const cookiePolicy = Cookies.get("policy");
    if (cookiePolicy) {
      setToggleCookie(cookiePolicy === "true");
    }
  }, []);

  if (toggleCookie) return null;
  return (
    <div className="fixed bottom-2 left-2 max-w-md bg-white p-4 shadow-lg rounded-md z-50">
      <div className="space-y-4">
        <h1 className="font-medium text-xl">We use cookies! 🍪</h1>
        <p className="">
          This website uses cookies to improve your browsing experience, provide
          personalized content and ensure the website functions optimally. By
          continuing to use our site, you agree to our use of cookies. We value
          your privacy and are committed to protecting your personal
          information. For more details, please refer to our{" "}
          <span className="text-blue-400">Cookie Policy.</span>
        </p>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() => changeCookieState}
            className="w-full bg-gray-100"
          >
            Reject all
          </Button>
          <Button
            variant={"outline"}
            onClick={() => changeCookieState}
            className="w-full bg-gray-100"
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
