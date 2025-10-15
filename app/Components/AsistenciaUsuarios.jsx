"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { FaSearch } from "react-icons/fa";


export default function AsistenciaUsuarios() {
    const [asistencia, setAsistencia] = useState([]);
    const [asistenciaFiltrados, setAsistenciaFiltrados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [alerta, setAlerta] = useState({
        open: false,
        severity: "success",
        mensaje: "",
    });



    const [busqueda, setBusqueda] = useState("");
    const [asistenciaFiltro, setEstablecimientoFiltro] = useState("");

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

    const cargarAsistencia = async () => {
        setCargando(true);
        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Asistencia/Mostrar");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setAsistencia(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };



    useEffect(() => {
        const token = getToken();
        if (!token) {
            setError("No hay token");
            setCargando(false);
            return;
        }
        cargarAsistencia();
    }, []);

    //  Filtro de asistencia
    useEffect(() => {
        let filtrados = asistencia;

        if (busqueda.trim()) {
            const lower = busqueda.toLowerCase();
            filtrados = filtrados.filter((user) =>
                Object.values(user).some(
                    (valor) =>
                        valor &&
                        valor.toString().toLowerCase().includes(lower)
                )
            );
        }

        if (asistenciaFiltro) {
            filtrados = filtrados.filter(
                (user) =>
                    user["TIPO"] === asistenciaFiltro
            );
        }

        setAsistenciaFiltrados(filtrados);
    }, [busqueda, asistenciaFiltro, asistencia]);



    // Obtener tipoActividad 
    const tipoActividad = [...new Set(asistencia.map((u) => u["TIPO"]))];

    if (error) {
        return <p className="text-red-600 text-center mt-4">Error: {error}</p>;
    }

    return (
        <div className="bg-white relative overflow-x-auto px-4 py-6" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">ASISTENCIA</h2>

            {/* Barra de búsqueda y filtro  */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 text-sm">

                <div className="relative w-full md:w-1/3">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* Filtro de TIPO */}
                <select
                    className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-1/4 text-sm text-gray-700"
                    value={asistenciaFiltro}
                    onChange={(e) => setEstablecimientoFiltro(e.target.value)}
                >
                    <option value="">-- Actividad --</option>
                    {tipoActividad.map((est) => (
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
                        <th className="px-4 py-2 text-left">NOMBRE ACTIVIDAD</th>
                        <th className="px-4 py-2 text-left">NOMBRE</th>
                        <th className="px-4 py-2 text-left">FECHA</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                    {asistenciaFiltrados.map((user) => {
                        const id = user["ID"];
                       
                         return (
                            <tr key={id} className={id % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                <td className="px-4 py-2">{user["TIPO"]}</td>
                                <td className="px-4 py-2">{user["NOMBRE ACTIVIDAD"]}</td>
                                <td className="px-4 py-2">{user["NOMBRE"]}</td>
                                <td className="px-4 py-2"> {user["FECHA ASISTENCIA"]?.split(" ")[0]}</td>
                            </tr>
                        );
                    })}
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
