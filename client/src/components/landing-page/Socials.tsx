import user1 from "../../../assets/img/user1.png";
import { CreditCard, LayoutDashboard, LogOut, Home } from "lucide-react";
import ProgressBar from "@ramonak/react-progress-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSignOutAccount } from "@/lib/queries";
import Link from "next/link";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const Socials = () => {
  const { user:dbUser } = useAuth();
  const { mutate: signOutAccount } = useSignOutAccount();
  const handleLogout = async () => {
    try {
      signOutAccount();
      localStorage?.clear();
      localStorage?.removeItem("array");
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };
  const contextUser = {
    firstName: "",
    lastName: "",
    photoURL: "",
  };

  const router = useRouter();
  const Email = user?.email;

  const mobile = false;
  return (
    <>
      {!Email ? (
        <div className=" flex items-center justify-center flex-col md:flex-row gap-4">
          <Link href="/sign-in">
            <Button className="px-8">Log in</Button>
          </Link>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {mobile ? (
              <div className="hover:cursor-pointer ">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex flex-col lg:flex-row items-center">
                    {/*  bg-[#4e73df] */}
                    <div className="w-12 h-12 rounded-full relative overflow-hidden  cursor-pointer flex items-center justify-center ">
                      <img
                        src={
                          dbUser?.photoURL ||
                          dbUser?.firestoreProfileImage ||
                          dbUser?.photoURL ||
                          contextUser?.photoURL ||
                          user1
                        }
                        className="rounded-full"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hover:cursor-pointer ">
                <div className="flex items-center justify-center gap-2">
                  <p>{dbUser?.credit} </p>
                  <p> Credits</p>
                  <img src="" alt="" />

                  <div className="flex flex-col lg:flex-row items-center">
                    <div className="w-12 h-12 rounded-full relative overflow-hidden  cursor-pointer flex items-center justify-center">
                      <img
                        src={
                          dbUser?.photoURL ||
                          dbUser?.firestoreProfileImage ||
                          dbUser?.photoURL ||
                          contextUser?.photoURL ||
                          user1
                        }
                        className="rounded-full"
                        alt=""
                      />
                    </div>
                    <p className="uppercase py-2 text-black px-4">
                      {dbUser?.firstName ||
                        contextUser.firstName ||
                        contextUser.lastName ||
                        dbUser?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent className="">
            {mobile ? (
              <div className="">
                <div className="bg-slate-200 rounded-2xl items-center justify-center w-full h-full flex">
                  <div className="bg-slate-100  rounded-2xl p-2">
                    <div className="flex gap-x-2 items-center bg-white justify-center hover:shadow-xl hover:bg-slate-100 hover:cursor-pointer hover:scale-105 duration-500 p-1 rounded-2xl">
                      <div className="w-12 h-12 rounded-full relative overflow-hidden flex items-center justify-center ">
                        <img
                          src={
                            dbUser?.photoURL ||
                            dbUser?.firestoreProfileImage ||
                            dbUser?.photoURL ||
                            contextUser?.photoURL ||
                            user1
                          }
                          alt=""
                        />
                      </div>
                      <div className="">
                        <h1 className="">
                          {dbUser?.firstName ||
                            contextUser.firstName ||
                            contextUser.lastName ||
                            dbUser?.lastName}
                        </h1>
                        <div className="flex items-center justify-center gap-x-1">
                          <p>{Email}</p>
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white my-2 p-1 rounded-2xl hover:bg-slate-200 hover:cursor-pointer hover:scale-105 duration-500 ">
                      <ProgressBar
                        completed={Math.round(
                          (dbUser?.credit / dbUser?.maxCredit) * 100
                        )}
                        maxCompleted={dbUser?.maxCredit}
                      />
                      <Link
                        href="/dashboard/credit"
                        className="py-2 font-semibold text-slate-500a bg-rose-500 flex justify-evenly gap-x-2"
                        style={{ fontFamily: "Open Sans, sans-serif" }}
                      >
                        <CreditCard /> {dbUser?.credit} credit left
                        <span className="px-1 text-blue-500 underline">
                          Top Up
                        </span>
                      </Link>
                    </div>
                    <div>
                      <div className="my-3 bg-white hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-105 duration-500 rounded-2xl p-2">
                        <p
                          onClick={() => {
                            router.push("/");
                          }}
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <Home /> Home
                        </p>
                      </div>
                      <div className="my-3 bg-white hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-105 duration-500 rounded-2xl p-2">
                        <Link
                          href="/dashboard"
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <LayoutDashboard /> Dashboard
                        </Link>
                      </div>
                      <div className="my-3 bg-white hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-105 duration-500 rounded-2xl p-2">
                        <p
                          onClick={handleLogout}
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <LogOut /> Logout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="">
                <div className="bg-slate-200 rounded-2xl items-center justify-center w-full h-full flex">
                  <div className="bg-slate-100  rounded-2xl p-5">
                    <div className="flex gap-x-2 items-center bg-white justify-center hover:shadow-xl hover:bg-slate-100 hover:cursor-pointer hover:scale-110 duration-500 p-2 rounded-2xl">
                      <div className="w-12 h-12 rounded-full relative overflow-hidden flex items-center justify-center">
                        <img
                          src={
                            dbUser?.photoURL ||
                            dbUser?.firestoreProfileImage ||
                            dbUser?.photoURL ||
                            contextUser?.photoURL ||
                            user1
                          }
                          alt=""
                        />
                      </div>
                      <div className="">
                        <h1 className="font-semibold">
                          {dbUser?.firstName ||
                            contextUser.firstName ||
                            contextUser.lastName ||
                            dbUser?.lastName}
                        </h1>
                        <div className="flex items-center justify-center gap-x-1">
                          <p>{Email}</p>
                          <span className="w-3 h-3 rounded-full bg-green-400 animate-ping"></span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white my-4 p-2 rounded-2xl hover:bg-slate-200 hover:cursor-pointer hover:scale-110 duration-500 ">
                      <ProgressBar
                        completed={Math.round(
                          (dbUser?.credit / dbUser?.maxCredit) * 100
                        )}
                        maxCompleted={dbUser?.maxCredit}
                      />
                      <Link
                        href="/dashboard/credit"
                        className="py-2 font-semibold text-slate-500 flex justify-evenly gap-x-2"
                        style={{ fontFamily: "Open Sans, sans-serif" }}
                      >
                        <CreditCard />
                        {dbUser?.credit}
                        credit left
                        <span className="px-1 text-blue-500 underline">
                          Top Up
                        </span>
                      </Link>
                    </div>
                    <div>
                      <div className="my-3 bg-white hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-110 duration-500 rounded-2xl p-2">
                        <p
                          onClick={() => {
                            router.push("/");
                          }}
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <Home /> Home
                        </p>
                      </div>
                      <div className="my-3 bg-white hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-110 duration-500 rounded-2xl p-2">
                        <Link
                          href="/dashboard"
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <LayoutDashboard /> Dashboard
                        </Link>
                      </div>
                      <div
                        onClick={handleLogout}
                        className="my-3 hover:shadow-xl border-b shadow hover:bg-slate-100 hover:cursor-pointer hover:scale-110 duration-500 rounded-2xl p-2"
                      >
                        <button
                          className="py-2 font-semibold text-slate-500 flex gap-x-2"
                          style={{ fontFamily: "Open Sans, sans-serif" }}
                        >
                          <LogOut /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default Socials;
