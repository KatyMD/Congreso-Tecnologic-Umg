"use client";

import { useState } from "react";
import { FaQuestionCircle } from "react-icons/fa";
import styles from "../style/Faq.module.css";

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "¿Qué es el Congreso Tecnológico?",
      answer:
        "Es un evento anual que reúne a profesionales, estudiantes y entusiastas de la tecnología para compartir conocimientos, innovaciones y experiencias en desarrollo de software, inteligencia artificial, ciberseguridad y más.",
    },
    {
      question: "¿Quiénes pueden asistir?",
      answer:
        "Pueden asistir profesionales, estudiantes, emprendedores y cualquier persona interesada en la tecnología y la innovación." ,
    },
    {
      question: "¿Cómo registrarme?",
      answer:
        "Registrándote en la página oficial del congreso llenando el formulario en línea. Cupos limitados.",
    },
    {
      question: "¿Habrá talleres?",
      answer:
        "Sí, sobre desarrollo web, IA, telecomunicaciones, seguridad informática, impartidos por expertos.",
    },
    {
      question: "¿Recibiré certificado?",
      answer:
        "Sí. Todos los asistentes recibirán un certificado digital de participación,el cual será enviado por correo electrónico.",
    },
  ];

   const toggle = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="min-h-screen bg-blue-900/90 bg-gradient-to-b from-blue-900/80 to-blue-800/80 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-8 sm:p-12 rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <FaQuestionCircle className="text-blue-800 text-6xl mb-3 animate-pulse" /> 
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className={styles.card}>
              <button
                onClick={() => toggle(index)}
                className={`${styles.button} w-full flex justify-between items-center text-lg sm:text-xl font-semibold text-gray-800`}
              >
                {faq.question}
                <span className="text-blue-700 text-2xl font-bold transition-transform duration-300">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className={`${styles.answer} mt-2 text-gray-700`}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
