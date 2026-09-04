import { Plus } from "lucide-react";

export default function FloatingAddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Create new risk"
      className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full
                 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_8px_24px_rgba(16,185,129,0.45)]
                 transition-transform duration-200 hover:scale-110 hover:shadow-[0_10px_32px_rgba(16,185,129,0.55)]
                 active:scale-95"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}