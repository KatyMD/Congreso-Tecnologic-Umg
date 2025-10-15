"use client";

import { FaHome, FaUser, FaUsers, FaSignOutAlt, FaCalendarPlus } from "react-icons/fa";
import { IoPersonAddSharp } from "react-icons/io5";
import { TfiAgenda } from "react-icons/tfi";
import { useRouter } from "next/navigation";
import { VscDashboard } from "react-icons/vsc";
import { FaPeopleGroup, FaMedal } from "react-icons/fa6";
import { GiPodiumWinner } from "react-icons/gi";
import { LuNotebookPen } from "react-icons/lu";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Inicio", icon: <FaHome />, path: "/Inicio", roles: ["Administrador", "Alumno"] },
  { label: "Dashboard", icon: <VscDashboard />, path: "/dashboard", roles: ["Administrador"] },
  { label: "Perfil", icon: <FaUser />, path: "/perfil", roles: ["Alumno"] },
  { label: "Usuarios", icon: <FaUsers />, path: "/users", roles: ["Administrador"] },
  { label: "Actividades", icon: <FaCalendarPlus />, path: "/actividades", roles: ["Administrador"] },
  { label: "Inscripción", icon: <IoPersonAddSharp />, path: "/inscripcion", roles: ["Alumno"] },
  { label: "Actividades Inscritas", icon: <TfiAgenda />, path: "/usuarioactividad", roles: ["Alumno"] },
  { label: "Registrar Asistencia", icon: <LuNotebookPen />, path: "/registrarasistencia", roles: ["Administrador"] },
  { label: "Asistencia", icon: <FaPeopleGroup />, path: "/asistencia", roles: ["Administrador"] },
  { label: "Ganadores", icon: <GiPodiumWinner />, path: "/ganadores", roles: ["Administrador"] },
  { label: "Resultados de Competencia", icon: <FaMedal />, path: "/infoganadores", roles: ["Administrador", "Alumno"] },
  { label: "Cerrar sesión", icon: <FaSignOutAlt />, path: "/", logout: true, roles: ["Administrador", "Alumno"] },
];

export default function SidebarMenu() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true); // Estado para manejar si el menú está expandido o contraído
  const [userRole, setUserRole] = useState(null); // Estado para manejar el rol del usuario

  const obtenerRolDelToken = (token) => {
    if (!token) return null;
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error("Token no tiene formato válido:", token);
        return null;
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedRole = obtenerRolDelToken(token);
    setUserRole(storedRole);
    console.log("Rol del usuario:", storedRole);
  }, []);

  const handleClick = (item) => {
    if (item.logout) {
      sessionStorage.clear(); // Limpiar sessionStorage al cerrar sesión
    }
    router.push(item.path);
  };

  if (!userRole) {
    return <div>Loading...</div>; // Mostrar un cargador mientras se obtiene el rol
  }

  return (
    <div className={`h-screen ${isOpen ? 'w-64' : 'w-20'} bg-blue-900 text-white flex flex-col py-6 px-4 shadow-lg transition-width duration-300`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold text-center transition-all duration-300 ${!isOpen && "hidden"}`}>Menú</h2>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white text-xl">
          {isOpen ? '←' : '→'}
        </button>
      </div>

      <nav className="flex flex-col space-y-2">
        {menuItems
          .filter(item => item.roles.includes(userRole)) // Filtrar por roles
          .map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(item)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-800 transition text-left"
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-sm font-medium ${!isOpen && "hidden"}`}>{item.label}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}
