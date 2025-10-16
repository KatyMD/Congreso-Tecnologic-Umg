"use client";

import { useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function InscripcionActividad() {
    const [actividades, setActividades] = useState([]);

    const [alerta, setAlerta] = useState({
        open: false,
        severity: "success", // success, warning, error, info
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
                const resActividades = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/InfoActivades");
                const dataActividades = await resActividades.json();

                const actividadesActivas = dataActividades.filter((act) => act.ESTADO === "True");
                setActividades(actividadesActivas);
            } catch (error) {
                console.error("Error al cargar los datos:", error);
                mostrarAlerta("Error al cargar actividades", "error");
            }
        };

        fetchData();
    }, []);


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

    const actividadesPorTipo = actividades.reduce((acc, act) => {
        const tipo = act.TIPO;
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(act);
        return acc;
    }, {});


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


    // INSCRIBIRSE A UNA ACTIVIDAD
    const inscribirse = async (idActividad) => {
        const token = sessionStorage.getItem("token");
        const id = obtenerSubDelToken(token);

        if (!token || !id) {
            mostrarAlerta("No se encontró sesión activa. Inicia sesión.", "warning");
            return;
        }

        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Inscripcion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    idActividad,
                    idUsuario: parseInt(id),
                }),
            });
            const data = await res.json();

            if (data.Estado) {
                mostrarAlerta(data.Mensaje, "success");

            } else {
                mostrarAlerta(data.Mensaje, "warning");
            }
        } catch (error) {
            console.error("Error en inscripción:", error);
            mostrarAlerta("No se pudo completar la inscripción", "error");
        }
    };

    return (
        <div className="bg-white py-20 px-4 min-h-screen flex justify-center">
            <div className="max-w-5xl w-full space-y-10">
                <h2 className="text-3xl font-bold text-blue-800 text-center mb-10">
                    Inscripción a Actividades
                </h2>

                {Object.entries(actividadesPorTipo).map(([tipo, lista]) => (
                    <div key={tipo}>
                        <h3 className="text-2xl font-semibold text-blue-800 mb-6">{tipo}</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            {lista.map((act) => (
                                <div
                                    key={act.ID}
                                    className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition hover:scale-[1.02]"
                                >
                                    <h4 className="text-xl font-semibold text-blue-800 mb-2">
                                        {act.NOMBRE}
                                    </h4>
                                    <p className="text-gray-700 mb-3">{act.DESCRIPCION}</p>
                                    <div className="text-gray-600 text-sm mb-4">
                                        <p>
                                            <strong>Fecha:</strong> {act.FECHA.split(" ")[0]}
                                        </p>
                                        
                                        <p>
                                            <strong>Hora:</strong> {formatHora(act["HORA INICIO"])} -{" "}
                                            {formatHora(act["HORA FIN"])}
                                        </p>
                                    </div>
                                    <button
                                        className="mt-2 inline-block bg-blue-700 text-white px-4 py-2 rounded-full hover:bg-blue-800 transition"
                                        onClick={() => inscribirse(act.ID)}
                                    >
                                        Inscribirse
                                    </button>
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
