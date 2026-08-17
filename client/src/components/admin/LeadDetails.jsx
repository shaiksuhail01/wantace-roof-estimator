import { useEffect, useState } from 'react';

import { getLeadById } from '../../services/api';

const formatCurrency = (value) => {
  return `$${Number(value).toLocaleString()}`;
};

const formatDate = (value) => {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
};

const getOptionPricing = (option) => {
  const values = [];

  if (option.rate_per_sqft !== undefined) {
    values.push(
      `${formatCurrency(option.rate_per_sqft)} / sqft`
    );
  }

  if (option.multiplier !== undefined) {
    values.push(`${option.multiplier}x`);
  }

  if (option.tear_off_per_sqft !== undefined) {
    values.push(
      `${formatCurrency(option.tear_off_per_sqft)} / sqft`
    );
  }

  return values.join(' • ');
};

const LeadDetails = ({
  leadId,
  onBack,
}) => {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLead = async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await getLeadById(leadId);

        setData(response.data);
      } catch (err) {
        setError(
          err.message ||
            'Unable to load lead details.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [leadId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Loading lead details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          ← Back to Leads
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { lead, configuration } = data;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="text-sm font-medium text-orange-600 hover:text-orange-700"
      >
        ← Back to Leads
      </button>

      {/* Lead header */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">
                {lead.name}
              </h2>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {lead.lead_id}
              </span>
            </div>

            <div className="mt-4 space-y-1 text-sm text-slate-600">
              <p>{lead.email}</p>
              <p>{lead.phone}</p>
              <p>
                Captured: {formatDate(lead.captured_at)}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-orange-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
              Estimate
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(
                lead.estimate_low
              )}
              {' – '}
              {formatCurrency(
                lead.estimate_high
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Configuration reference */}
      <section className="rounded-xl border border-orange-200 bg-orange-50 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
              Configuration Used
            </p>

            <h3 className="mt-1 text-xl font-bold text-slate-900">
              Version {configuration.config_version}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              This is the exact configuration version used
              to calculate this lead's estimate.
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              configuration.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {configuration.is_active
              ? 'Currently Active'
              : 'Historical Version'}
          </span>
        </div>
      </section>

      {/* Customer answers */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Customer Answers
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Answers submitted for this estimate.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {configuration.questions.map(
            (question) => {
              const answer =
                lead.answers?.[question.key];

              const selectedOption =
                question.options?.find(
                  (option) =>
                    option.value === answer
                );

              return (
                <div
                  key={question.key}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {question.label}
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedOption
                      ? selectedOption.label
                      : answer !== undefined
                      ? String(answer)
                      : '—'}
                  </p>

                  {question.unit &&
                    answer !== undefined && (
                      <p className="mt-1 text-xs text-slate-500">
                        {question.unit}
                      </p>
                    )}
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* Historical configuration */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Configuration Snapshot
            </h3>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              v{configuration.config_version}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Historical configuration used when this estimate
            was generated.
          </p>
        </div>

        {/* Business */}
        <div className="border-b border-slate-200 pb-6">
          <h4 className="text-sm font-semibold text-slate-900">
            Business
          </h4>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">
                Name
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {configuration.business.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Region
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {configuration.business.region}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Currency
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {configuration.business.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="pt-6">
          <h4 className="text-sm font-semibold text-slate-900">
            Questions & Options
          </h4>

          <div className="mt-5 space-y-5">
            {configuration.questions.map(
              (question, index) => (
                <div
                  key={question.key}
                  className="rounded-xl border border-slate-200"
                >
                  <div className="border-b border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                          Question {index + 1}
                        </p>

                        <h5 className="mt-1 font-semibold text-slate-900">
                          {question.label}
                        </h5>
                      </div>

                      <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                        {question.type}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>
                        Key: {question.key}
                      </span>

                      {question.unit && (
                        <span>
                          • Unit: {question.unit}
                        </span>
                      )}

                      {question.min !== undefined &&
                        question.min !== null && (
                          <span>
                            • Min: {question.min}
                          </span>
                        )}

                      {question.max !== undefined &&
                        question.max !== null && (
                          <span>
                            • Max: {question.max}
                          </span>
                        )}
                    </div>
                  </div>

                  {question.options?.length > 0 && (
                    <div className="divide-y divide-slate-100">
                      {question.options.map(
                        (option) => (
                          <div
                            key={option.value}
                            className="flex flex-col justify-between gap-2 p-4 md:flex-row md:items-center"
                          >
                            <div>
                              <p className="font-medium text-slate-900">
                                {option.label}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Value: {option.value}
                              </p>
                            </div>

                            {getOptionPricing(
                              option
                            ) && (
                              <span className="text-sm font-medium text-slate-700">
                                {getOptionPricing(
                                  option
                                )}
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Modifiers */}
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h4 className="text-sm font-semibold text-slate-900">
            Pricing Modifiers
          </h4>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Waste Factor
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {configuration.modifiers.waste_factor *
                  100}
                %
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Permit Fee
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formatCurrency(
                  configuration.modifiers
                    .permit_flat_fee
                )}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Range Spread
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {
                  configuration.modifiers
                    .range_spread_pct
                }
                %
              </p>
            </div>
          </div>
        </div>

        {/* Version metadata */}
        <div className="mt-6 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <p>
            Configuration created:{' '}
            {formatDate(
              configuration.createdAt
            )}
          </p>

          <p className="mt-1">
            Last updated:{' '}
            {formatDate(
              configuration.updatedAt
            )}
          </p>
        </div>
      </section>
    </div>
  );
};

export default LeadDetails;