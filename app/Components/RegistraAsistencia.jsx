"use client";

import { useEffect, useState } from "react";
import { Snackbar, Alert, Button } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function RegistrarAsistencias() {
    const [actividades, setActividades] = useState([]);
    const [alerta, setAlerta] = useState({ open: false, severity: "success", mensaje: "" });
    const [cargando, setCargando] = useState(true);
    const [scanActivo, setScanActivo] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);


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

    // 🔹 Obtener actividades
    useEffect(() => {
        const fetchActividades = async () => {
            try {
                const res = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Informacion");
                if (!res.ok) throw new Error("Error al cargar actividades");
                const data = await res.json();
                setActividades(data);
            } catch (error) {
                console.error("Error:", error);
                mostrarAlerta("Error al cargar actividades", "error");
            } finally {
                setCargando(false);
            }
        };

        fetchActividades();
    }, []);

    // 🔹 Escanear QR
    const handleScan = async (decodedText) => {
        const idUsuario = parseInt(decodedText);
        const idActividad = parseInt(actividadSeleccionada?.ID);

        try {
            const res = await fetchWithAuth(
                "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Asistencia/Agregar",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idUsuario, idActividad }),
                }
            );

            const data = await res.json();

            // Mostrar alerta 
            if (data.Estado) {
                mostrarAlerta(data.Mensaje, "success");
                
            } else {

                mostrarAlerta(data.Mensaje, "warning");
 
            }
        } catch (err) {
            mostrarAlerta("Error al actualizar: " + err.message, "error");
        } finally {
            setScanActivo(false);
            setActividadSeleccionada(null);
        }
    };


    useEffect(() => {
        if (scanActivo) {
            const scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: 250,
            });

            scanner.render(
                (decodedText, _) => {
                    scanner.clear().then(() => {
                        handleScan(decodedText);
                    });
                },
                (error) => {
                    // Puedes ignorar los errores de escaneo continuo
                    console.warn(error);
                }
            );

            return () => {
                scanner.clear().catch((err) => console.error("Error al limpiar el escáner", err));
            };
        }
    }, [scanActivo]);

    if (cargando) {
        return (
            <div className="flex justify-center items-center h-screen bg-white">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white py-16 px-6 min-h-screen flex flex-col items-center">
            <h2 className="text-3xl font-bold text-blue-900 text-center mb-10">Registrar Asistencias</h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-6xl w-full">
                {actividades.map((actividad) => (
                    <div
                        key={actividad.ID}
                        className="bg-gray-50 border border-gray-200 rounded-xl shadow-md p-6 text-center flex flex-col items-center"
                    >
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">{actividad.NOMBRE}</h3>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setActividadSeleccionada(actividad);
                                setScanActivo(true);
                            }}
                        >
                            Registrar Asistencia
                        </Button>
                    </div>
                ))}
            </div>

            {scanActivo && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 flex-col">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md">
                        <h2 className="text-xl font-bold text-center mb-2 text-blue-800">Escanea el QR del estudiante</h2>
                        <div id="reader" style={{ width: "100%" }} />
                        <Button
                            variant="outlined"
                            color="secondary"
                            className="mt-4"
                            fullWidth
                            onClick={() => {
                                setScanActivo(false);
                                setActividadSeleccionada(null);
                            }}
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            <Snackbar
                open={alerta.open}
                autoHideDuration={3000}
                onClose={handleCloseAlerta}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseAlerta} severity={alerta.severity} variant="filled" sx={{ width: "100%" }}>
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </div>
    );
}
