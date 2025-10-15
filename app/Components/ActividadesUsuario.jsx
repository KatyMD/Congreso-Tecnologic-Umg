"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ActividadesUsuario() {

  const router = useRouter();


  const [usuarios, setActividades] = useState([]);
  const [usuariosFiltrados, setActividadesFiltradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [alerta, setAlerta] = useState({
    open: false,
    severity: "success",
    mensaje: "",
  });

  const [busqueda, setBusqueda] = useState("");
  const [actividadesFiltro, setTipoActividadFiltro] = useState("");

  const getToken = () => sessionStorage.getItem("token");

  const fetchWithAuth = (url, options = {}) => {
    const token = getToken();
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const mostrarAlerta = (mensaje, severity = "info") => {
    setAlerta({ open: true, severity, mensaje });
  };

  const handleCloseAlerta = (_, reason) => {
    if (reason === "clickaway") return;
    setAlerta((prev) => ({ ...prev, open: false }));
  };

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

  const cargarUsuarioActividades = async () => {
    setCargando(true);
    const token = getToken();
    const idUsuario = obtenerSubDelToken(token);

    try {
      const res = await fetchWithAuth(
        `https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Usuario?id=${idUsuario}`
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setActividades(data);
      setActividadesFiltradas(data); 
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.push("/"); 
      setCargando(false);
      return;
    }
    cargarUsuarioActividades();
  }, []);

  useEffect(() => {
    let filtrados = [...usuarios];

    // Filtro de búsqueda
    if (busqueda.trim()) {
      const lower = busqueda.toLowerCase();
      filtrados = filtrados.filter((act) =>
        Object.values(act).some(
          (valor) => valor && valor.toString().toLowerCase().includes(lower)
        )
      );
    }

    // Filtro de tipo actividad
    if (actividadesFiltro) {
      filtrados = filtrados.filter(
        (act) => act["ACTIVIDAD"] === actividadesFiltro
      );
    }

    setActividadesFiltradas(filtrados); 
  }, [busqueda, actividadesFiltro, usuarios]);

  function formatHora(horaStr) {
    if (!horaStr) return "";
    const [hora, minutos, segundos] = horaStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hora), parseInt(minutos), parseInt(segundos));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const tipoactividad = [...new Set(usuarios.map((u) => u["ACTIVIDAD"]))];

  if (error) {
    return <p className="text-red-600 text-center mt-4">Error: {error}</p>;
  }

  return (
    <div className=" bg-white relative overflow-x-auto px-4 py-6 " style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">
        ACTIVIDADES INSCRITAS
      </h2>

      {/* Barra de búsqueda y filtro */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 text-sm">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-3 py-1.5 rounded-md border text-gray-500 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Filtro Tipo de Actividad */}
        <select
          className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-1/4 text-sm text-gray-700"
          value={actividadesFiltro}
          onChange={(e) => setTipoActividadFiltro(e.target.value)}
        >
          <option value="">-- Tipo Actividad --</option>
          {tipoactividad.map((est) => (
            <option key={est} value={est}>
              {est}
            </option>
          ))}
        </select>
      </div>

      {cargando && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <table className="min-w-full border-collapse shadow-md relative z-0">
        <thead className="bg-blue-900 text-white text-sm">
          <tr>
            <th className="px-4 py-2 text-left">ACTIVIDAD</th>
            <th className="px-4 py-2 text-left">NOMBRE</th>
            <th className="px-4 py-2 text-left">FECHA</th>
            <th className="px-4 py-2 text-left">HORA INICIO</th>
            <th className="px-4 py-2 text-left">HORA FIN</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {usuariosFiltrados.map((user, index) => (
            <tr
              key={`${user["NOMBRE"]}-${user["ACTIVIDAD"]}-${index}`} 
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="px-4 py-2">{user["ACTIVIDAD"]}</td>
              <td className="px-4 py-2">{user["NOMBRE"]}</td>
              <td className="px-4 py-2">{user["FECHA"]?.split(" ")[0]}</td>
              <td className="px-4 py-2">{formatHora(user["HORA INICIO"])}</td>
              <td className="px-4 py-2">{formatHora(user["HORA FIN"])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Snackbar
        open={alerta.open}
        autoHideDuration={2000}
        onClose={handleCloseAlerta}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlerta}
          severity={alerta.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alerta.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
}
