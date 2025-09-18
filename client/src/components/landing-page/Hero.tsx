import { FaRegHeart } from "react-icons/fa6";
import { FaArrowUpLong } from "react-icons/fa6";
import "swiper/css";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";

import "swiper/css/pagination";
import Typewriter from "typewriter-effect";
import { toast } from "sonner";
import FeaturesJob from "./FeaturesJob";
import { Textarea } from "../ui/textarea";
import SelectJobDescription from "./SeleteJobDescription";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IUser } from "@/types";

const FormSchema = z.object({
  profileDescription: z
    .string()
    .min(10, "Job Description must be at least 10 characters"),
});

type FormSchemaType = z.infer<typeof FormSchema>;
const Hero = () => {
  const { user: dbUser } = useAuth();
  const selectedProfileRef = useRef<string>("");
  const dataSrcRef = useRef<any>("");
  const dataRef = useRef<IUser>({});

  useEffect(() => {
    try {
      selectedProfileRef.current = dbUser?.dataSource?.[0]?.data ?? "";
      dataSrcRef.current = dbUser?.dataSource?.[0];
      dataRef.current = dbUser!;
    } catch (error) {
      console.error(error);
    }
  }, [dbUser]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
  });
  const email = dbUser?.email;
  const onSubmit = async (data: FormSchemaType) => {
    if (!email) {
      router.push("/sign-in");
      return;
    }
    localStorage?.removeItem("hasResumeAPICalled");
    if (
      typeof dbUser?.credit === "number" &&
      (dbUser.credit === 0 || dbUser.credit <= 0)
    ) {
      toast.error("You've used up your create. Top up here.");
      setTimeout(() => {
        router.push("/dashboard/credit");
      }, 4000);
      return;
    }

    const regex = /^(.)\1*$/;

    if (regex.test(getValues("profileDescription")))
      return toast.error(
        "characters entered can't be consecutive. E.g ssssssssssssssss"
      );

    const dataSrc = selectedProfileRef.current;
    const dataSrcObject = dataSrcRef.current;

    if (
      dataSrc == undefined ||
      dataSrc == "undefined" ||
      dataSrc == "" ||
      dataSrc == " "
    ) {
      toast.error(
        "You haven't created any profile yet, I'm redirecting you to the profile page."
      );
      setTimeout(() => {
        router.push("/dashboard/profile");
      }, 5000);
      return;
    }
    const jobDesc = data.profileDescription.substring(0, 1500);
    const docID = uuid();
    router.push(
      `/dashboard/resume/${docID}`
      // TODO: PASS DATA WITH STATE WHILE NAVIGATING
      //   , {
      //   state: { jobDesc, dataSrc, dataSrcObject, docID },
      //   replace: true,
      // }
    );
    reset();
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-8">
      <section
        id="howitworks"
        className="px-4 sm:px-8 w-full max-w-screen-xl mx-auto py-8 sm:py-16 overflow-hidden"
      >
        <div data-aos="fade-down" className="flex items-center flex-col gap-2">
          <div className="text-xl sm:text-3xl lg:text-5xl font-bold flex justify-center items-center text-center">
            <span className="text-blue-500 mr-2 text-center">AI Crafted </span>
            <Typewriter
              options={{
                strings: ["Resume", "Cover Letter", "Interview Question"],
                autoStart: true,
                loop: true,
              }}
            />
          </div>
          <p className="sm:text-xl text-gray-400 mb-4 text-center">
            Custom Made for Every Job Posting.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-aos="fade-down"
          data-aos-delay="500"
          className="flex flex-col relative "
        >
          <div>
            <Textarea
              rows={8}
              className="resize-none "
              placeholder="Input Job Description here."
              {...register("profileDescription")}
            ></Textarea>
            <button
              title="submit"
              type="submit"
              className="flex absolute bottom-4 right-4 bg-blue-400 p-2 rounded-full hover:cursor-pointer"
              // onClick={() => router.push("/dashboard")}
            >
              <FaArrowUpLong className="text-white" />
            </button>
          </div>
        </form>
        {errors.profileDescription && (
          <p className="text-red-500 mt-2 pb-2">
            {errors.profileDescription.message}
          </p>
        )}
        <div className="" data-aos="fade-down" data-aos-delay="1000">
          <SelectJobDescription />
          <FeaturesJob dbUser={dbUser} />
          <img src="/assets/images/dashboard.png" alt="" className="mt-4" />
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8 justify-center">
            <div className="flex flex-col">
              <div className="flex gap-2 items-center mb-2">
                <FaRegHeart className="text-blue-500 h-6 w-6" />
                <h1 className="font-bold">User-friendly Interface</h1>
              </div>
              <p className=" max-w-[500px]">
                Navigate our website effortlessly with an intuitive interface
                that makes creating and editing your resume a breeze.
              </p>
            </div>
            <div className="flex flex-col">
              <div className="flex gap-2 items-center mb-2">
                <img src="/assets/images/square.png" alt="" />
                <h1 className="font-bold">Custom Section Headings</h1>
              </div>
              <p className=" max-w-[500px]">
                Easily customize section headings to fit your unique experience
                and industry, allowing you to highlight what matters most to
                poetential employers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
