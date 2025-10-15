"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GiBrain } from "react-icons/gi";
import { SiLevelsdotfyi } from "react-icons/si";

export default function PageHome() {
  const [congreso, setCongreso] = useState(null);
  const [actividades, setActividades] = useState([]);

  // Llamadas a la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCongreso = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/Congreso");
        const dataCongreso = await resCongreso.json();
        setCongreso(dataCongreso[0]);

        const resActividades = await fetch("https://apicongresotecnologico-htc2hkewedh6exe8.canadacentral-01.azurewebsites.net/Actividades/InfoActivades");
        const dataActividades = await resActividades.json();

        // actividades activas donde ESTADO sea "True"
        const actividadesActivas = dataActividades.filter(act => act.ESTADO === "True");
        setActividades(actividadesActivas);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchData();
  }, []);



  function formatHora(horaStr) {
    if (!horaStr) return "";
    const [hora, minutos] = horaStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hora), parseInt(minutos));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // ✅ Agrupar solo las actividades activas por tipo
  const actividadesPorTipo = actividades.reduce((acc, act) => {
    const tipo = act.TIPO;
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(act);
    return acc;
  }, {});

  return (
    <>
      {/* HERO */}
      <section
        id="home"
        className="relative w-full min-h-screen flex flex-col items-center justify-center text-center text-white overflow-hidden"
      >
        <div className="absolute inset-0 -z-10">
          <Image
            src="/IA.png"
            alt="Fondo Congreso Tecnológico"
            fill
            className="object-cover object-center md:object-[50%_30%]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 max-w-3xl px-4 mt-16 sm:mt-24">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Congreso Tecnológico Sistemas UMG
            <br />
            Centro Universitario Guastatoya
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Innovación, conocimiento y tecnología en un solo lugar.
          </p>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-block mt-6 bg-white text-gray-900 font-semibold px-6 py-3 rounded-full hover:bg-gray-200 transition"
          >
            Leer más
          </a>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section id="about" className="bg-blue-900 py-20 flex justify-center">
        <div className="grid gap-8 md:grid-cols-2 max-w-6xl w-full px-4">
          <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200 text-center hover:scale-[1.02]">
            <div className="flex justify-center mb-6">
              <GiBrain className="text-blue-900 w-14 h-14" />
            </div>
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">Misión</h3>
            <p className="text-gray-600 leading-relaxed">
              Promover el intercambio de conocimiento, innovación y experiencias
              tecnológicas entre estudiantes, docentes, profesionales y
              emprendedores, fomentando el aprendizaje colaborativo, la
              investigación y la aplicación práctica de la tecnología para
              contribuir al desarrollo académico, profesional y social.
            </p>
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-md hover:shadow-lg transition border border-gray-200 text-center hover:scale-[1.02]">
            <div className="flex justify-center mb-6">
              <SiLevelsdotfyi className="text-blue-900 w-14 h-14" />
            </div>
            <h3 className="text-2xl font-semibold text-blue-900 mb-4">Visión</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser un referente regional en la organización de eventos académicos
              de tecnología, reconocidos por impulsar el talento, la creatividad
              y la transformación digital, consolidando una comunidad
              universitaria comprometida con la excelencia y la innovación
              tecnológica.
            </p>
          </div>
        </div>
      </section>

      {/* DETALLES DEL CONGRESO */}
      <section id="congreso" className="bg-blue-900 py-20 flex justify-center">
        <div className="max-w-5xl w-full">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Detalles del Congreso
          </h2>

          {congreso ? (
            <div className="bg-gray-50 rounded-2xl shadow-md p-8 mb-12 shadow-md hover:shadow-lg transition hover:scale-[1.02]">
              <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                Congreso {congreso.NOMBRE}
              </h3>
              <p className="text-gray-700 mb-4">{congreso.DESCRIPCION}</p>
              <div className="text-gray-600 text-sm space-y-1">
                <p><strong className="text-gray-900">Fecha:</strong> {congreso.FECHA.split(" ")[0]}</p>
                <p><strong className="text-gray-900">Hora:</strong> {formatHora(congreso["HORA INICIO"])} - {formatHora(congreso["HORA FIN"])}</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Cargando detalles del congreso...</p>
          )}

          {/* ACTIVIDADES AGRUPADAS */}
          <div className="space-y-10">
            {Object.entries(actividadesPorTipo).map(([tipo, lista]) => (
              <div key={tipo}>
                <h3 className="text-2xl font-semibold text-white mb-4">{tipo}</h3>
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
                      <div className="text-gray-600 text-sm">
                        <p><strong className="text-gray-900">Fecha:</strong> {congreso.FECHA.split(" ")[0]}</p>
                        <p><strong className="text-gray-900">Hora:</strong> {formatHora(act["HORA INICIO"])} - {formatHora(act["HORA FIN"])}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NUESTROS INVITADOS */}
      <section className="bg-blue-900 py-20 flex justify-center">
        <div className="max-w-6xl w-full px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Nuestros Invitados
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {/* Invitado 1 */}
            <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition hover:scale-[1.02] text-center p-6">
              <img
                src="/sarah.png"
                alt="Ing. Ana Martínez"
                className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-800"
              />
              <h3 className="text-xl font-semibold text-blue-800">Ing. Ana Martínez</h3>
              <p className="text-gray-600">Especialista en Ciberseguridad</p>
            </div>

            {/* Invitado 2 */}
            <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition hover:scale-[1.02] text-center p-6">
              <img
                src="/shawn.png"
                alt="MSc. Luis Rodríguez"
                className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-800"
              />
              <h3 className="text-xl font-semibold text-blue-800">MSc. Luis Rodríguez</h3>
              <p className="text-gray-600">Ingeniero en Inteligencia Artificial</p>
            </div>

            {/* Invitado 3 */}
            <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition hover:scale-[1.02] text-center p-6">
              <img
                src="/emma.png"
                alt="Dra. Paula Gómez"
                className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-blue-800"
              />
              <h3 className="text-xl font-semibold text-blue-800">Dra. Paula Gómez</h3>
              <p className="text-gray-600">Investigadora en Robótica</p>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
