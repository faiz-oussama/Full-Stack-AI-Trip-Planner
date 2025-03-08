import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider'
import Login from './auth/Login'
import PrivateRoute from './auth/PrivateRoute'
import SignUp from './auth/registration'
import Layout from './components/custom/Layout'
import NoHeaderLayout from './components/custom/NoHeaderLayout'
import CreateTrip from './create-trip/index.jsx'
import ResultsPage from './generate-trip/ResultsPage.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/trip-results',
    element: (
      <PrivateRoute>
        <NoHeaderLayout>
          <ResultsPage />
        </NoHeaderLayout>
      </PrivateRoute>
    ),
  },
  
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/create-trip',
        element: <PrivateRoute>
                    <CreateTrip />
                </PrivateRoute>
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/itinerary',
        element: <PrivateRoute>
                  <div>My Itinerary Page</div>
                </PrivateRoute>,
      },
      {
        path: '/experiences',
        element: <div>Local Experiences Page</div>,
      },
      {
        path: '/map',
        element: <div>Interactive Map Page</div>,
      },
      {
        path: '/festivals',
        element: <div>Festivals Page</div>,
      },
      {
        path: '/signin',
        element: <div>Sign In Page</div>,
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
