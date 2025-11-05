export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">Logo</div>
      <div className="space-x-6">
        <a href="/map" className="hover:text-blue-300 transition-colors duration-300">Map</a>
        <a href="/chat" className="hover:text-blue-300 transition-colors duration-300">Chatbot</a>
        <a href="/filter" className="hover:text-blue-300 transition-colors duration-300">Filter</a>
        <a href="/dashboard" className="hover:text-blue-300 transition-colors duration-300">Dashboard</a>
        <a href="/compare" className="hover:text-blue-300 transition-colors duration-300">Compare</a>
      </div>
    </nav>
  )
}
