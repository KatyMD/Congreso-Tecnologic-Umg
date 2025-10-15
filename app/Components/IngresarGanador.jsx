"use client";

import { useEffect, useState } from "react";
import Switch from "react-switch";
import { Snackbar, Alert } from "@mui/material";
import { FaSearch, FaPlus } from "react-icons/fa";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";


export default function IngresarGanador() {

    const [competencias, setCompetencias] = useState([]);
    const [selectedCompetencia, setSelectedCompetencia] = useState(null);
    const [usuariosActividad, setUsuariosActividad] = useState([]);
    const [selectedUsuario, setSelectedUsuario] = useState(null);
    const [puesto, setPuesto] = useState("");
    const puestos = ["PRIMER LUGAR", "SEGUNDO LUGAR", "TERCER LUGAR"];

    const [imagen, setImagen] = useState(null);
    const [previewImagen, setPreviewImagen] = useState(null);
    const [urlImagen, setUrlImagen] = useState("");

    const getToken = () => sessionStorage.getItem("token");


    const [ganadores, setGanadores] = useState([]);
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


    const [busqueda, setBusqueda] = useState("");
    const [tipoFiltro, setTipoFiltro] = useState("");


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

    //(filtro por TIPO === "Competencia")
    useEffect(() => {
        async function fetchCompetencias() {
            try {
                const res = await fetch(
                    "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/InfoActivades"
                );
                if (!res.ok) throw new Error("Error al cargar competencias");
                const data = await res.json();
                const competenciasFiltradas = data.filter((item) => item.TIPO === "Competencia");
                setCompetencias(competenciasFiltradas);
            } catch (error) {
                console.error(error);
            }
        }
        fetchCompetencias();
    }, []);

    // Cuando cambia la competencia, traer usuarios de la actividad
    useEffect(() => {
        async function fetchUsuarios() {
            if (!selectedCompetencia) {
                setUsuariosActividad([]);
                return;
            }
            try {
                const res = await fetch(
                    `https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/UsuarioActividad?idActividad=${selectedCompetencia}`
                );
                if (!res.ok) throw new Error("Error al cargar usuarios");
                const data = await res.json();
                setUsuariosActividad(data);
            } catch (error) {
                console.error(error);
            }
        }
        fetchUsuarios();
    }, [selectedCompetencia]);


    const handleCompetenciaChange = (e) => {
        setSelectedCompetencia(e.target.value);
        setSelectedUsuario(null); // reset usuario al cambiar competencia
    };

    const handleUsuarioChange = (e) => {
        setSelectedUsuario(e.target.value);
    };

    const handlePuestoChange = (e) => {
        setPuesto(e.target.value);
    };

    // Imagen
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImagen(file);
            setPreviewImagen(URL.createObjectURL(file));
        }
    };

    const subirImagenYGuardar = async () => {
        if (!imagen) {
            mostrarAlerta("Selecciona una imagen primero ", "warning");

            return;
        }
        if (!selectedUsuario || !selectedCompetencia || !puesto) {
            mostrarAlerta("Selecciona competencia, usuario y puesto", "warning");
            return;
        }
        try {
            // Subir imagen a Firebase
            const storageRef = ref(storage, `ganadores/${imagen.name}`);
            await uploadBytes(storageRef, imagen);
            const downloadURL = await getDownloadURL(storageRef);
            setUrlImagen(downloadURL);

            // Enviar datos a API con bearer token
            const token = getToken();
            const res = await fetch(
                "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Ganadores/Agregar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        idUsuario: Number(selectedUsuario),
                        idActividad: Number(selectedCompetencia),
                        puesto,
                        imagen: String(downloadURL),
                    }),
                }
            );

            const data = await res.json();

            // Mostrar alerta según respuesta de la API
            if (data.Estado) {
                mostrarAlerta(data.Mensaje, "success");
                // Resetear estados
                setImagen(null);
                setPreviewImagen(null);
                setUrlImagen("");
                setSelectedCompetencia(null);
                setSelectedUsuario(null);
                setPuesto("");
                cerrarModal();
            await cargarGanadores();
            } else {

                mostrarAlerta(data.Mensaje, "warning");
                setImagen(null);
                setPreviewImagen(null);
                setUrlImagen("");
                setSelectedCompetencia(null);
                setSelectedUsuario(null);
                setPuesto("");
            }
        } catch (error) {
            mostrarAlerta("Error: " + error.message, "error");
            console.error(error);
        }
    };

    const cargarGanadores = async () => {
        setCargando(true);
        try {
            const res = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Ganadores/PorActividad");
            //if (!res.ok) throw new Error(await res.text());
            const data = await res.json();
            setGanadores(data);
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
        cargarGanadores();
    }, []);

    useEffect(() => {
        let filtrados = ganadores;

        if (busqueda.trim()) {
            const lower = busqueda.toLowerCase();
            filtrados = filtrados.filter((act) =>
                Object.values(act).some(
                    (valor) => valor && valor.toString().toLowerCase().includes(lower)
                )
            );
        }

        if (tipoFiltro) {
            filtrados = filtrados.filter((act) => act["NOMBRE ACTIVIDAD"] === tipoFiltro);
        }

        setActividadesFiltradas(filtrados);
    }, [busqueda, tipoFiltro, ganadores]);

