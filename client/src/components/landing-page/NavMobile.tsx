import { useState } from "react";
import { navigation } from "@/constants/data";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link as NewSection } from "react-scroll";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

const NavMobile = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [position, setPosition] = useState("top");
  console.log("USER IN NAV MOBILE : ", user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className=" h-16 flex justify-center items-center">
          <GiHamburgerMenu className="text-black w-8 h-8" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-screen shadow-none border-none bg-transparent py-4 px-7">
        <DropdownMenuRadioGroup
          value={position}
          onValueChange={setPosition}
          className=" py-4 px-4 rounded-md shadow bg-white"
        >
          <div className="px-4">
            {navigation.map(({ name, href, position }, index) => {
              return (
                <NewSection
                  key={index}
                  to={href}
                  activeClass={` text-blue-400 font-bold rounded-md `}
                  spy={true}
                  isDynamic={true}
                  ignoreCancelEvents={false}
                  spyThrottle={500}
                  smooth={true}
                  duration={200}
                  offset={-100}
                >
                  <DropdownMenuRadioItem
                    value={position}
                    className="cursor-pointer uppercase"
                    onClick={() => {
                      index === 4 && router.push("/job-listings");
                      index === 5 && router.push("/blog");
                      index <= 3 && router.push("/");
                    }}
                  >
                    {name}
                  </DropdownMenuRadioItem>
                </NewSection>
              );
            })}
          </div>
          <div className="w-full p-4">
            {}
            {!!user ? (
              <Button
                onClick={() => {
                  router.push("/dashboard");
                }}
                className="w-full"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => {
                  router.push("/sign-in");
                }}
                className="w-full"
              >
                Login
              </Button>
            )}
          </div>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavMobile;
