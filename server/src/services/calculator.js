const findQuestion = (config, key) => {
  return config.questions.find(
    (question) => question.key === key && question.active
  );
};

const findOption = (question, value) => {
  if (!question || !question.options) {
    return null;
  }

  return question.options.find(
    (option) => option.value === value
  );
};

const roundCurrency = (value) => {
  return Math.round(value);
};

const getRequiredQuestion = (config, key) => {
  const question = findQuestion(config, key);

  if (!question) {
    throw new Error(
      `Required configuration question "${key}" is not active.`
    );
  }

  return question;
};

const getSelectedOption = (config, questionKey, value) => {
  const question = getRequiredQuestion(config, questionKey);

  const option = findOption(question, value);

  if (!option) {
    throw new Error(
      `Invalid value "${value}" for question "${questionKey}".`
    );
  }

  return option;
};

const validateRoofArea = (config, value) => {
  const question = getRequiredQuestion(config, 'roof_area');

  const roofArea = Number(value);

  if (!Number.isFinite(roofArea)) {
    throw new Error('Roof area must be a valid number.');
  }

  if (roofArea < question.min || roofArea > question.max) {
    throw new Error(
      `Roof area must be between ${question.min} and ${question.max} sq ft.`
    );
  }

  return roofArea;
};

export const calculateEstimate = (config, answers) => {
  if (!config) {
    throw new Error('Configuration is required.');
  }

  if (!answers) {
    throw new Error('Answers are required.');
  }

  // Base square footage
  const roofArea = validateRoofArea(
    config,
    answers.roof_area
  );

  // Selected configuration options
  const material = getSelectedOption(
    config,
    'material',
    answers.material
  );

  const pitch = getSelectedOption(
    config,
    'pitch',
    answers.pitch
  );

  const layers = getSelectedOption(
    config,
    'layers',
    answers.layers
  );

  const stories = getSelectedOption(
    config,
    'stories',
    answers.stories
  );

  // Global pricing modifiers
  const {
    waste_factor,
    permit_flat_fee,
    range_spread_pct,
  } = config.modifiers;

  // Safely normalize numeric values
  const ratePerSqft = Number(
    material.rate_per_sqft || 0
  );

  const pitchMultiplier = Number(
    pitch.multiplier || 1
  );

  const tearOffPerSqft = Number(
    layers.tear_off_per_sqft || 0
  );

  const storiesMultiplier = Number(
    stories.multiplier || 1
  );

  const wasteFactor = Number(
    waste_factor ?? 0.10
  );

  const permitFee = Number(
    permit_flat_fee ?? 350
  );

  const spreadPct =
    Number(range_spread_pct ?? 12) / 100;

  // ----------------------------------------
  // Wantace Pricing Formula
  // ----------------------------------------

  // Base Material Cost
  const baseMaterialCost =
    roofArea *
    ratePerSqft *
    (1 + wasteFactor);

  // Tear-Off Cost
  const tearOffCost =
    roofArea *
    tearOffPerSqft;

  // Apply pitch and stories multipliers
  const subtotal =
    (baseMaterialCost + tearOffCost) *
    pitchMultiplier *
    storiesMultiplier;

  // Add permit AFTER multipliers
  const midPointEstimate =
    subtotal +
    permitFee;

  // Calculate estimate range
  const estimateLow =
    midPointEstimate *
    (1 - spreadPct);

  const estimateHigh =
    midPointEstimate *
    (1 + spreadPct);

  return {
    estimate_low: roundCurrency(estimateLow),
    estimate_high: roundCurrency(estimateHigh),
  };
};