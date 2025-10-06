import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";

interface LoginProps {
  onLogin: () => void; 
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const cookies = new Cookies();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load remembered credentials
  useEffect(() => {
    const savedEmail = cookies.get("rememberEmail");
    const savedPassword = cookies.get("rememberPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRemember(true);
    }
  }, []);

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data?.token) {
        cookies.set("auth", data.token, { path: "/" });
        if (data.user) cookies.set("userDetails", JSON.stringify(data.user), { path: "/" });

        if (remember) {
          cookies.set("rememberEmail", email, { path: "/" });
          cookies.set("rememberPassword", password, { path: "/" });
        } else {
          cookies.remove("rememberEmail");
          cookies.remove("rememberPassword");
        }

        toast.success("Login successful!");
        onLogin();
      } else {
        toast.error(data?.message || "Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#ebedfa] px-4">
      <ToastContainer position="top-right" />
      <div className="w-full max-w-4xl bg-white/30 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/40">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-teal-700 to-teal-500 flex flex-col justify-center items-center text-white p-6 md:p-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide mb-3 text-center">
            Welcome !
          </h2>
          <p className="text-sm sm:text-base mb-6 text-center opacity-80">
            Login to access your dashboard
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 sm:space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white text-black outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3 text-gray-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-full bg-white text-black outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center space-x-2 pl-4">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-400 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="text-white text-sm select-none">
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-teal-700 font-bold py-3 rounded-full shadow-md hover:bg-gray-100 hover:scale-105 transition transform duration-300 text-sm sm:text-base"
            >
              {loading ? "Signing in..." : "LOGIN"}
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <img src="/login.jpg" alt="Login Illustration" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
