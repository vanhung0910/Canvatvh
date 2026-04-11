import { MessageCircle, Phone, ArrowUp } from "lucide-react";

export function FloatingButtons() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Left side social buttons */}
      <div className="fixed left-3 bottom-1/3 z-50 flex flex-col gap-2">
        <a
          href="#"
          className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle size={20} className="text-white" />
        </a>
        <a
          href="https://zalo.me/g/wvhu5evlevj1vvnzccgo"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-white"
          style={{ fontSize: "0.7rem", fontWeight: 700 }}
        >
          Zalo
        </a>
        <a
          href="#"
          className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <Phone size={18} className="text-white" />
        </a>
      </div>

      {/* Scroll to top */}
      <button
        onClick={scrollToTop}
        className="fixed right-3 bottom-4 z-50 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        <ArrowUp size={20} className="text-white" />
      </button>
    </>
  );
}