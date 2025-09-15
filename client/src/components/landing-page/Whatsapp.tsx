import { BsWhatsapp } from "react-icons/bs";

const Whatsapp = () => {
  return (
    <div>
      <a
        href="https://wa.me/+436767391022"
        rel="noopener noreferrer"
        target="_blank"
        title="Chat with us on WhatsApp"
        className="fixed z-50 bottom-8 left-8 hover:cursor-pointer backdrop-blur-2xl bg-transparent rounded-full overflow-hidden"
      >
        <BsWhatsapp className="size-8 text-green-500" />
      </a>
    </div>
  );
};

export default Whatsapp;
