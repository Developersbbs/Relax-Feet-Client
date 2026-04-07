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
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-950 via-orange-900 to-amber-800 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-3xl bg-white/90 backdrop-blur shadow-xl ring-1 ring-orange-100 px-8 py-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xl font-semibold">
              🔐
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

            </div>
            <p className="text-sm text-slate-500">
              New here?{' '}
              <Link
                to="/register"
                className="font-medium text-orange-600 hover:text-orange-500 underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition"
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
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400/60 transition"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-orange-500 hover:text-orange-600 focus:outline-none"
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
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed opacity-70'
                  : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 shadow-orange-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]'
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
    </div>
  )
}

export default Login
