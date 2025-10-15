"use client";

import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function UsuariosInscritos() {
    const [actividades, setActividades] = useState([]);
    const [alerta, setAlerta] = useState({
        open: false,
        severity: "success",
        mensaje: "",
    });

    const mostrarAlerta = (mensaje, severity = "info") => {
        setAlerta({ open: true, severity, mensaje });
    };

    const handleCloseAlerta = (_, reason) => {
        if (reason === "clickaway") return;
        setAlerta((prev) => ({ ...prev, open: false }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener el token de sesión
                const token = sessionStorage.getItem("token");
                if (!token) {
                    mostrarAlerta("No se encontró sesión activa. Inicia sesión.", "warning");
                    return;
                }

                // Realizar la solicitud a la API con el token de Bearer
                const resActividades = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/UsuariosActividades", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                const dataActividades = await resActividades.json();

                // Filtrar las actividades con estado "True"
                const actividadesActivas = dataActividades.filter((act) => act.ESTADO === "True");
                setActividades(actividadesActivas);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
                mostrarAlerta("Error al cargar actividades", "error");
            }
        };

        fetchData();
    }, []);

    const actividadesPorTipo = actividades.reduce((acc, act) => {
        const tipo = act.TIPO;
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(act);
        return acc;
    }, {});

    return (
        <div className="bg-white py-20 px-4 min-h-screen flex justify-center">
            <div className="max-w-5xl w-full space-y-10">
                <h2 className="text-3xl font-bold text-blue-800 text-center mb-10">
                    USUARIOS INSCRITOS A LAS ACTIVIDADES
                </h2>

                {Object.entries(actividadesPorTipo).map(([tipo, lista]) => (
                    <div key={tipo}>
                        <h3 className="text-2xl font-semibold text-blue-900 mb-6">{tipo}</h3>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {lista.map((act) => (
                                <div
                                    key={act.NOMBRE}
                                    className="bg-gray-50 border text-center border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
                                >
                                    <h4 className="text-xl font-semibold text-blue-800 mb-2">{act.NOMBRE}</h4>
                                    <p className="text-yellow-500 mb-3">
                                        <strong>Cupo:</strong> {act.CUPO}
                                    </p>
                                    <p className="text-blue-500 mb-3">
                                        <strong>Inscritos:</strong> {act.INSCRITOS} 
                                    </p>
                                    <p className="text-green-500 mb-3">
                                        <strong>Disponible:</strong> {act.DISPONIBLE}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/*SNACKBAR */}
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
