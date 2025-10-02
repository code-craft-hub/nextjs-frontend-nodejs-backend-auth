import { MouseEvent, useRef, useState } from "react";

type UserDocProps = {
  img: string;
  title: string;
  total: string;
  link: string;
}[];

export default function HorizontalCardSlider({
  userResumes,
}: {
  userResumes: UserDocProps;
}) {

  const scrollContainer = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: MouseEvent) => {
    if (!scrollContainer.current) return;
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(scrollContainer.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !scrollContainer.current) return;
    e.preventDefault(); // Prevents text/image selection
    const walk = (e.pageX - startX) * 3.5; // Scroll speed
    scrollContainer.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="px-4 md:px-8 mb-6 overflow-x-hidden">
      <div
        ref={scrollContainer}
        className={`flex gap-4 overflow-x-auto py-2 scrollbar-hide w-full ${
          isDragging ? "cursor-grabbing" : "cursor-pointer"
        } select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
      >
        {userResumes.map(({ img, title, total }, idx) => (
          <div
            key={idx}
            className={`shrink-0  border-slate-100 border flex gap-4 p-4 rounded-lg min-w-[calc(100vw/3.4)] ${
              // TODO
              // sidebarExpand
              true
                ? "lg:min-w-[calc((100vw-370px)/3)]"
                : "lg:min-w-0 lg:w-full lg:shrink"
            } 2xl:min-w-0 2xl:w-full 2xl:shrink justify-center`}
          >
            <div className="shrink-0">
              <img src={img} alt="" className="" />
            </div>
            <div>
              <p className="text-center">{title}</p>
              <p className="text-center">{total}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
