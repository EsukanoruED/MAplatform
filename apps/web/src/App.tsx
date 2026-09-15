import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { SiteLayout } from './layouts/SiteLayout';
import { PortalLayout } from './layouts/PortalLayout';
import { AdminLayout, RequireAdmin } from './layouts/AdminLayout';
import { HomeScreen } from './pages/site/HomeScreen';
import { ServicesScreen } from './pages/site/ServicesScreen';
import { RemoteSiteScreen } from './pages/site/RemoteSiteScreen';
import { ContactScreen } from './pages/site/ContactScreen';
import { LoginScreen } from './pages/portal/LoginScreen';
import { DashboardScreen } from './pages/portal/DashboardScreen';
import { WorkersScreen } from './pages/portal/WorkersScreen';
import { WorkerScreen } from './pages/portal/WorkerScreen';
import { CertificatesScreen } from './pages/portal/CertificatesScreen';
import { RequestsScreen } from './pages/portal/RequestsScreen';
import { RequestDetailScreen } from './pages/portal/RequestDetailScreen';
import { PlaceholderScreen } from './pages/portal/PlaceholderScreen';
import { AdminRequestsScreen } from './pages/admin/AdminRequestsScreen';
import { AdminRequestDetailScreen } from './pages/admin/AdminRequestDetailScreen';
import { NotFoundScreen } from './pages/NotFoundScreen';

/**
 * The route tree. This replaces both of the prototype's hand-rolled screen
 * switchers — the website kit's `useState('home')` and the portal kit's
 * `route`/`signedIn` state machine in index.html — with real URLs.
 *
 * /portal/login is intentionally outside RequireAuth. Everything else under
 * /portal sits behind it, and behind the API's own server-side checks.
 */
export function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/services" element={<ServicesScreen />} />
        <Route path="/remote-sites" element={<RemoteSiteScreen />} />
        <Route path="/contact" element={<ContactScreen />} />
      </Route>

      {/* Portal sign-in — unguarded by design */}
      <Route path="/portal/login" element={<LoginScreen />} />

      {/* Authenticated portal */}
      <Route element={<RequireAuth />}>
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<DashboardScreen />} />
          <Route path="workers" element={<WorkersScreen />} />
          <Route path="workers/:id" element={<WorkerScreen />} />
          <Route path="requests" element={<RequestsScreen />} />
          <Route path="requests/:id" element={<RequestDetailScreen />} />
          <Route path="certificates" element={<CertificatesScreen />} />
          <Route path="clinics" element={<PlaceholderScreen title="Site clinics" />} />
          <Route path="stock" element={<PlaceholderScreen title="Stock and equipment" />} />
          <Route path="settings" element={<PlaceholderScreen title="Settings" />} />
        </Route>
      </Route>

      {/* Medical Alliance staff console — a separate identity and guard */}
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/requests" replace />} />
          <Route path="requests" element={<AdminRequestsScreen />} />
          <Route path="requests/:id" element={<AdminRequestDetailScreen />} />
        </Route>
      </Route>

      {/* Legacy prototype entry points */}
      <Route path="/ui_kits/website/index.html" element={<Navigate to="/" replace />} />
      <Route path="/ui_kits/portal/index.html" element={<Navigate to="/portal" replace />} />

      <Route path="*" element={<NotFoundScreen />} />
    </Routes>
  );
}
