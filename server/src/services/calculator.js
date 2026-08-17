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
  const question = getRequiredQuestion(
    config,
    questionKey
  );

  const option = findOption(question, value);

  if (!option) {
    throw new Error(
      `Invalid value "${value}" for question "${questionKey}".`
    );
  }

  return option;
};

const validateRoofArea = (config, value) => {
  const question = getRequiredQuestion(
    config,
    'roof_area'
  );

  const roofArea = Number(value);

  if (!Number.isFinite(roofArea)) {
    throw new Error(
      'Roof area must be a valid number.'
    );
  }

  if (
    roofArea < question.min ||
    roofArea > question.max
  ) {
    throw new Error(
      `Roof area must be between ${question.min} and ${question.max} sq ft.`
    );
  }

  return roofArea;
};

export const calculateEstimate = (
  config,
  answers
) => {
  if (!config) {
    throw new Error(
      'Configuration is required.'
    );
  }

  if (!answers) {
    throw new Error(
      'Answers are required.'
    );
  }

  // ----------------------------------------
  // Validate required answers
  // ----------------------------------------

  const roofArea = validateRoofArea(
    config,
    answers.roof_area
  );

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

  // ----------------------------------------
  // Pricing configuration
  // ----------------------------------------

  const {
    waste_factor,
    permit_flat_fee,
    range_spread_pct,
  } = config.modifiers;

  if (
    waste_factor === undefined ||
    permit_flat_fee === undefined ||
    range_spread_pct === undefined
  ) {
    throw new Error(
      'Incomplete pricing configuration.'
    );
  }

  // ----------------------------------------
  // Normalize numeric values
  // ----------------------------------------

  const ratePerSqft = Number(
    material.rate_per_sqft
  );

  const pitchMultiplier = Number(
    pitch.multiplier
  );

  const tearOffPerSqft = Number(
    layers.tear_off_per_sqft ?? 0
  );

  const storiesMultiplier = Number(
    stories.multiplier
  );

  const wasteFactor = Number(
    waste_factor
  );

  const permitFee = Number(
    permit_flat_fee
  );

  const spreadPct =
    Number(range_spread_pct) / 100;

  // ----------------------------------------
  // Validate pricing values
  // ----------------------------------------

  if (!Number.isFinite(ratePerSqft)) {
    throw new Error(
      'Invalid material rate configuration.'
    );
  }

  if (!Number.isFinite(pitchMultiplier)) {
    throw new Error(
      'Invalid pitch multiplier configuration.'
    );
  }

  if (!Number.isFinite(tearOffPerSqft)) {
    throw new Error(
      'Invalid tear-off rate configuration.'
    );
  }

  if (!Number.isFinite(storiesMultiplier)) {
    throw new Error(
      'Invalid stories multiplier configuration.'
    );
  }

  if (!Number.isFinite(wasteFactor)) {
    throw new Error(
      'Invalid waste factor configuration.'
    );
  }

  if (!Number.isFinite(permitFee)) {
    throw new Error(
      'Invalid permit fee configuration.'
    );
  }

  if (!Number.isFinite(spreadPct)) {
    throw new Error(
      'Invalid range spread configuration.'
    );
  }

  // ----------------------------------------
  // Wantace Pricing Formula
  // ----------------------------------------

  // 1. Base Material Cost
  //
  // A × Rm × (1 + W)
  const baseMaterialCost =
    roofArea *
    ratePerSqft *
    (1 + wasteFactor);

  // 2. Tear-Off Cost
  //
  // A × Rt
  const tearOffCost =
    roofArea *
    tearOffPerSqft;

  // 3. Adjusted Subtotal
  //
  // (Base Material Cost + Tear-Off Cost)
  // × Mp × Ms
  const adjustedSubtotal =
    (baseMaterialCost + tearOffCost) *
    pitchMultiplier *
    storiesMultiplier;

  // 4. Total Base Estimate
  //
  // Adjusted Subtotal + Permit Fee
  const midPointEstimate =
    adjustedSubtotal +
    permitFee;

  // 5. Estimate Range
  //
  // Low  = E_mid × (1 - Spread)
  // High = E_mid × (1 + Spread)
  const estimateLow =
    midPointEstimate *
    (1 - spreadPct);

  const estimateHigh =
    midPointEstimate *
    (1 + spreadPct);

  return {
    estimate_low:
      roundCurrency(estimateLow),

    estimate_high:
      roundCurrency(estimateHigh),
  };
};