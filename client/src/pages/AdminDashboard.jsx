import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LeadDetails from '../components/admin/LeadDetails';

import {
  getAdminConfig,
  getLeads,
  logoutAdmin,
} from '../services/api';

import ConfigEditor from '../components/admin/ConfigEditor';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [config, setConfig] = useState(null);
  const [selectedLeadId, setSelectedLeadId] =
  useState(null);
  const [leads, setLeads] = useState([]);

  const [activeSection, setActiveSection] =
    useState('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [
        configResponse,
        leadsResponse,
      ] = await Promise.all([
        getAdminConfig(),
        getLeads(),
      ]);

      setConfig(configResponse.data);
      setLeads(leadsResponse.data);
    } catch (err) {
      setError(
        err.message ||
          'Unable to load dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } finally {
      navigate('/admin/login');
    }
  };

  const handlePublished = async () => {
    await loadDashboard();

    setActiveSection('configuration');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              Northline Roofing
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        {/* Sidebar */}
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="space-y-1">
            <button
              onClick={() =>
                setActiveSection('overview')
              }
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                activeSection === 'overview'
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() =>
                setActiveSection('configuration')
              }
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                activeSection === 'configuration'
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Configuration
            </button>

            <button
              onClick={() =>
                setActiveSection('leads')
              }
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                activeSection === 'leads'
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Leads
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {activeSection === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your roof estimator and customer
                  leads.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Active Configuration
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    v{config?.config_version}
                  </p>

                  <span className="mt-2 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Active
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Total Leads
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {leads.length}
                  </p>

                  <button
                    onClick={() =>
                      setActiveSection('leads')
                    }
                    className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View leads →
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Permit Fee
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    $
                    {config?.modifiers?.permit_flat_fee?.toLocaleString()}
                  </p>

                  <button
                    onClick={() =>
                      setActiveSection(
                        'configuration'
                      )
                    }
                    className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Edit configuration →
                  </button>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Recent Leads
                </h3>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-3">
                          Lead
                        </th>
                        <th className="px-3 py-3">
                          Config
                        </th>
                        <th className="px-3 py-3">
                          Estimate
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {leads
                        .slice(0, 5)
                        .map((lead) => (
                          <tr
                            key={lead.lead_id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-3 py-4">
                              <p className="font-medium text-slate-900">
                                {lead.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {lead.email}
                              </p>
                            </td>

                            <td className="px-3 py-4 text-slate-600">
                              v{lead.config_version}
                            </td>

                            <td className="px-3 py-4 font-medium text-slate-900">
                              $
                              {lead.estimate_low.toLocaleString()}
                              {' – '}
                              $
                              {lead.estimate_high.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'configuration' && (
            <ConfigEditor
              onPublished={handlePublished}
            />
          )}
{activeSection === 'leads' && (
  <>
    {selectedLeadId ? (
      <LeadDetails
        leadId={selectedLeadId}
        onBack={() => setSelectedLeadId(null)}
      />
    ) : (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Leads
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customer submissions, estimates, and
            historical configuration versions.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Customer
                  </th>

                  <th className="px-5 py-3">
                    Contact
                  </th>

                  <th className="px-5 py-3">
                    Config
                  </th>

                  <th className="px-5 py-3">
                    Estimate
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>

                  <th className="px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {lead.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {lead.lead_id}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-slate-700">
                        {lead.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {lead.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        v{lead.config_version}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      $
                      {lead.estimate_low.toLocaleString()}
                      {' – '}
                      $
                      {lead.estimate_high.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {new Date(
                        lead.captured_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLeadId(
                            lead.lead_id
                          )
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No leads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </>
)}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;