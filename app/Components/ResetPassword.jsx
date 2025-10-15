"use client";

import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { Snackbar, Alert } from "@mui/material";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      mostrarAlerta("Por favor, completa todos los campos.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      mostrarAlerta("Las contraseñas no coinciden.", "warning");
      return;
    }

    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexContrasena.test(password)) {
      mostrarAlerta(
        "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.",
        "warning"
      );
      return;
    }

    const datos = { 
      correo:email, 
      contraseña:password };

    fetch("https://localhost:44335/Usuario/ReinicioContrasena", { 
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al actualizar la contraseña");
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
        mostrarAlerta("Hubo un error al actualizar la contraseña", "error");
      });
  };

  return (
    <div className="min-h-screen bg-blue-900/90 bg-gradient-to-b from-blue-900/80 to-blue-800/80 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 sm:p-12 rounded-3xl bg-white shadow-2xl">
        {/* Ícono principal */}
        <div className="flex items-center justify-center mb-6">
          <FaLock className="text-5xl text-blue-900" />
        </div>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Restablecer Contraseña
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Nueva contraseña con icono y sugerencia */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Nueva contraseña
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition pr-10"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {isPasswordFocused && (
              <p className="mt-1 text-sm text-gray-500 italic">
                La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.
              </p>
            )}
          </div>

          {/* Confirmar contraseña con icono */}
          <div className="relative">
            <label className="block text-gray-700 font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition pr-10"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition"
          >
            Actualizar Contraseña
          </button>
        </form>

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
