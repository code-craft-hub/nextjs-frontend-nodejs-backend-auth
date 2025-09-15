import { navigation } from "@/constants/data";
import { useRouter } from "next/navigation";
import { Link as ReactScroll } from "react-scroll";

const Nav = () => {
  const router = useRouter();

  // TODO PATHNAME
  const pathname = "TODO"
  return (
    <nav className=" h-[68px] flex items-center justify-center">
      <ul className="flex space-x-8 capitalize text-[15px] h-full">
        {navigation.map((item: any, index: any) => {
          return (
            <li
              className="hover:text-blue-500 h-full justify-center items-center flex  cursor-pointer hover:border-b-2 hover:border-blue-500 "
              key={index}
            >
              <ReactScroll
                to={item.href}
                activeClass="border-b-2 border-blue-500"
                spy={true}
                smooth={true}
                duration={500}
                offset={-70}
                className={`transition-all duration-300 flex gap-4 h-full min-w-[50px] justify-center items-center ${
                  item?.href === pathname && "border-b-2 border-blue-500"
                } `}
              >
                <p
                  onClick={() => {
                    index === 4 && router.push("/job-listings");
                    index === 5 && router.push("/blog");
                    index <= 3 && router.push("/");
                  }}
                >
                  {item.name}
                </p>
              </ReactScroll>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Nav;
