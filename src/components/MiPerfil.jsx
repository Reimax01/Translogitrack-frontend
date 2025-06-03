"use client"
import { useNavigate } from "react-router-dom"

const MiPerfil = () => {
  const navigate = useNavigate()

  const handleCambiarContrasena = () => {
    navigate("/cambiar-contrasena")
  }

  return (
    <div>
      <h1>Mi Perfil</h1>
      <button onClick={handleCambiarContrasena}>Cambiar Contraseña</button>
    </div>
  )
}

export default MiPerfil
