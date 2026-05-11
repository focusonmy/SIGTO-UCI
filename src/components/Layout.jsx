import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="main-content main-content-bottom">
        {children}
      </main>
    </div>
  )
}