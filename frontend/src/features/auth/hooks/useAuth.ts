import { useContext } from "react"
import { AuthContext } from "../context/AuthProvider"

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used inside its provider")
  }
  return context
}
