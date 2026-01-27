import ThemeToggle from "../ui/ThemeToggle.tsx"

export default function Navbar() {
  return (
    <header className="navbar-float h-16 flex items-center">
      <div className="container flex items-center justify-between">
        <h2 className="text-lg font-semibold">All In One Calculator</h2>
        <ThemeToggle />
      </div>
    </header>
  )
}
