import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LeftSidebar from "./components/LeftSideBar";
import RightSidebar from "./components/Rightsidebar";
import { ClerkProvider } from "@clerk/nextjs";
import SocketProvider from "./providers/SocketProvider";

export default function RootLayout({ children }) {
  return (
      <ClerkProvider>
        <SocketProvider>
    <html lang="en">
      <body className="bg-slate-50 text-slate-800">
        <Navbar />

        <div className="flex min-h-screen">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>

        <Footer />
      </body>
    </html>
    </SocketProvider>
      </ClerkProvider>
  );
}
