import { FaFacebookF, FaTiktok } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
<footer className="bg-gray-500 text-white py-6 ">
<div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-6">
    <p className="text-sm md:text-base text-center">
          &copy; {new Date().getFullYear()} Congreso Tecnológico. Todos los derechos reservados.
        </p>

        {/* Enlaces a redes */}
            <div className="flex space-x-4 text-lg">
      <Link href="https://www.facebook.com/share/17Nhh4wJMd/?mibextid=wwXIfr" target="_blank" className="hover:text-gray-300">
        <FaFacebookF />
      </Link>
      <Link href="https://www.tiktok.com/@sistemasumg?_t=ZM-90S60dMYS4q&_r=1" target="_blank" className="hover:text-gray-300">
        <FaTiktok />
      </Link>
        </div>
      </div>
    </footer>
  );
}
