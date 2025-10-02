import { capitalize } from "lodash";
import { social } from "@/constants/data";
import Link from "next/link";
import { smoothlyScrollToView } from "@/lib/utils/helpers";
import { navItems } from "@/app/(landing-page)/constants";

export const Footer = () => {
  return (
    <footer id="footer" className="bg-[#E4ECFE]">
      <div className="px-4 sm:px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden">
        <div className="flex flex-col md:flex-row max-md:gap-8">
          {/* Brand + Social */}
          <div className="w-full md:w-5/12">
            <div>
              <img
                src="/assets/images/CVER Logo.png"
                className="w-[30%]"
                alt="CverAI Logo"
              />
            </div>
            <p className="mt-8 mb-4 font-bold text-slate-500">Follow us:</p>
            <div className="flex flex-wrap w-full gap-2 my-2">
              {social.map(({ href, icon }: any, index: number) => (
                <a
                  key={index}
                  className="text-[#667085] text-[28px] border-[2px] border-blue-200 p-2 rounded-full hover:scale-110 transition-transform duration-300"
                  href={href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company + Products */}
          <div className="flex flex-col max-md:gap-8 md:flex-row w-full md:w-5/12">
            {/* Company Nav */}
            <div className="flex w-full flex-col">
              <h2 className="text-xl font-medium mb-3 text-blue-500">
                Company
              </h2>
              <nav>
                <ul className="space-y-2 capitalize text-[15px]">
                  {navItems.map((item: any, index: number) => (
                    <li
                      key={index}
                      className="text-black hover:scale-105 transition-transform duration-300 cursor-pointer"
                    >
                      <Link
                        href={item.url}
                        onClick={(e) => smoothlyScrollToView(e,item.url)}
                        className="transition-all duration-300 flex gap-4 capitalize"
                      >
                        {capitalize(item.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Product Nav */}
            <div className="flex w-full flex-col">
              <h2 className="text-xl font-medium mb-3 text-blue-500">
                Products
              </h2>
              <Link
                href="/dashboard/resume"
                className="mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                AI Resume
              </Link>
              <Link
                href="/dashboard/letter"
                className="mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                AI Cover Letter
              </Link>
              <Link
                href="/dashboard/question"
                className="mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
              >
                AI Interview Questions
              </Link>
            </div>
          </div>

          {/* Legal Nav */}
          <div className="flex w-full md:w-2/12 flex-col">
            <h2 className="text-xl font-medium mb-3 text-blue-500">Legals</h2>
            <Link
              href="/terms"
              className="mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              Terms and Conditions
            </Link>
            <Link
              href="/policy"
              className="mb-2 hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
