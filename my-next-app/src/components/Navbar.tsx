// src/components/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const departments = [
  { name: "Amazonas", slug: "amazonas" },
  { name: "Ancash", slug: "ancash" },
  { name: "Apurimac", slug: "apurimac" },
  { name: "Arequipa", slug: "arequipa" },
  { name: "Ayacucho", slug: "ayacucho" },
  { name: "Cajamarca", slug: "cajamarca" },
  { name: "Callao", slug: "callao" },
  { name: "Cusco", slug: "cusco" },
  { name: "Huancavelica", slug: "huancavelica" },
  { name: "Huanuco", slug: "huanuco" },
  { name: "Ica", slug: "ica" },
  { name: "Junín", slug: "junin" },
  { name: "Ucayali", slug: "ucayali" },
  { name: "Tumbes", slug: "tumbes" },
  { name: "Tacna", slug: "tacna" },
  { name: "San Martín", slug: "san-martin" },
  { name: "Puno", slug: "puno" },
  { name: "Piura", slug: "piura" },
  { name: "Pasco", slug: "pasco" },
  { name: "Moquegua", slug: "moquegua" },
  { name: "Madre de Dios", slug: "madre-de-dios" },
  { name: "Loreto", slug: "loreto" },
  { name: "Lima", slug: "lima" },
  { name: "La Libertad", slug: "la-libertad" },
  { name: "Lambayeque", slug: "lambayeque" },
];

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          MiLogo
        </Link>
        {/* Enlaces principales */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-blue-600">
            Inicio
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-blue-600">
            Acerca
          </Link>
          <Link href="/services" className="text-gray-700 hover:text-blue-600">
            Servicios
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-blue-600">
            Contacto
          </Link>
          {/* Menú de Departamentos con submenú */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              Departamentos
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10">
                <ul className="py-2">
                  {departments.map((dept) => (
                    <li key={dept.slug} className="px-4 py-2 hover:bg-gray-100">
                      <Link
                        href={`/departamento/${dept.slug}`}
                        className="block text-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {dept.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
