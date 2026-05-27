import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden selection:bg-primary/20">
      {/* Sticky Header Top Bar */}
      <Navbar />
      
      {/* Sidebar + Main Canvas */}
      <div className="flex flex-1 items-stretch">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
