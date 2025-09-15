import { Pagination, Autoplay, Mousewheel, Keyboard } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { FaCircleCheck } from "react-icons/fa6";
import { useUserLocation } from "@/hooks/get-user-location";
import { creditCard } from "@/constants/data";
import { formatCurrencyNG, formatCurrencyUSA } from "@/lib/utils/helpers";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
const Pricing = () => {
  const { continent_code } = useUserLocation();
  const router = useRouter();

  return (
    <section className="h-[550px] w-full max-w-screen-xl mx-auto px-4 sm:px-8">
      <div className="relative">
        <div className="absolute w-full ">
          <Swiper
            loop={true}
            autoplay={true}
            mousewheel={{
              forceToAxis: true,
              releaseOnEdges: true,
            }}
            keyboard={true}
            modules={[Pagination, Autoplay, Mousewheel, Keyboard]}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 8,
              },

              600: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1000: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
            }}
          >
            {creditCard?.map(
              ({ amount, sub, credit, builder, limit, title }, index) => {
                let price = formatCurrencyNG(Number(amount));
                if (continent_code !== "AF") {
                  price = formatCurrencyUSA(Number(amount) / 100);
                }
                return (
                  <SwiperSlide
                    key={index}
                    className="bg-white border-2 hover:bg-[#4680EE] border-gray-100 p-4 sm:p-8 rounded-3xl gap-2 flex flex-col group"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="bg-blue-500/10 group-hover:bg-white rounded-xl p-2">
                        <img
                          src="/assets/images/elipse.png"
                          className="w-6"
                          alt=""
                        />
                      </div>
                      <p className="font-bold text-2xl group-hover:text-white ">
                        {title}
                      </p>
                    </div>
                    <div className="flex flex-col mt-8">
                      <div className="font-bold text-3xl  flex items-center gap-2">
                        <p className=" font-bold group-hover:text-white">
                          {Number(amount) > 100 ? price : amount}
                        </p>{" "}
                        <sub className="group-hover:text-white">{sub}</sub>
                      </div>
                      <p className="font-bold text-md group-hover:text-white my-4">
                        Features
                      </p>
                      <div className="flex gap-4 items-center">
                        <FaCircleCheck className="text-blue-500 group-hover:text-white" />{" "}
                        <p className="group-hover:text-white">Resume builder</p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <FaCircleCheck className="text-blue-500 group-hover:text-white" />{" "}
                        <p className="group-hover:text-white">{credit}</p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <FaCircleCheck className="text-blue-500 group-hover:text-white" />{" "}
                        <p className="group-hover:text-white">{builder}</p>
                      </div>
                      <div className="flex gap-4 items-center">
                        <FaCircleCheck className="text-blue-500 group-hover:text-white" />
                        <p className=" group-hover:text-white">{limit}</p>
                      </div>
                    </div>
                    <div
                      className="flex w-full justify-center mt-8"
                      onClick={() => router.push("/dashboard/credit")}
                    >
                      <Button className="rounded-3xl w-full group-hover:!text-blue-500 group-hover:!bg-white py-6 text-blue-500">
                        Get started
                      </Button>
                    </div>
                  </SwiperSlide>
                );
              }
            )}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
