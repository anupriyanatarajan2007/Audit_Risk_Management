import { useState } from "react";
import security from "../assets/security.png";
import { forgotPassword, verifyOtp, resetPassword } from "../service/AuthService";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const showMessage = (text, error = false) => {
    setIsError(error);
    setMessage(text);
  };

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await forgotPassword(email);
      showMessage("OTP sent to your email");
      setStep(2);
    } catch (error) {
      showMessage(
        error.response ? error.response.data.message || error.response.data : "Server not reachable",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await verifyOtp({ email, otp });
      showMessage("OTP verified");
      setStep(3);
    } catch (error) {
      showMessage(
        error.response ? error.response.data.message || error.response.data : "Server not reachable",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showMessage("Passwords do not match", true);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await resetPassword({ email, otp, newPassword });
      showMessage("Password reset successful");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      showMessage(
        error.response ? error.response.data.message || error.response.data : "Server not reachable",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl flex overflow-hidden">

        {/* LEFT SIDE */}
        <div className="hidden md:block md:w-1/2 self-stretch">
          <img src={security} alt="Security" className="w-full h-full object-cover" />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-6">
          <div className="w-full max-w-sm mx-auto">

            {/* LOGO */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">A</span>
              </div>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl font-bold text-center text-slate-900">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Verify OTP"}
              {step === 3 && "Reset Password"}
            </h1>
            <p className="text-center text-gray-500 text-sm mt-1 mb-5">
              {step === 1 && "Enter your email to receive an OTP"}
              {step === 2 && `Enter the OTP sent to ${email}`}
              {step === 3 && "Set a new password for your account"}
            </p>

            {/* STEP INDICATOR */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    s === step ? "w-8 bg-emerald-600" : s < step ? "w-8 bg-emerald-300" : "w-8 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* STEP 1: EMAIL */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block mb-1.5 font-medium text-slate-700 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            )}

            {/* STEP 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block mb-1.5 font-medium text-slate-700 text-sm">
                    OTP
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full text-sm text-emerald-600 hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block mb-1.5 font-medium text-slate-700 text-sm">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 font-medium text-slate-700 text-sm">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold transition"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {/* MESSAGE */}
            {message && (
              <p
                className={`text-sm font-medium text-center mt-3 ${
                  isError ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* BACK TO LOGIN */}
            <div className="text-center text-sm mt-4">
              <a href="/login" className="text-emerald-600 font-semibold hover:underline">
                ← Back to Login
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}