"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/" className="text-white">
            MyApp
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:text-blue-400">Home</Link>
          <Link href="/about" className="hover:text-blue-400">About</Link>
          <Link href="/contact" className="hover:text-blue-400">Contact</Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-white">
            {isMobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white mt-4 space-y-4 px-4 py-2">
          <Link href="/" className="block hover:text-blue-400">Home</Link>
          <Link href="/about" className="block hover:text-blue-400">About</Link>
          <Link href="/contact" className="block hover:text-blue-400">Contact</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
