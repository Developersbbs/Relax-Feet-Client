import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { selectEmail, selectPassword, setEmail, setPassword, setUser, selectUser } from '../redux/features/auth/loginSlice'
import { toast } from 'react-toastify'
import authServices from '../services/authServices'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const email = useSelector(selectEmail)
  const password = useSelector(selectPassword)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)

  // 🔹 Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/reports", { replace: true })
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault() // 👈 prevent page reload

    if (isLoading) return // Prevent multiple clicks during loading

    setIsLoading(true)

    try {
      const response = await authServices.login({ email, password })
      const data = response.data

      // ✅ LocalStorage save FIRST
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)

      // ✅ Redux update SECOND
      dispatch(setUser({ user: data.user, token: data.token }))

      toast.success("Login successful 🎉")
      navigate("/reports") // 👈 redirect after login
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || err.message || "Something went wrong"
      toast.error(`Login Error: ${message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#005f7f] via-[#0099CC] to-[#00bcd4] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/95 backdrop-blur shadow-2xl ring-1 ring-teal-100 px-8 py-10 space-y-8">
          <div className="text-center space-y-3">
            {/* Logo */}
            <div className="flex justify-center">
              <img
                src="/FettleHealth.png"
                alt="Fettle Health and Heal"
                className="h-48 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0099CC]">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mt-1">Physio & Wellness Studio</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 text-center">
            New here?{' '}
            <a
              href="/register"
              className="font-medium text-[#0099CC] hover:text-[#007aa3] underline-offset-4 hover:underline"
            >
              Create an account
            </a>
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="space-y-2 text-left">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => dispatch(setEmail(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#0099CC] focus:outline-none focus:ring-2 focus:ring-[#0099CC]/40 transition"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-2 text-left">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => dispatch(setPassword(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#0099CC] focus:outline-none focus:ring-2 focus:ring-[#0099CC]/40 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-[#0099CC] hover:text-[#007aa3] focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Keep your credentials secure. Contact an administrator if you need assistance.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0099CC] ${isLoading
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-[#0099CC] via-[#007aa3] to-[#005f7f] shadow-[#0099CC]/30 hover:shadow-xl hover:shadow-[#0099CC]/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div >
  )
}

export default Login
