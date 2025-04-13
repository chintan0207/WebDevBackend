import { useNavigate } from "react-router";
import "./App.css";
import Login from "./components/Login";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <div>
        <h1>Welcome to our website</h1>
        <button
          style={{ marginRight: "10px" }}
          type="button"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button type="button" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </>
  );
}

export default App;
