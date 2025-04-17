export default function LogoutPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Logout API</h1>
        <p className="mb-4">
          This is the logout API endpoint. It should be accessed via a POST request to clear your session.
        </p>
        <p className="text-sm text-gray-500">To log out properly, use the logout button in the dashboard.</p>
      </div>
    </div>
  )
}
