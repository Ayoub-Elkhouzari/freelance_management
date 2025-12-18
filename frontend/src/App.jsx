import "./App.css";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <main className="w-full">
      {/* pages will render here */}
      <div className="pt-20">
        <Outlet />
      </div>
    </main>
  );
}

export default App;
