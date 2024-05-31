import { Outlet } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Outlet />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
