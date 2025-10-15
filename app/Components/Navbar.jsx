"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-blue-900" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4 text-white">
        <Link href="/">
          <Image src="/Umg.png" alt="Logo" width={50} height={40} />
        </Link>

        <div className="space-x-6 text-lg">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/Faq" className="hover:underline">
            Ayuda rápida
          </Link>
        </div>
      </div>
    </nav>
  );
}
