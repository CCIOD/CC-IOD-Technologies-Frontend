import { Outlet } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Outlet />
      </SidebarProvider>
    </AuthProvider>
  );
}

export default App;
