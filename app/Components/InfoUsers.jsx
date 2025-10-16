"use client";

import { useEffect, useState } from "react";
import { MdEditSquare } from "react-icons/md";
import Switch from "react-switch";
import { Snackbar, Alert } from "@mui/material";
import { FaSearch } from "react-icons/fa";


export default function InfoUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [alerta, setAlerta] = useState({
    open: false,
    severity: "success",
    mensaje: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [tiposUsuario, setTiposUsuario] = useState([]);
  const [nuevoTipo, setNuevoTipo] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [establecimientoFiltro, setEstablecimientoFiltro] = useState("");

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

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/ListaUsurios");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarTiposUsuario = async () => {
    try {
      const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/TipoUsuario");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTiposUsuario(data);
    } catch (err) {
      console.error("Error al cargar tipos:", err);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("No hay token");
      setCargando(false);
      return;
    }
    cargarUsuarios();
  }, []);

  //  Filtro de usuarios
  useEffect(() => {
    let filtrados = usuarios;

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

    if (establecimientoFiltro) {
      filtrados = filtrados.filter(
        (user) =>
          user["ESTABLECIMIENTO"] === establecimientoFiltro
      );
    }

    setUsuariosFiltrados(filtrados);
  }, [busqueda, establecimientoFiltro, usuarios]);

  const toggleEstado = async (idUsuario, estadoActual) => {
    const nuevoEstado = !estadoActual;

    try {
      const res = await fetchWithAuth(
        "https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/ActualizarEstado",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: idUsuario, estado: nuevoEstado }),
        }
      );
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      await cargarUsuarios();

      mostrarAlerta(data.Mensaje, "success");
    } catch (err) {
      mostrarAlerta("Error al actualizar: " + err.message, "error");
    }
  };

  const openEditTipoModal = (user) => {
    setUserToEdit(user);
    setNuevoTipo("");
    cargarTiposUsuario();
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setUserToEdit(null);
    setNuevoTipo("");
  };

  const guardarNuevoTipo = async () => {
    if (!userToEdit || !nuevoTipo) {
      mostrarAlerta("Seleccione un tipo válido", "warning");
      return;
    }

    try {
      const body = {
        id: userToEdit["ID USUARIO"],
        tipoUsu: parseInt(nuevoTipo),
      };

      const res = await fetchWithAuth("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/ActualizarTipo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      if (data.Estado) {
        mostrarAlerta(data.Mensaje, "success");
        cerrarModal();
        await cargarUsuarios();

      } else {

        mostrarAlerta(data.Mensaje, "warning");

      }

    } catch (err) {
      mostrarAlerta("Error al actualizar tipo: " + err.message, "error");
    }
  };

  // Obtener establecimientos ú
  const establecimientos = [...new Set(usuarios.map((u) => u["ESTABLECIMIENTO"]))];

  if (error) {
    return <p className="text-red-600 text-center mt-4">Error: {error}</p>;
  }

  return (
    <div className="bg-white relative overflow-x-auto px-4 py-6" style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">USUARIOS</h2>

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

        {/* Filtro de establecimiento */}
        <select
          className="border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-400 w-full md:w-1/4 text-sm text-gray-700"
          value={establecimientoFiltro}
          onChange={(e) => setEstablecimientoFiltro(e.target.value)}
        >
          <option value="">-- Establecimiento --</option>
          {establecimientos.map((est) => (
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
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">TIPO</th>
            <th className="px-4 py-2 text-left">NOMBRE</th>
            <th className="px-4 py-2 text-left">CORREO</th>
            <th className="px-4 py-2 text-left">ESTABLECIMIENTO</th>
            <th className="px-4 py-2 text-left">TELÉFONO</th>
            <th className="px-4 py-2 text-left">FECHA</th>
            <th className="px-4 py-2 text-left">ESTADO</th>
            <th className="px-4 py-2 text-left">ACCIONES</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {usuariosFiltrados.map((user) => {
            const id = user["ID USUARIO"];
            const estadoActivo = user["ESTADO"]?.toLowerCase() === "true";

            return (
              <tr key={id} className={id % 2 === 0 ? "bg-white" : "bg-gray-100"}>
                <td className="px-4 py-2">{id}</td>
                <td className="px-4 py-2">{user["TIPO USUARIO"]}</td>
                <td className="px-4 py-2">{user["NOMBRE"]}</td>
                <td className="px-4 py-2">{user["CORREO"]}</td>
                <td className="px-4 py-2">{user["ESTABLECIMIENTO"]}</td>
                <td className="px-4 py-2">{user["TELEFONO"]}</td>
                <td className="px-4 py-2"> {user["FECHA"]?.split(" ")[0]}</td>
                <td className="px-4 py-2 text-center">
                  {estadoActivo ? "Activo" : "Inactivo"}
                </td>
                <td className="px-4 py-2 flex items-center space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 w-8 h-8 flex items-center justify-center"
                    onClick={() => openEditTipoModal(user)}
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
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-lg z-50 w-80 p-6">
          <h3 className="text-lg font-semibold text-center mb-4 text-blue-900">
            Editar tipo de usuario
          </h3>
          <select
            className="w-full text-gray-500 border border-gray-400 rounded px-3 py-2 mb-4"
            value={nuevoTipo}
            onChange={(e) => setNuevoTipo(e.target.value)}
          >
            <option value="">-- Seleccione tipo --</option>
            {tiposUsuario.map((tipo) => (
              <option key={tipo.ID} value={tipo.ID}>
                {tipo.NOMBRE}
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-500"
              onClick={cerrarModal}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={guardarNuevoTipo}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

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
