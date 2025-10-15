"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaUser, FaEnvelope, FaUniversity } from "react-icons/fa";

export default function InfoUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const obtenerSubDelToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      return payload.sub || payload.Sub || null;
    } catch (error) {
      console.error("Error al decodificar token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const idUsuario = obtenerSubDelToken(token);

    if (!idUsuario) {
      setError("No se encontró el ID del usuario en el token.");
      setCargando(false);
      return;
    }

    const url = `https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/InfoUsuario?idusuario=${idUsuario}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error en la API: ${text}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsuario(data[0]);
        } else {
          setError("No se encontró información del usuario.");
        }
        setCargando(false);
      })
      .catch((err) => {
        setError(err.message || "Error al obtener la información del usuario.");
        setCargando(false);
      });
  }, []);

  if (cargando) return <p>Cargando información del usuario...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!usuario) return null;

  return (
    <div className=" max-w-sm w-full mx-auto bg-white rounded-xl shadow-lg p-6 text-center font-sans border border-gray-400">
      {/* Encabezado */}
      <div className="mb-6 border-b-2 border-blue-900 pb-4">
        <h1 className="text-2xl font-extrabold text-blue-900">
          Congreso Tecnológico Sistemas UMG
        </h1>
        <p className="text-blue-800 text-sm mt-1 font-medium">
          Centro Universitario Guastatoya
        </p>

        {/* Logo con margen superior */}
        <div className="mt-6 mb-4 flex justify-center">
          <img src="/logo.png" alt="Logo Universidad" className="h-20 w-auto" />
        </div>
      </div>

      {/* Código QR */}
      <div className="mb-6 flex justify-center">
        <QRCodeCanvas value={usuario.ID} size={256} />
      </div>

      {/* Información del usuario */}
      <div className="text-left space-y-3 text-gray-800 text-sm">
        <p className="flex items-center gap-2 justify-center">
          <FaUser className="text-blue-900" /> {usuario.NOMBRE || "No disponible"}
        </p>
        <p className="flex items-center gap-2 justify-center">
          <FaEnvelope className="text-blue-900" /> {usuario.CORREO || "No disponible"}
        </p>
        <p className="flex items-center gap-2 justify-center">
          <FaUniversity className="text-blue-900" /> {usuario.ESTABLECIMIENTO || "No disponible"}
        </p>
      </div>
    </div>
  );
}
