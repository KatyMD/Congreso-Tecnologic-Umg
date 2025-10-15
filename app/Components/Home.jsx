"use client"; 
import Image from "next/image";

export default function Home() {
  return (
    <>
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
            CONGRESO-UMG
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200">
            Innovación, conocimiento y tecnología en un solo lugar.
          </p>
       </div>

      </section>
    </>
  );
}
