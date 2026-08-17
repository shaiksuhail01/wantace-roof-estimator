import { useEffect, useState } from 'react';

import {
  getAdminConfig,
  updateAdminConfig,
} from '../../services/api';

const emptyOption = () => ({
  value: '',
  label: '',
  rate_per_sqft: '',
  multiplier: '',
  tear_off_per_sqft: '',
});

const emptyQuestion = (order) => ({
  key: '',
  label: '',
  type: 'select',
  unit: '',
  required: true,
  min: '',
  max: '',
  active: true,
  order,
  options: [emptyOption()],
});

const toNumberOrUndefined = (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : undefined;
};

const ConfigEditor = ({ onPublished }) => {
  const [config, setConfig] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getAdminConfig();

      const data = response.data;

      setConfig({
        config_version: data.config_version,
        business: {
          name: data.business?.name || '',
          region: data.business?.region || '',
          currency: data.business?.currency || 'USD',
        },
        questions: (data.questions || [])
          .sort((a, b) => a.order - b.order)
          .map((question, index) => ({
            key: question.key || '',
            label: question.label || '',
            type: question.type || 'select',
            unit: question.unit || '',
            required: question.required !== false,
            min: question.min ?? '',
            max: question.max ?? '',
            active: question.active !== false,
            order: index + 1,
            options:
              question.options?.length > 0
                ? question.options.map((option) => ({
                    value: option.value || '',
                    label: option.label || '',
                    rate_per_sqft:
                      option.rate_per_sqft ?? '',
                    multiplier:
                      option.multiplier ?? '',
                    tear_off_per_sqft:
                      option.tear_off_per_sqft ?? '',
                  }))
                : [],
          })),
        modifiers: {
          waste_factor:
            data.modifiers?.waste_factor ?? 0,
          permit_flat_fee:
            data.modifiers?.permit_flat_fee ?? 0,
          range_spread_pct:
            data.modifiers?.range_spread_pct ?? 0,
        },
      });
    } catch (err) {
      setError(
        err.message || 'Unable to load configuration.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const updateBusiness = (field, value) => {
    setConfig((current) => ({
      ...current,
      business: {
        ...current.business,
        [field]: value,
      },
    }));
  };

  const updateModifier = (field, value) => {
    setConfig((current) => ({
      ...current,
      modifiers: {
        ...current.modifiers,
        [field]: value,
      },
    }));
  };

  const updateQuestion = (
    questionIndex,
    field,
    value
  ) => {
    setConfig((current) => ({
      ...current,
      questions: current.questions.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,
                [field]: value,
              }
            : question
      ),
    }));
  };

  const updateOption = (
    questionIndex,
    optionIndex,
    field,
    value
  ) => {
    setConfig((current) => ({
      ...current,
      questions: current.questions.map(
        (question, qIndex) => {
          if (qIndex !== questionIndex) {
            return question;
          }

          return {
            ...question,
            options: question.options.map(
              (option, oIndex) =>
                oIndex === optionIndex
                  ? {
                      ...option,
                      [field]: value,
                    }
                  : option
            ),
          };
        }
      ),
    }));
  };

  const addQuestion = () => {
    setConfig((current) => ({
      ...current,
      questions: [
        ...current.questions,
        emptyQuestion(current.questions.length + 1),
      ],
    }));
  };

  const removeQuestion = (questionIndex) => {
    setConfig((current) => ({
      ...current,
      questions: current.questions
        .filter(
          (_, index) => index !== questionIndex
        )
        .map((question, index) => ({
          ...question,
          order: index + 1,
        })),
    }));
  };

  const addOption = (questionIndex) => {
    setConfig((current) => ({
      ...current,
      questions: current.questions.map(
        (question, index) =>
          index === questionIndex
            ? {
                ...question,
                options: [
                  ...question.options,
                  emptyOption(),
                ],
              }
            : question
      ),
    }));
  };

  const removeOption = (
    questionIndex,
    optionIndex
  ) => {
    setConfig((current) => ({
      ...current,
      questions: current.questions.map(
        (question, qIndex) =>
          qIndex === questionIndex
            ? {
                ...question,
                options: question.options.filter(
                  (_, index) => index !== optionIndex
                ),
              }
            : question
      ),
    }));
  };

  const validateConfig = () => {
    if (!config.business.name.trim()) {
      return 'Business name is required.';
    }

    if (!config.business.region.trim()) {
      return 'Business region is required.';
    }

    if (!config.business.currency.trim()) {
      return 'Currency is required.';
    }

    if (config.questions.length === 0) {
      return 'At least one question is required.';
    }

    for (
      let index = 0;
      index < config.questions.length;
      index += 1
    ) {
      const question = config.questions[index];

      if (!question.key.trim()) {
        return `Question ${index + 1}: key is required.`;
      }

      if (!question.label.trim()) {
        return `Question ${index + 1}: label is required.`;
      }

      if (
        question.type === 'number' &&
        question.min !== '' &&
        question.max !== '' &&
        Number(question.min) > Number(question.max)
      ) {
        return `Question ${index + 1}: minimum cannot exceed maximum.`;
      }

      if (
        question.type === 'select' &&
        question.options.length === 0
      ) {
        return `Question ${index + 1}: at least one option is required.`;
      }

      for (
        let optionIndex = 0;
        optionIndex < question.options.length;
        optionIndex += 1
      ) {
        const option =
          question.options[optionIndex];

        if (!option.value.trim()) {
          return `Question ${index + 1}, option ${
            optionIndex + 1
          }: value is required.`;
        }

        if (!option.label.trim()) {
          return `Question ${index + 1}, option ${
            optionIndex + 1
          }: label is required.`;
        }
      }
    }

    return null;
  };

  const handlePublish = async () => {
    setError('');
    setSuccess('');

    const validationError = validateConfig();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        business: {
          name: config.business.name.trim(),
          region: config.business.region.trim(),
          currency:
            config.business.currency.trim().toUpperCase(),
        },

        questions: config.questions.map(
          (question, index) => ({
            key: question.key.trim(),
            label: question.label.trim(),
            type: question.type,
            unit: question.unit?.trim() || undefined,
            required: question.required,
            min: toNumberOrUndefined(
              question.min
            ),
            max: toNumberOrUndefined(
              question.max
            ),
            active: question.active,
            order: index + 1,

            options:
              question.type === 'select'
                ? question.options.map(
                    (option) => ({
                      value: option.value.trim(),
                      label: option.label.trim(),
                      ...(option.rate_per_sqft !== ''
                        ? {
                            rate_per_sqft:
                              Number(
                                option.rate_per_sqft
                              ),
                          }
                        : {}),
                      ...(option.multiplier !== ''
                        ? {
                            multiplier:
                              Number(
                                option.multiplier
                              ),
                          }
                        : {}),
                      ...(option.tear_off_per_sqft !== ''
                        ? {
                            tear_off_per_sqft:
                              Number(
                                option.tear_off_per_sqft
                              ),
                          }
                        : {}),
                    })
                  )
                : [],
          })
        ),

        modifiers: {
          waste_factor: Number(
            config.modifiers.waste_factor
          ),
          permit_flat_fee: Number(
            config.modifiers.permit_flat_fee
          ),
          range_spread_pct: Number(
            config.modifiers.range_spread_pct
          ),
        },
      };

      const response =
        await updateAdminConfig(payload);

      setConfig((current) => ({
        ...current,
        config_version:
          response.data.config_version,
      }));

      setSuccess(
        response.message ||
          'Configuration published successfully.'
      );

      if (onPublished) {
        onPublished(response.data);
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to publish configuration.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-sm text-slate-500">
          Loading configuration...
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Unable to load configuration.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Configuration
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              v{config.config_version}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Changes are published as a new configuration
            version.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? 'Publishing...'
            : 'Publish New Version'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Business */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">
            Business Information
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Information displayed to customers.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Business Name
            </label>

            <input
              value={config.business.name}
              onChange={(event) =>
                updateBusiness(
                  'name',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Region
            </label>

            <input
              value={config.business.region}
              onChange={(event) =>
                updateBusiness(
                  'region',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Currency
            </label>

            <input
              value={config.business.currency}
              onChange={(event) =>
                updateBusiness(
                  'currency',
                  event.target.value
                )
              }
              maxLength={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Estimator Questions
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Manage the questions shown to customers.
            </p>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            + Add Question
          </button>
        </div>

        <div className="space-y-6">
          {config.questions.map(
            (question, questionIndex) => (
              <div
                key={`${question.key}-${questionIndex}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      Question {questionIndex + 1}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeQuestion(
                        questionIndex
                      )
                    }
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Key
                    </label>

                    <input
                      value={question.key}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'key',
                          event.target.value
                        )
                      }
                      placeholder="roof_area"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Type
                    </label>

                    <select
                      value={question.type}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'type',
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="number">
                        Number
                      </option>

                      <option value="select">
                        Select
                      </option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Question Label
                    </label>

                    <input
                      value={question.label}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'label',
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Unit
                    </label>

                    <input
                      value={question.unit}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'unit',
                          event.target.value
                        )
                      }
                      placeholder="sq ft"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {question.type === 'number' && (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Minimum
                        </label>

                        <input
                          type="number"
                          value={question.min}
                          onChange={(event) =>
                            updateQuestion(
                              questionIndex,
                              'min',
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          Maximum
                        </label>

                        <input
                          type="number"
                          value={question.max}
                          onChange={(event) =>
                            updateQuestion(
                              questionIndex,
                              'max',
                              event.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'required',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Required
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={question.active}
                      onChange={(event) =>
                        updateQuestion(
                          questionIndex,
                          'active',
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Active
                  </label>
                </div>

                {/* Options */}
                {question.type === 'select' && (
                  <div className="mt-6 border-t border-slate-200 pt-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Options
                        </h4>

                        <p className="mt-1 text-xs text-slate-500">
                          Pricing fields are optional depending
                          on the question.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addOption(questionIndex)
                        }
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        + Add Option
                      </button>
                    </div>

                    <div className="space-y-4">
                      {question.options.map(
                        (option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="rounded-lg border border-slate-200 bg-white p-4"
                          >
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                  Value
                                </label>

                                <input
                                  value={option.value}
                                  onChange={(event) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      'value',
                                      event.target.value
                                    )
                                  }
                                  placeholder="asphalt_arch"
                                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                  Label
                                </label>

                                <input
                                  value={option.label}
                                  onChange={(event) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      'label',
                                      event.target.value
                                    )
                                  }
                                  placeholder="Architectural"
                                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                  Rate / sqft
                                </label>

                                <input
                                  type="number"
                                  step="0.01"
                                  value={
                                    option.rate_per_sqft
                                  }
                                  onChange={(event) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      'rate_per_sqft',
                                      event.target.value
                                    )
                                  }
                                  placeholder="5.90"
                                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                  Multiplier
                                </label>

                                <input
                                  type="number"
                                  step="0.01"
                                  value={
                                    option.multiplier
                                  }
                                  onChange={(event) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      'multiplier',
                                      event.target.value
                                    )
                                  }
                                  placeholder="1.12"
                                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-orange-500"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                                  Tear-off / sqft
                                </label>

                                <input
                                  type="number"
                                  step="0.01"
                                  value={
                                    option.tear_off_per_sqft
                                  }
                                  onChange={(event) =>
                                    updateOption(
                                      questionIndex,
                                      optionIndex,
                                      'tear_off_per_sqft',
                                      event.target.value
                                    )
                                  }
                                  placeholder="1.15"
                                  className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm outline-none focus:border-orange-500"
                                />
                              </div>
                            </div>

                            <div className="mt-3 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(
                                    questionIndex,
                                    optionIndex
                                  )
                                }
                                className="text-xs font-medium text-red-600 hover:text-red-700"
                              >
                                Remove option
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </section>

      {/* Modifiers */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-base font-semibold text-slate-900">
            Pricing Modifiers
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Global values used by the estimate calculator.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Waste Factor
            </label>

            <input
              type="number"
              step="0.01"
              value={
                config.modifiers.waste_factor
              }
              onChange={(event) =>
                updateModifier(
                  'waste_factor',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Example: 0.10 = 10%
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Permit Flat Fee
            </label>

            <input
              type="number"
              step="1"
              value={
                config.modifiers.permit_flat_fee
              }
              onChange={(event) =>
                updateModifier(
                  'permit_flat_fee',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Flat amount added to the estimate.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Range Spread %
            </label>

            <input
              type="number"
              step="1"
              value={
                config.modifiers.range_spread_pct
              }
              onChange={(event) =>
                updateModifier(
                  'range_spread_pct',
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-1.5 text-xs text-slate-500">
              Controls the low/high estimate range.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom publish */}
      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={handlePublish}
          disabled={saving}
          className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? 'Publishing...'
            : `Publish Configuration v${
                config.config_version + 1
              }`}
        </button>
      </div>
    </div>
  );
};

export default ConfigEditor;