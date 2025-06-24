import "./globals.css";

export const metadata = {
  title: "Bar Team App",
  description: "Bar Checklist & Schedule App for Team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        {/* NAVBAR */}
        <nav className="w-full bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex space-x-6">
            <a href="/" className="hover:underline text-lg">Home</a>
            <a href="/schedule" className="hover:underline text-lg">My Shifts</a>
            <a href="/checklists" className="hover:underline text-lg">Checklists</a>
            <a href="/upload-schedule" className="hover:underline text-lg">Upload Schedule</a>
          </div>
        </nav>

        {/* MAIN CONTENT */}
        <main className="p-6 max-w-4xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
