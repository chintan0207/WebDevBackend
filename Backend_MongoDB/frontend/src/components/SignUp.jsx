/* eslint-disable no-unused-vars */
import { useState } from "react";
import apiClient from "../../service/apiClient";
import { useNavigate } from "react-router";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    //make Api call to backend
    //get response from backend
    //take actions based on response
    try {
      const data = await apiClient.signup(name, email, password);
      console.log("SignUp response: ", data);
      if (data.success === true) {
        navigate("/login");
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (error) {
      console.log("Error while signup", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <h1>Signup page</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            value={name}
            id="name"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">password:</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "SignUp..." : "SignUp"}
        </button>
      </form>
    </div>
  );
}

export default SignUp;
