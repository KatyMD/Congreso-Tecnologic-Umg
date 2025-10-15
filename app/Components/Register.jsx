"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [userType, setUserType] = useState("interno");
  const [showPassword, setShowPassword] = useState(false);
  const [mostrarSugerencia, setMostrarSugerencia] = useState(false);

  // Estado para alertas
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
    setAlerta({ ...alerta, open: false });
  };

  const validarContrasena = (contrasena) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regexContrasena.test(contrasena);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) return;

    // Decodificar token JWT manualmente
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);

    const correo = payload.email;
    const nombre = payload.given_name || "Nombre";
    const apellido = payload.family_name || "Apellido";

    if (!correo.endsWith("@miumg.edu.gt")) {
      mostrarAlerta(
        "Debe iniciar sesión con una cuenta del dominio @miumg.edu.gt",
        "warning"
      );
      return;
    }

    const nuevoUsuario = {
      nombre,
      apellido,
      correo,
      contrasena: null,
      establecimiento: null,
      telefono: null,
    };

    fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/Agregar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar usuario");
        return res.json();
      })
      .then((data) => {
        const mensajeAPI = data?.Mensaje || "Respuesta sin mensaje desde API";

        if (data?.Estado) {
          mostrarAlerta(mensajeAPI, "success");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          mostrarAlerta(mensajeAPI, "warning");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        mostrarAlerta("Hubo un error al registrar el usuario", "error");
      });
  };

  const handleGoogleError = () => {
    mostrarAlerta("Error al iniciar sesión con Google", "error");
  };

  const handleExternalSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const nombre = data.get("nombre")?.trim();
    const apellido = data.get("apellido")?.trim();
    const email = data.get("email")?.trim();
    const password = data.get("password")?.trim();
    const institucion = data.get("institucion")?.trim();
    const telefono = data.get("telefono")?.trim();

    // Validar que no haya campos vacíos
    if (!nombre || !apellido || !email || !password || !institucion || !telefono) {
      mostrarAlerta("Por favor, completa todos los campos.", "warning");
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      mostrarAlerta("Por favor, ingresa un correo electrónico válido.", "warning");
      return;
    }

    // Validar contraseña segura
    if (!validarContrasena(password)) {
      mostrarAlerta(
        "La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.",
        "warning"
      );
      return;
    }

    const nuevoUsuario = {
      nombre,
      apellido,
      correo: email,
      contrasena: password,
      establecimiento: institucion,
      telefono,
    };

    fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/Agregar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al registrar usuario");
        return res.json();
      })
      .then((data) => {
        const mensajeAPI = data?.Mensaje || "Respuesta sin mensaje desde API";

        if (data?.Estado) {
          mostrarAlerta(mensajeAPI, "success");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          mostrarAlerta(mensajeAPI, "warning");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        mostrarAlerta("Hubo un error al registrar el usuario", "error");
      });
  };

  return (
    <div className="min-h-screen bg-blue-900/90 bg-gradient-to-b from-blue-900/80 to-blue-800/80 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 sm:p-12 rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-blue-900 text-6xl mb-2" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">Crear Cuenta</h2>
        </div>

        <p className="text-gray-700 text-center mb-6">Selecciona el tipo de usuario:</p>

        <div className="flex justify-center mb-8 space-x-4">
          <button
            className={`px-6 py-2 rounded-full font-semibold transition ${
              userType === "interno"
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setUserType("interno")}
          >
            Universidad (UMG)
          </button>
          <button
            className={`px-6 py-2 rounded-full font-semibold transition ${
              userType === "externo"
                ? "bg-blue-900 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => setUserType("externo")}
          >
            Otra Institución
          </button>
        </div>

        {userType === "interno" ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-700 text-lg text-center">Regístrate con tu cuenta de la universidad</p>

            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleExternalSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-800 font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  required
                  className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Correo</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1">Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                onFocus={() => setMostrarSugerencia(true)}
                onBlur={() => setMostrarSugerencia(false)}
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

              {mostrarSugerencia && (
                <p className="mt-2 text-xs text-gray-600">
                  La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Establecimiento</label>
              <input
                type="text"
                name="institucion"
                placeholder="Escriba la institución a la que pertenece"
                required
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                required
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition"
              >
                Registrarse
              </button>
            </div>
          </form>
        )}

        {/* Snackbar para alertas */}
        <Snackbar
          open={alerta.open}
          autoHideDuration={6000}
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
    </div>
  );
}
