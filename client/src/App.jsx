import { BrowserRouter, Route, Routes } from "react-router"
import Dashboard from "./pages/Dashboard"
import Settings from "./pages/Settings"

export const App=()=>{
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Dashboard />} path="/" />
        <Route element={<Settings />} path="/settings" />
      </Routes>
    </BrowserRouter>
  )
}
