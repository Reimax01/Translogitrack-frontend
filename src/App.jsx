"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import PedidosAdmin from "./components/PedidosAdmin"
import ConductoresAdmin from "./components/ConductoresAdmin"
import CamionesAdmin from "./components/CamionesAdmin"
import RutasAdmin from "./components/RutasAdmin"
import Reportes from "./components/Reportes"
import Layout from "./components/Layout"
import PrivateRoute from "./components/PrivateRoute"
import UsuariosAdmin from "./components/UsuariosAdmin"
import MiPerfil from "./components/MiPerfil"
import CambiarContrasena from "./components/CambiarContrasena"
import Configuracion from "./components/Configuracion"
import ResetPassword from "./components/ResetPassword"
import RegistroCliente from "./components/RegistroCliente"
import RecuperarContrasena from "./components/RecuperarContrasena"

function App() {
  return (
    <Routes>
      {/* Ruta raíz que redirije a login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<RegistroCliente />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Rutas privadas del dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Ruta por defecto del dashboard */}
        <Route index element={<Dashboard />} />

        {/* Rutas específicas del dashboard */}
        <Route path="usuarios" element={<UsuariosAdmin />} />
        <Route path="pedidos" element={<PedidosAdmin />} />
        <Route path="conductores" element={<ConductoresAdmin />} />
        <Route path="camiones" element={<CamionesAdmin />} />
        <Route path="rutas" element={<RutasAdmin />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="mi-perfil" element={<MiPerfil />} />
        <Route path="cambiar-contrasena" element={<CambiarContrasena />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      {/* Ruta catch-all para páginas no encontradas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
