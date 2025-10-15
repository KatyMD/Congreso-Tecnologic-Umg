"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { FaUserCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginUser() {
  const router = useRouter();

  const [userType, setUserType] = useState("interno");
  const [showPassword, setShowPassword] = useState(false);
  const [alerta, setAlerta] = useState({
    open: false,
    severity: "success", // success, warning, error, info
    mensaje: "",
  });

  // Estados controlados para inputs externos
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Mostrar alerta y cerrar automáticamente en 3 segundos, limpiando inputs externos
  const mostrarAlerta = (mensaje, severity = "info") => {
    setAlerta({ open: true, severity, mensaje });

    // Limpiar campos de correo y contraseña
    setEmail("");
    setPassword("");

    setTimeout(() => {
      setAlerta((prev) => ({ ...prev, open: false }));
    }, 3000);
  };

  const validarEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Manejo exitoso login con Google
  const handleGoogleSuccess = (credentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) return;

    // Decodificar token JWT
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

    // Validar dominio
    if (!correo.endsWith("@miumg.edu.gt")) {
      mostrarAlerta(
        "Debe iniciar sesión con una cuenta del dominio @miumg.edu.gt",
        "warning"
      );
      return;
    }

    const usuarioLogin = {
      correo,
      contrasena: null,
    };

    fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioLogin),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al iniciar sesión");
        return res.json();
      })
      .then((data) => {
        const mensajeAPI = data?.Mensaje || "Respuesta sin mensaje desde API";
        if (data?.Estado) {
          sessionStorage.setItem("token", data.Token);
          mostrarAlerta(mensajeAPI, "success");
          setTimeout(() => {
            router.push("/Inicio");
          }, 1500);
        } else {
          mostrarAlerta(mensajeAPI, "warning");
        }
      })
      .catch(() => {
        mostrarAlerta("Hubo un error al iniciar sesión con Google", "error");
      });
  };

  // Error en login con Google
  const handleGoogleError = () => {
    mostrarAlerta("Error al iniciar sesión con Google", "error");
  };

  // Login externo con correo y contraseña
  const handleExternalLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      mostrarAlerta("Por favor, completa todos los campos.", "warning");
      return;
    }

    if (!validarEmail(email)) {
      mostrarAlerta("Correo electrónico no válido.", "warning");
      return;
    }

    const usuarioLogin = {
      correo: email,
      contrasena: password,
    };

    fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Usuario/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioLogin),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al iniciar sesión");
        return res.json();
      })
      .then((data) => {
        const mensajeAPI = data?.Mensaje || "Respuesta sin mensaje desde API";
        if (data?.Estado) {
          sessionStorage.setItem("token", data.Token);
          mostrarAlerta(mensajeAPI, "success");
          setTimeout(() => {
            router.push("/Inicio");
          }, 1500);
        } else {
          mostrarAlerta(mensajeAPI, "warning");
        }
      })
      .catch(() => {
        mostrarAlerta("Hubo un error al iniciar sesión", "error");
      });
  };

  // Cerrar Snackbar
  const handleCloseAlerta = (event, reason) => {
    if (reason === "clickaway") return;
    setAlerta((prev) => ({ ...prev, open: false }));
  };

  return (
    <div className="min-h-screen bg-blue-900/90 bg-gradient-to-b from-blue-900/80 to-blue-800/80 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 sm:p-12 rounded-3xl bg-white shadow-2xl">
        {/* Icono y título */}
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-blue-900 text-6xl mb-2" />
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800">
            Iniciar Sesión
          </h2>
        </div>

        <p className="text-gray-700 text-center mb-6">
          Selecciona el tipo de usuario:
        </p>

        {/* Selector de tipo */}
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

        {/* Login interno (Google) */}
        {userType === "interno" ? (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-700 text-lg text-center">
              Inicia sesión con tu cuenta institucional
            </p>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              //useOneTap
            />
          </div>
        ) : (
          // Login externo (correo y contraseña)
          <form className="space-y-5" onSubmit={handleExternalLogin}>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Correo
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 font-medium mb-1">
                Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="********"
                className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-semibold transition"
              >
                Iniciar Sesión
              </button>
            </div>

            <div className="flex justify-between items-center text-sm mt-5">
              <Link
                href="/password"
                className="text-blue-900 text-base hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        )}

        {/* Separador */}
        <div className="my-6 flex items-center justify-center">
          <span className="h-px w-1/4 bg-gray-300" />
          <span className="px-3 text-gray-500 text-sm">O</span>
          <span className="h-px w-1/4 bg-gray-300" />
        </div>

        {/* Enlace para crear cuenta */}
        <div className="text-center mt-5">
          <p className="text-gray-700 mb-3">¿No tienes una cuenta?</p>
          <Link
            href="/registro"
            className="block w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            Crear cuenta
          </Link>
        </div>

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
