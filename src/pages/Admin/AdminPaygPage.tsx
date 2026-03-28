/**
 * Admin PAYG Pricing Settings Page
 * Route: /admin/payg-pricing  (or embedded in existing admin dashboard)
 *
 * Import and include <AdminPaygPricing /> in your existing admin panel page
 * OR route to this page directly.
 */
import React from 'react';
import { AdminPaygPricing } from '@/components/pricing/AdminPaygPricing';
import { Settings, ChevronRight } from 'lucide-react';

const AdminPaygPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <Settings className="w-3.5 h-3.5" />
          <span>Admin</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 dark:text-white">PAYG Pricing</span>
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pay-as-You-Go Pricing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure per-interview and per-resume prices for the flexible billing plan.
            Changes take effect immediately for all new PAYG subscriptions.
          </p>
        </div>

        <AdminPaygPricing />

        {/* Info card */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-5 text-sm text-slate-600 dark:text-slate-400 space-y-2">
          <p className="font-bold text-blue-700 dark:text-blue-400">How PAYG billing works</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Users set a monthly budget. The system divides it by your per-unit prices to derive limits.</li>
            <li>Each interview/resume consumed decrements the user&apos;s remaining count for the cycle.</li>
            <li>At the end of the month, usage resets and the budget auto-renews via Razorpay.</li>
            <li>If a user hits their limit before month-end, they are prompted to increase their budget.</li>
            <li>The <strong>Minimum Budget</strong> is the lowest monthly amount a user can commit to.</li>
            <li>The <strong>Maximum Budget</strong> caps the highest amount to prevent accidental overcommit.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPaygPage;
