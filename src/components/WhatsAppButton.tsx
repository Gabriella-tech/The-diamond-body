import { IconWhatsApp } from "./Icons";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2347025008596?text=Hi%20Diamond%20Body%2C%20I%27d%20like%20to%20know%20more%20about%20your%20wellness%20products."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-pulse-ring"
      aria-label="Chat on WhatsApp"
    >
      <IconWhatsApp size={28} />
    </a>
  );
}
