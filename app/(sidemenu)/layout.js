
import SidebarMenu from "@/app/Components/SidebarMenu"; 

export default function SidebarLayout({ children }) {
  return (
    <div className="flex">
      <SidebarMenu /> 
      <div className="flex-1">{children}</div> {/* Contenido de la página que cambia según la ruta */}
    </div>
  );
}