const toggleEstado = async (idUsuario, idActividad, estadoActual) => {
    const nuevoEstado = !estadoActual;
    setCargando(true);
    try {
        const res = await fetchWithAuth(
            "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/ganadores/ActualizarEstado",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idGan: idUsuario,
                    idactividad: idActividad,
                    estado: nuevoEstado,
                }),
            }
        );

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        mostrarAlerta(data.Mensaje, "success");

       
        await new Promise((resolve) => setTimeout(resolve, 400));
        setGanadores((prev) =>
            prev.filter(
                (g) =>
                    !(
                        g["ID USUARIO"] === idUsuario &&
                        g["ID ACTIVIDAD"] === idActividad
                    )
            )
        );
        await cargarGanadores();


    } catch (err) {
        mostrarAlerta("Error al actualizar: " + err.message, "error");
    } finally {
        setCargando(false);
    }
};




    const cerrarModal = () => {
        setModalAgregar(false);
        setSelectedCompetencia(null);
        setSelectedUsuario(null);
        setPuesto("");
        setImagen(null);
        setPreviewImagen(null);
        setUrlImagen("");
        setUsuariosActividad([]);
    };


  






    const tipo = [...new Set(ganadores.map((u) => u["NOMBRE ACTIVIDAD"]))];

    //if (error) {
    //return <p className="text-red-600 text-center mt-4">Error: {error}</p>;
    // }

    return (
        <div className="bg-white relative overflow-x-auto px-4 py-6" style={{ minHeight: '100vh' }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">GANADORES</h2>
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
                    <option value="">-- Actividad --</option>
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

            {/* Cargando */}
            {cargando && (
                <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Tabla de Ganadores */}
            <table className="min-w-full border-collapse shadow-md relative z-0">
                <thead className="bg-blue-900 text-white text-sm">
                    <tr>
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">TIPO</th>
                        <th className="px-4 py-2 text-left">NOMBRE ACTIVIDAD</th>
                        <th className="px-4 py-2 text-center">GANADOR</th>
                        <th className="px-4 py-2 text-left">PUESTO</th>
                        <th className="px-4 py-2 text-left">ESTADO</th>
                        <th className="px-4 py-2 text-left">ACCIONES</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                    {actividadesFiltradas.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-6 text-gray-500">
                                No hay ganadores registrados.
                            </td>
                        </tr>
                    ) : (
                        actividadesFiltradas.map((actividad) => {
                            const id = actividad["ID"];
                            const estadoActivo = actividad["ESTADO"]?.toLowerCase() === "true";
                            const idUsu = actividad["ID USUARIO"];
                            const idActividad = actividad["ID ACTIVIDAD"];

                            return (
                                <tr key={id} className={id % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                                    <td className="px-4 py-2">{id}</td>
                                    <td className="px-4 py-2">{actividad["TIPO"]}</td>
                                    <td className="px-4 py-2">{actividad["NOMBRE ACTIVIDAD"]}</td>
                                    <td className="px-4 py-2">{actividad["NOMBRE"]}</td>
                                    <td className="px-4 py-2">{actividad["PUESTO"]}</td>
                                    <td className="px-4 py-2">{estadoActivo ? "Activo" : "Inactivo"}</td>
                                    <td className="px-4 py-2 flex items-center space-x-2">
                                        <Switch
                                            checked={estadoActivo}
                                            onChange={() => toggleEstado(idUsu, idActividad, estadoActivo)}
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
                        })
                    )}
                </tbody>

            </table>

            {modalAgregar && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg z-50 w-96 p-6">
                    <h3 className="text-lg font-semibold text-center mb-4 text-blue-900">
                        Agregar Ganador
                    </h3>

                    {/* Competencia */}
                    <select
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800 mb-4"
                        value={selectedCompetencia || ""}
                        onChange={handleCompetenciaChange}
                    >
                        <option value="">-- Competencia --</option>
                        {competencias.map((c) => (
                            <option key={c.ID} value={c.ID}>
                                {c.NOMBRE}
                            </option>
                        ))}
                    </select>

                    {/* Usuario */}
                    <select
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800 mb-4"
                        value={selectedUsuario || ""}
                        onChange={handleUsuarioChange}
                        disabled={!usuariosActividad.length}
                    >
                        <option value="">-- Ganador --</option>
                        {usuariosActividad.map((u) => (
                            <option key={u.idUsuario || u.ID || u.id} value={u.idUsuario || u.ID || u.id}>
                                {u.nombre || u.NOMBRE || `${u.nombre} ${u.apellido}`}
                            </option>
                        ))}
                    </select>

                    {/* Puesto */}
                    <select
                        className="w-full border border-gray-400 rounded px-3 py-2 text-gray-800 mb-4"
                        value={puesto}
                        onChange={handlePuestoChange}
                    >
                        <option value="">-- Puesto --</option>
                        {puestos.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>

                    {/* Imagen */}
                    <div
                        className="w-60 h-60 border-2 border-blue-500 border-dashed rounded-md flex items-center justify-center cursor-pointer overflow-hidden mb-6 mx-auto"
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        {previewImagen ? (
                            <img src={previewImagen} alt="Vista previa" className="object-cover w-full h-full" />
                        ) : (
                            <span className="text-gray-500 text-center px-4 text-sm">
                                Haz clic para seleccionar una imagen
                            </span>
                        )}
                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-2 mt-5">
                        <button
                            className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
                            onClick={cerrarModal}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={subirImagenYGuardar}
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