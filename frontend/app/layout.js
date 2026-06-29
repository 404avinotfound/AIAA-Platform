import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "../lib/AuthContext";

export const metadata = {
  title: "All India Advocates Associations (AIAA)",
  description:
    "A Pan-India platform for the welfare, professional growth, networking, and empowerment of advocates across the nation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
