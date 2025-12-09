export default function Topbar({ type }) {
    return (
      <header className="fixed top-0 left-64 right-0 h-16 bg-white shadow flex items-center px-6 justify-between">
        <h1 className="text-xl font-semibold">
          {type === "admin" ? "Admin Dashboard" : "User Dashboard"}
        </h1>
  
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Hello, User</span>
          <button className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark">
            Logout
          </button>
        </div>
      </header>
    );
  }
  