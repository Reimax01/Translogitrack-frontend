"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import RoleBasedDashboard from "./components/RoleBasedDashboard"
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
import MisPedidos from "./components/MisPedidos"
import NuevoPedido from "./components/NuevoPedido"
import SeguimientoPedidos from "./components/SeguimientoPedidos"

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
        <Route index element={<RoleBasedDashboard />} />

        {/* Rutas para ADMINISTRADORES */}
        <Route
          path="usuarios"
          element={
            <PrivateRoute requiredRole="Administrador">
              <UsuariosAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="reportes"
          element={
            <PrivateRoute requiredRole="Administrador">
              <Reportes />
            </PrivateRoute>
          }
        />
        <Route
          path="configuracion"
          element={
            <PrivateRoute requiredRole="Administrador">
              <Configuracion />
            </PrivateRoute>
          }
        />

        {/* Rutas para ADMINISTRADORES y OPERADORES */}
        <Route
          path="pedidos"
          element={
            <PrivateRoute requiredRoles={["Administrador", "Operador"]}>
              <PedidosAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="conductores"
          element={
            <PrivateRoute requiredRoles={["Administrador", "Operador"]}>
              <ConductoresAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="camiones"
          element={
            <PrivateRoute requiredRoles={["Administrador", "Operador"]}>
              <CamionesAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="rutas"
          element={
            <PrivateRoute requiredRoles={["Administrador", "Operador"]}>
              <RutasAdmin />
            </PrivateRoute>
          }
        />

        {/* Rutas para CLIENTES */}
        <Route
          path="mis-pedidos"
          element={
            <PrivateRoute requiredRole="Cliente">
              <MisPedidos />
            </PrivateRoute>
          }
        />
        <Route
          path="nuevo-pedido"
          element={
            <PrivateRoute requiredRole="Cliente">
              <NuevoPedido />
            </PrivateRoute>
          }
        />

        {/* Rutas para TODOS los usuarios autenticados */}
        <Route path="seguimiento" element={<SeguimientoPedidos />} />
        <Route path="mi-perfil" element={<MiPerfil />} />
        <Route path="cambiar-contrasena" element={<CambiarContrasena />} />
      </Route>

      {/* Ruta catch-all para páginas no encontradas */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
