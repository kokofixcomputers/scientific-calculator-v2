import ThemeToggle from "../ui/ThemeToggle.tsx"
import { Menu, X } from "lucide-react"

interface Props {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Navbar({ sidebarOpen, setSidebarOpen }: Props) {
  return (
    <header className="navbar-float h-16 flex items-center">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden btn-secondary p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-lg font-semibold">All In One Calculator</h2>
          <center><h5 className="text-md font-semibold">Made with ❤️ by kokodev</h5></center>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
