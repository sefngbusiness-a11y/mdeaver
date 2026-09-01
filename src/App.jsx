import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

import { DonationProvider } from "./context/DonationContext";
import DonationModal from "./components/DonationModal";
import { useVisitTracker } from "./hooks/useVisitTracker";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Impact from "./pages/Impact";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";
import LiveChat from "./pages/LiveChat";

import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminDonations from "./admin/pages/AdminDonations";
import AdminContacts from "./admin/pages/AdminContacts";
import AdminVisits from "./admin/pages/AdminVisits";
import AdminAuditLogs from "./admin/pages/AdminAuditLogs";
import AdminSettings from "./admin/pages/AdminSettings";
import AdminLogin from "./admin/pages/AdminLogin";

function ScrollAndAOSRefresh() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => AOS.refreshHard(), 150);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  return null;
}

function MainWebsiteLayout() {
  useVisitTracker();
  useEffect(() => {
    AOS.init({ duration: 750, easing: "ease-out-cubic", once: false, offset: 50 });
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
      <DonationModal />
    </>
  );
}

function App() {
  return (
    <DonationProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <ScrollAndAOSRefresh />
          <Routes>
            {/* ── Donor Live Chat Route ───────────────────── */}
            <Route path="/chat" element={<LiveChat />} />

            {/* ── Admin Portal ─────────────────────────────── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="visits" element={<AdminVisits />} />
              <Route path="logs" element={<AdminAuditLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* ── Public Donor Website ─────────────────────── */}
            <Route path="*" element={<MainWebsiteLayout />} />
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </DonationProvider>
  );
}

export default App;
