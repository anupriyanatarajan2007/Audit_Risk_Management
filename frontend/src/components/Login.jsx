import { useState } from "react";
import security from "../assets/security.png";
import { login } from "../service/AuthService";
import ForgotPassword from "./ForgotPassword";
import { Link, useNavigate } from "react-router-dom";
export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login(formData);
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("role", response.data.data.user.role);
      
      setIsError(false);
  
      const role=response.data.data.user.role;

  switch(role){

    case "SYSTEM_ADMINISTRATOR":
    navigate("/admin/dashboard");
    break;
    
    case "INTERNAL_AUDITOR":
    navigate("/internal-auditor/dashboard");
    break;
    
    case "AUDIT_MANAGER":
    navigate("/audit-manager/dashboard");
    break;
    
    case "CHIEF_AUDIT_EXECUTIVE":
    navigate("chief-audit-executive/dashboard");
    break;
    
    case "RISK_OFFICER":
    navigate("/risk-officer/dashboards");
    break;
    
    case "AUDITEE":
    navigate("/auditee-officer");
    break;
    
    case "COMPLIANCE_OFFICER":
    navigate("/compliance-officer/dashboard");
    break;
    
    }

      console.log("Login successful:", response.data);
  
    } catch (error) {
      setIsError(true);
      setMessage(
        error.response ? error.response.data.message || error.response.data : "Server not reachable"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-10 overflow-hidden">
      <div className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE — self-contained, doesn't dictate right side height */}
        <div className="hidden md:block md:w-1/2 self-stretch">
          <img src={security} alt="Security" className="w-full h-full object-cover" />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-4">
          <div className="w-full max-w-sm mx-auto">

            <div className="flex justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">A</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-slate-900">Welcome Back</h1>
            <p className="text-center text-gray-500 text-sm mt-1 mb-4">Login to continue</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block mb-1 font-medium text-slate-700 text-sm">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-slate-700 text-sm">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end -mt-1">
                <Link to="/forgot-password" className="text-xss text-emerald-600 hover:underline">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl font-semibold transition"
              >
                Login
              </button>

              {message && (
                <p className={`text-xss font-medium text-center ${isError ? "text-red-600" : "text-green-600"}`}>
                  {message}
                </p>
              )}
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}