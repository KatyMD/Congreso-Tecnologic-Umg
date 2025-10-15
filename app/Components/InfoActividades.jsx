"use client";

import { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Switch from "react-switch";
import { Snackbar, Alert } from "@mui/material";
import { FaSearch, FaPlus } from "react-icons/fa";

export default function InfoActividades() {
    const [actividades, setActividades] = useState([]);
    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [tiposActividad, setTiposActividad] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [alerta, setAlerta] = useState({
        open: false,
        severity: "success",
        mensaje: "",
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);

    const [actividadToEdit, setActividadToEdit] = useState(null);
    const [actividadEditada, setActividadEditada] = useState({
        idActividad: 0,
        nombreActividad: "",
        descripcionActividad: "",
        fechaActividad: "",
        horaInicio: "",
        horaFin: "",
        cupo: 0,
    });

    const [nuevaActividad, setNuevaActividad] = useState({
        tipo: "",
        nombre: "",
        descripcion: "",
        fecha: "",
        horaInicio: "",
        horaFin: "",
        cupo: "",
    });

    const [busqueda, setBusqueda] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");

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

    const mostrarAlerta = (mensaje, severity = "info") => {
        setAlerta({ open: true, severity, mensaje });
    };

    const handleCloseAlerta = (_, reason) => {
        if (reason === "clickaway") return;
        setAlerta((prev) => ({ ...prev, open: false }));
    };

    const cargarActividades = async () => {
        setCargando(true);
        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/InfoActivades");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setActividades(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    const cargarTipos = async () => {
        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Tipo");
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setTiposActividad(data);
        } catch (err) {
            console.error("Error cargando tipos:", err);
        }
    };

    useEffect(() => {
        const token = getToken();
        if (!token) {
            setError("No hay token");
            setCargando(false);
            return;
        }
        cargarActividades();
        cargarTipos();
    }, []);

    // Filtros
    useEffect(() => {
        let filtrados = actividades;

        if (busqueda.trim()) {
            const lower = busqueda.toLowerCase();
            filtrados = filtrados.filter((act) =>
                Object.values(act).some(
                    (valor) => valor && valor.toString().toLowerCase().includes(lower)
                )
            );
        }

        if (tipoFiltro) {
            filtrados = filtrados.filter((act) => act["TIPO"] === tipoFiltro);
        }

        setActividadesFiltradas(filtrados);
    }, [busqueda, tipoFiltro, actividades]);

    const toggleEstado = async (idActividad, estadoActual) => {
        const nuevoEstado = !estadoActual;
        try {
            const res = await fetchWithAuth(
                "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/ActualizarEstado",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: idActividad, estado: nuevoEstado }),
                }
            );
            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            await cargarActividades();
            mostrarAlerta(data.Mensaje, "success");
        } catch (err) {
            mostrarAlerta("Error al actualizar: " + err.message, "error");
        }
    };

    const openEditModal = (actividad) => {
        setActividadToEdit(actividad);
        setActividadEditada({
            idActividad: actividad["ID"],
            nombreActividad: actividad["NOMBRE"] || "",
            descripcionActividad: actividad["DESCRIPCION"] || "",
            fechaActividad: actividad["FECHA"]?.split(" ")[0] || "",
            horaInicio: actividad["HORA INICIO"] || "",
            horaFin: actividad["HORA FIN"] || "",
            cupo: actividad["CUPO"] || 0,
        });
        setModalOpen(true);
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setModalAgregar(false);
        setActividadToEdit(null);
        setNuevaActividad({
            tipo: "",
            nombre: "",
            descripcion: "",
            fecha: "",
            horaInicio: "",
            horaFin: "",
            cupo: "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setActividadEditada((prev) => ({ ...prev, [name]: value }));
    };

    const handleNuevaChange = (e) => {
        const { name, value } = e.target;
        setNuevaActividad((prev) => ({ ...prev, [name]: value }));
    };

    const guardarCambios = async () => {
        const inicio = actividadEditada.horaInicio;
        const fin = actividadEditada.horaFin;

        if (inicio && fin && inicio >= fin) {
            mostrarAlerta("La hora de inicio debe ser menor que la hora final", "warning");
            return;
        }

        if (
            JSON.stringify(actividadEditada) ===
            JSON.stringify({
                idActividad: actividadToEdit["ID"],
                nombreActividad: actividadToEdit["NOMBRE"] || "",
                descripcionActividad: actividadToEdit["DESCRIPCION"] || "",
                fechaActividad: actividadToEdit["FECHA"]?.split(" ")[0] || "",
                horaInicio: actividadToEdit["HORA INICIO"] || "",
                horaFin: actividadToEdit["HORA FIN"] || "",
                cupo: actividadToEdit["CUPO"] || 0,
            })
        ) {
            mostrarAlerta("No se detectaron cambios", "info");
            cerrarModal();
            return;
        }

        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Actualizar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(actividadEditada),
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            mostrarAlerta(data.Mensaje || "Actividad actualizada correctamente", "success");
            cerrarModal();
            await cargarActividades();
        } catch (err) {
            mostrarAlerta("Error al actualizar: " + err.message, "error");
        }
    };

    const agregarActividad = async () => {
        const { tipo, nombre, descripcion, fecha, horaInicio, horaFin, cupo } = nuevaActividad;

        if (!tipo || !nombre || !descripcion || !fecha || !horaInicio || !horaFin || !cupo) {
            mostrarAlerta("Por favor completa todos los campos", "warning");
            return;
        }

        if (horaInicio >= horaFin) {
            mostrarAlerta("La hora de inicio debe ser menor que la hora final", "warning");
            return;
        }

        try {
            const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Agregar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: parseInt(tipo),
                    nombre,
                    descripcion,
                    fecha,
                    horaInicio,
                    horaFin,
                    cupo: parseInt(cupo),
                }),
            });

            if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            mostrarAlerta(data.Mensaje , "success");
            cerrarModal();
            await cargarActividades();
        } catch (err) {
            mostrarAlerta("Error al agregar: " + err.message, "error");
        }
    };

    const tipo = [...new Set(actividades.map((u) => u["TIPO"]))];

    if (error) {
        return <p className="text-red-600 text-center mt-4">Error: {error}</p>;
    }

    return (
        <div className="bg-white relative overflow-x-auto px-4 py-6" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">ACTIVIDADES</h2>

            </div>

            {/* Barra de búsqueda y filtro */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 text-sm">
                <div className="relative w-full md:w-1/3">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-9 pr-3 py-1.5 text-gray-500 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full text-sm"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <select
                    className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-1/4 text-sm text-gray-700"
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                >
                    <option value="">-- Tipo --</option>
                    {tipo.map((est) => (
                        <option key={est} value={est}>
                            {est}
                        </option>
                    ))}
                </select>
                <button
                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                    onClick={() => setModalAgregar(true)}
                >
                    <FaPlus /> Agregar
                </button>
            </div>

            {cargando && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <table className="min-w-full border-collapse shadow-md relative z-0">
                <thead className="bg-blue-900 text-white text-sm">
                    <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">TIPO</th>
                        <th className="px-4 py-2 text-left">NOMBRE</th>
                        <th className="px-4 py-2 text-center">DESCRIPCIÓN</th>
                        <th className="px-4 py-2 text-left">FECHA</th>
                        <th className="px-4 py-2 text-left">HORA INICIO</th>
                        <th className="px-4 py-2 text-left">HORA FINAL</th>
                        <th className="px-4 py-2 text-left">CUPO</th>
                        <th className="px-4 py-2 text-left">ESTADO</th>
                        <th className="px-4 py-2 text-left">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                    {actividadesFiltradas.map((actividad) => {
                        const id = actividad["ID"];
                        const estadoActivo = actividad["ESTADO"]?.toLowerCase() === "true";

                        return (
                            <tr key={id} className={id % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                <td className="px-4 py-2">{id}</td>
                                <td className="px-4 py-2">{actividad["TIPO"]}</td>
                                <td className="px-4 py-2">{actividad["NOMBRE"]}</td>
                                <td className="px-4 py-2">{actividad["DESCRIPCION"]}</td>
                                <td className="px-4 py-2">{actividad["FECHA"]?.split(" ")[0]}</td>
                                <td className="px-4 py-2">{formatHora(actividad["HORA INICIO"])}</td>
                                <td className="px-4 py-2">{formatHora(actividad["HORA FIN"])}</td>
                                <td className="px-4 py-2">{actividad["CUPO"]}</td>
                                <td className="px-4 py-2 text-center">
                                    {estadoActivo ? "Activo" : "Inactivo"}
                                </td>
                                <td className="px-4 py-2 flex items-center space-x-2">
                                    <button
                                        className="text-blue-600 hover:text-blue-800 w-8 h-8 flex items-center justify-center"
                                        onClick={() => openEditModal(actividad)}
                                    >
                                        <MdEditSquare size={18} />
                                    </button>
                                    <Switch
                                        checked={estadoActivo}
                                        onChange={() => toggleEstado(id, estadoActivo)}
                                        onColor="#4ade80"
                                        offColor="#ef4444"
                                        height={20}
                                        width={30}
                                        uncheckedIcon={false}
                                        checkedIcon={false}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal de edición */}
            {modalOpen && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-400 shadow-lg rounded-lg z-50 w-96 p-6">
                    <h3 className="text-lg font-semibold text-center mb-4 text-blue-900">
                        Editar Actividad
                    </h3>

                    <div className="space-y-3 text-sm">
                        <input
                            type="text"
                            name="nombreActividad"
                            value={actividadEditada.nombreActividad}
                            onChange={handleInputChange}
                            placeholder="Nombre"
                            className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800"
                        />
                        <textarea
                            name="descripcionActividad"
                            value={actividadEditada.descripcionActividad}
                            onChange={handleInputChange}
                            placeholder="Descripción"
                            rows={4}
                            className="w-full border rounded border-gray-400 px-3 py-2 resize-none text-gray-800"
                        />

                        <input
                            type="date"
                            name="fechaActividad"
                            value={actividadEditada.fechaActividad}
                            onChange={handleInputChange}
                            className="w-full border rounded  border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="time"
                            name="horaInicio"
                            value={actividadEditada.horaInicio}
                            onChange={handleInputChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="time"
                            name="horaFin"
                            value={actividadEditada.horaFin}
                            onChange={handleInputChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="number"
                            name="cupo"
                            value={actividadEditada.cupo}
                            onChange={handleInputChange}
                            placeholder="Cupo"
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-5">
                        <button
                            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                            onClick={cerrarModal}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={guardarCambios}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            )}

            {modalAgregar && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg z-50 w-96 p-6">
                    <h3 className="text-lg font-semibold text-center mb-4 text-blue-900">

                        Agregar Actividad
                    </h3>

                    <div className="space-y-3 text-sm">
                        <select
                            name="tipo"
                            value={nuevaActividad.tipo}
                            onChange={handleNuevaChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        >
                            <option value="">-- Selecciona tipo --</option>
                            {tiposActividad
                                .filter((t) => parseInt(t.ID) !== 1) 
                                .map((t) => (
                                    <option key={t.ID} value={t.ID}>
                                        {t.TIPO}
                                    </option>
                                ))}
                        </select>
                        <input
                            type="text"
                            name="nombre"
                            value={nuevaActividad.nombre}
                            onChange={handleNuevaChange}
                            placeholder="Nombre"
                            className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800"
                        />
                        <textarea
                            name="descripcion"
                            value={nuevaActividad.descripcion}
                            onChange={handleNuevaChange}
                            placeholder="Descripción"
                            rows={4}
                            className="w-full border rounded border-gray-400 px-3 py-2 resize-none text-gray-800"
                        />
                        <input
                            type="date"
                            name="fecha"
                            value={nuevaActividad.fecha}
                            onChange={handleNuevaChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="time"
                            name="horaInicio"
                            value={nuevaActividad.horaInicio}
                            onChange={handleNuevaChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="time"
                            name="horaFin"
                            value={nuevaActividad.horaFin}
                            onChange={handleNuevaChange}
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                        <input
                            type="number"
                            name="cupo"
                            value={nuevaActividad.cupo}
                            onChange={handleNuevaChange}
                            placeholder="Cupo"
                            className="w-full border rounded border-gray-400 px-3 py-2 text-gray-800"
                        />
                    </div>

                    <div className="flex justify-end space-x-2 mt-5">
                        <button
                            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                            onClick={cerrarModal}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={agregarActividad}
                        >
                            Guardar
                        </button>
                    </div>
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
