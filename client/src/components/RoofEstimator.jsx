import { useEffect, useState } from 'react';

import { getConfig, createEstimate } from '../services/api';
const initialForm = {
  name: '',
  phone: '',
  email: '',
  answers: {},
};

const RoofEstimator = () => {
  const [config, setConfig] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [loadingConfig, setLoadingConfig] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoadingConfig(true);

        const response = await getConfig();

        setConfig(response.data);
      } catch (err) {
        setError(
          err.message || 'Unable to load estimator.'
        );
      } finally {
        setLoadingConfig(false);
      }
    };

    loadConfig();
  }, []);

  const updateAnswer = (key, value) => {
    setForm((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [key]: value,
      },
    }));

    setFieldErrors((current) => ({
      ...current,
      [key]: '',
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Name is required.';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Phone is required.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      errors.email = 'Enter a valid email address.';
    }

    config.questions.forEach((question) => {
      const value = form.answers[question.key];

      if (
        question.required &&
        (value === undefined ||
          value === null ||
          value === '')
      ) {
        errors[question.key] =
          'This field is required.';
      }

      if (
        question.type === 'number' &&
        value !== undefined &&
        value !== ''
      ) {
        const numberValue = Number(value);

        if (!Number.isFinite(numberValue)) {
          errors[question.key] =
            'Enter a valid number.';
        }

        if (
          question.min !== undefined &&
          numberValue < question.min
        ) {
          errors[question.key] =
            `Minimum is ${question.min}.`;
        }

        if (
          question.max !== undefined &&
          numberValue > question.max
        ) {
          errors[question.key] =
            `Maximum is ${question.max}.`;
        }
      }
    });

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setResult(null);

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await createEstimate({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        answers: form.answers,
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.message || 'Unable to calculate estimate.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading estimator...
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-700">
            Unable to load estimator
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error || 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-orange-600">
            {config.business.region}
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {config.business.name}
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Get a quick roofing estimate by answering a
            few questions about your home.
          </p>
        </div>

        {/* Estimate Result */}
        {result && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm font-medium text-green-700">
              Your estimated roofing range
            </p>

            <div className="mt-2 text-3xl font-bold text-slate-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: config.business.currency,
                maximumFractionDigits: 0,
              }).format(result.estimate_low)}
              {' – '}
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: config.business.currency,
                maximumFractionDigits: 0,
              }).format(result.estimate_high)}
            </div>

            <p className="mt-2 text-sm text-slate-600">
              Configuration version {result.config_version}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Project Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Roof details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell us a little about your roof.
              </p>
            </div>

            <div className="space-y-6">
              {config.questions.map((question) => (
                <div key={question.key}>
                  <label
                    htmlFor={question.key}
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    {question.label}

                    {question.required && (
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    )}
                  </label>

                  {question.type === 'number' && (
                    <div className="relative">
                      <input
                        id={question.key}
                        type="number"
                        min={question.min}
                        max={question.max}
                        value={
                          form.answers[
                            question.key
                          ] ?? ''
                        }
                        onChange={(event) =>
                          updateAnswer(
                            question.key,
                            event.target.value
                          )
                        }
                        placeholder={`Enter ${question.unit || 'value'}`}
                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                          fieldErrors[question.key]
                            ? 'border-red-400 focus:ring-red-100'
                            : 'border-slate-300 focus:border-orange-500 focus:ring-orange-100'
                        }`}
                      />

                      {question.unit && (
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          {question.unit}
                        </span>
                      )}
                    </div>
                  )}

                  {question.type === 'select' && (
                    <select
                      id={question.key}
                      value={
                        form.answers[
                          question.key
                        ] ?? ''
                      }
                      onChange={(event) =>
                        updateAnswer(
                          question.key,
                          event.target.value
                        )
                      }
                      className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
                        fieldErrors[question.key]
                          ? 'border-red-400 focus:ring-red-100'
                          : 'border-slate-300 focus:border-orange-500 focus:ring-orange-100'
                      }`}
                    >
                      <option value="">
                        Select an option
                      </option>

                      {question.options.map(
                        (option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  )}

                  {fieldErrors[question.key] && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors[question.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">
                Your contact information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                We'll use this to save your estimate.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Name *
                </label>

                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="John Doe"
                />

                {fieldErrors.name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Phone *
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="+1-614-555-0123"
                />

                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Email *
                </label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  placeholder="john@example.com"
                />

                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? 'Calculating...'
              : 'Get My Estimate'}
          </button>

          <p className="text-center text-xs text-slate-500">
            Estimates are based on the information you
            provide and are intended for planning purposes.
          </p>
        </form>
      </div>
    </main>
  );
};

export default RoofEstimator;