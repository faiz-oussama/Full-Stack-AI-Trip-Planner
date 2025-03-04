import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from "./AuthProvider";

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate();
  const { loginUser, loading, user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/create-trip", { replace: true });
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <span className="loading loading-dots loading-lg flex item-center mx-auto"></span>
    );
  }

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      default:
        return 'Failed to sign in';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await loginUser(email, password);
    } catch (error) {
      setError(getErrorMessage(error.code));
    }
  };

  return (
    <>
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-indigo-600"
        >
          <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
      </div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {error && (
            <div className="mb-6 overflow-hidden rounded-lg bg-red-50 ring-1 ring-red-200 animate-appear">
              <div className="flex items-center gap-x-4 p-4">
                <div className="flex-none rounded-full bg-red-50 p-1">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm/6 font-medium text-red-900">
                    {error}
                  </p>
                  <p className="mt-1 text-xs/5 text-red-700">
                    Please check your credentials and try again
                  </p>
                </div>
              </div>
              <div className="border-t border-red-100 bg-red-50/50 px-4 py-3">
                <div className="flex justify-between text-xs/5">
                  <p className="text-red-700">
                    Need help? <a href="#" className="font-medium hover:text-red-800">Reset your password</a>
                  </p>
                  <button 
                    onClick={() => setError('')} 
                    className="font-medium text-red-700 hover:text-red-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm/6 text-gray-500">
            Not a member?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
