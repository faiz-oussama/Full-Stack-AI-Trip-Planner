import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './App.css'
import App from './App.jsx'
import Layout from './components/custom/Layout'
import CreateTrip from './create-trip/index.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <App />,
      },
      {
        path: '/create-trip',
        element: <CreateTrip />,
      },
      {
        path: '/planner',
        element: <div>AI Planner Page</div>,
      },
      {
        path: '/itinerary',
        element: <div>My Itinerary Page</div>,
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
    <RouterProvider router={router} />
  </StrictMode>,
);
