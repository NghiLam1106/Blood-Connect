import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { socketService } from './services/socket'
import { useStore } from './store/useStore'

export default function App() {
  const isAuthenticated = useStore(state => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
  }, [isAuthenticated]);

  return <RouterProvider router={router} />
}
