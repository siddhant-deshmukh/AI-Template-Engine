import { Navbar } from './components/layout/Navbar'
import { AuthProvider } from './context/AuthContext'
import AddPrompt from './pages/add-prompt'

function App() {

  return (
    <AuthProvider>
      <div className='dark'>
        <Navbar />
        <div className='bg-background flex min-h-screen'>
        <AddPrompt />
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
