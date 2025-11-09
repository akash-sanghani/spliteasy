import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = "TcCO3ZTFoYycyErpOjY4x9yTG8YpiBZc666AYUy6";
const REDIRECT_URI = "https://akash-sanghani.github.io/spliteasy/";
const AUTH_URL = `https://secure.splitwise.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=read,write`;

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      // exchange code → token via Lambda
      fetch("https://your-lambda-url/get_access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI, password: "letmein" }),
      })
        .then((r) => r.json())
        .then((data) => {
          localStorage.setItem("access_token", data.access_token);
          navigate("/dashboard");
        })
        .catch(console.error);
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">SplitEasy</h1>
      <a
        href={AUTH_URL}
        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
      >
        Login with Splitwise
      </a>
    </div>
  );
}
