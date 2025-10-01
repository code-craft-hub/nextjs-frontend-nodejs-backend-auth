import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Reviews } from "@/constants";
const Testimonials = () => {
  return (
    <section className="bg-[#eff4ff]">
    <div className="px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden">
      <h1 className="font-bold text-3xl text-center text-blue-500">
        What Our Clients Say About Us
      </h1>
      <Swiper
        pagination={{
          clickable: true,
        }}
        loop={true}
        grabCursor={true}
        modules={[Pagination]}
        className="!py-16"
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 18,
          },

          768: {
            slidesPerView: 2,
            spaceBetween: 50,
          },
        }}
      >
        {Reviews.map(({ img, rating, title, des }, index) => (
          <SwiperSlide key={index} className="">
            <div className="flex w-full overflow-hidden">
              <div className="h-auto bg-blue-500/10 rounded-l-lg">
                <img src={img} className="h-full w-full" alt="" />
              </div>
              <div className="bg-white rounded-r-xl flex flex-col sm:gap-2 p-4 sm:p-8 w-full max-w-[600px]">
                <img src={rating} className="w-[30%] sm:w-[20%]" alt="" />
                <p className="font-bold sm:text-xl line-clamp-1">{title}</p>
                <p className="line-clamp-6 max-sm:text-sm">{des}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  </section>
  )
}

export default Testimonials