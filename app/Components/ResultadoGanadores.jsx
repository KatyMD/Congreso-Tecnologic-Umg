"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { FaMedal } from "react-icons/fa6";
import { GiPodiumWinner } from "react-icons/gi";

export default function ResultadoGanadores() {
    const [ganadores, setGanadores] = useState([]);
    const [alerta, setAlerta] = useState({
        open: false,
        severity: "success",
        mensaje: "",
    });
    const [cargando, setCargando] = useState(true);

    const mostrarAlerta = (mensaje, severity = "info") => {
        setAlerta({ open: true, severity, mensaje });
    };

    const handleCloseAlerta = (_, reason) => {
        if (reason === "clickaway") return;
        setAlerta((prev) => ({ ...prev, open: false }));
    };

    // 🔹 Cargar lista de ganadores
    useEffect(() => {
        const fetchGanadores = async () => {
            try {
                const res = await fetch(
                    "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Ganadores/PorActividad"
                );
                if (!res.ok) throw new Error("Error al cargar ganadores");
                const data = await res.json();

                // Solo los activos
                const ganadoresActivos = data.filter((g) => g.ESTADO === "True");
                setGanadores(ganadoresActivos);
            } catch (error) {
                console.error("Error:", error);
                mostrarAlerta("Error al cargar ganadores", "error");
            } finally {
                setCargando(false);
            }
        };

        fetchGanadores();
    }, []);

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white py-16 px-6 min-h-screen flex flex-col items-center">
            <h2 className="flex items-center gap-2 text-3xl font-bold text-blue-900 text-center mb-10">
                <GiPodiumWinner className="text-blue-900 text-4xl" />
                <span>Ganadores</span>
            </h2>

            {ganadores.length === 0 ? (
                <p className="text-gray-600 text-center text-lg">
                    No hay ganadores registrados.
                </p>
            ) : (
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl w-full">
                    {ganadores.map((g) => (
                        <div
                            key={g.ID}
                            className="bg-gray-50 border border-gray-200 rounded-2xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02] p-4 flex flex-col items-center text-center"
                        >
                            <img
                                src={g.IMAGEN}
                                alt={g.NOMBRE}
                                className="w-36 h-36 object-cover rounded-full border-4 border-blue-700 shadow mb-4"
                            />
                            <h3 className="text-lg font-bold text-blue-800 mb-1">
                                {g.NOMBRE}
                            </h3>
                            <p className="flex items-center gap-2 text-sm font-semibold text-yellow-600 mb-1">
                                <FaMedal className="text-yellow-600 text-lg" />
                                {g.PUESTO}
                            </p>Ñ
                            <p className="text-sm font-semibold text-gray-600">
                                {g["NOMBRE ACTIVIDAD"]}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <Snackbar
                open={alerta.open}
                autoHideDuration={2500}
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
