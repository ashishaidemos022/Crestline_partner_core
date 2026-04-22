import { Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { BookOverview } from './pages/BookOverview'
import { CustomerList } from './pages/CustomerList'
import { Customer360 } from './pages/Customer360'
import { PolicyCenter } from './pages/PolicyCenter'
import { ClaimCenter } from './pages/ClaimCenter'
import { BillingCenter } from './pages/BillingCenter'
import { Quotes } from './pages/Quotes'
import { AuthActivity } from './pages/AuthActivity'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<BookOverview />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<Customer360 />} />
        <Route path="/policies" element={<PolicyCenter />} />
        <Route path="/claims" element={<ClaimCenter />} />
        <Route path="/billing" element={<BillingCenter />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/activity" element={<AuthActivity />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
