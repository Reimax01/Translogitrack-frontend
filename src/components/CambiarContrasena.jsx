"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"

const CambiarContrasena = () => {
  const [contrasenaActual, setContrasenaActual] = useState("")
  const [nuevaContrasena, setNuevaContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (nuevaContrasena !== confirmarContrasena) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden.",
      })
      return
    }

    // Aquí iría la lógica para enviar la solicitud de cambio de contraseña al backend
    // Por ejemplo:
    // const response = await fetch('/api/cambiar-contrasena', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     contrasenaActual,
    //     nuevaContrasena,
    //   }),
    // });

    // if (response.ok) {
    //   Swal.fire({
    //     icon: 'success',
    //     title: 'Contraseña Actualizada',
    //     text: 'Su contraseña ha sido actualizada exitosamente.',
    //   });
    // } else {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error',
    //     text: 'Hubo un error al actualizar la contraseña.',
    //   });
    // }

    // Simulación de éxito (para fines de demostración)
    Swal.fire({
      icon: "success",
      title: "Contraseña Actualizada",
      text: "Su contraseña ha sido actualizada exitosamente.",
    })

    // Limpiar los campos después de un cambio exitoso
    setContrasenaActual("")
    setNuevaContrasena("")
    setConfirmarContrasena("")
  }

  const handleVolver = () => {
    navigate("/mi-perfil")
  }

  return (
    <div className="container mt-5">
      <h1>Cambiar Contraseña</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="contrasenaActual" className="form-label">
            Contraseña Actual
          </label>
          <input
            type="password"
            className="form-control"
            id="contrasenaActual"
            value={contrasenaActual}
            onChange={(e) => setContrasenaActual(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="nuevaContrasena" className="form-label">
            Nueva Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="nuevaContrasena"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirmarContrasena" className="form-label">
            Confirmar Nueva Contraseña
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmarContrasena"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Cambiar Contraseña
        </button>
        <button type="button" className="btn btn-secondary ms-2" onClick={handleVolver}>
          Volver
        </button>
      </form>
    </div>
  )
}

export default CambiarContrasena
