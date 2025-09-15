import { useEffect, useState } from "react";
import top from "../../../assets/img/backtotopbtn.png";
import { animateScroll as scroll } from "react-scroll";

const BackToTopButton = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); 

  const scrollToTop = () => {
    scroll.scrollToTop();
  };

  return (
    show && (
      <img
        className="fixed right-4 bottom-24 cursor-pointer flex justify-center items-center transition-all"
        onClick={scrollToTop}
        src={top}
        alt="Back to Top"
      />
    )
  );
};

export default BackToTopButton;
