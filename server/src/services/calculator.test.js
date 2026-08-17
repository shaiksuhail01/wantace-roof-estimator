import assert from 'node:assert/strict';
import dotenv from 'dotenv';

import connectDB from '../config/db.js';
import { Config } from '../models/Config.js';
import { calculateEstimate } from './calculator.js';

dotenv.config();

const runTests = async () => {
  try {
    await connectDB();

    const config = await Config.findOne({
      config_version: 3,
    }).lean();

    assert.ok(config, 'Version 3 configuration should exist');

    // ----------------------------------------
    // Test 1: Ana-style valid calculation
    // ----------------------------------------

    const anaAnswers = {
      roof_area: 2100,
      material: 'asphalt_arch',
      pitch: 'medium',
      layers: '1',
      stories: '2',
    };

    const anaResult = calculateEstimate(
      config,
      anaAnswers
    );

    assert.equal(
      anaResult.estimate_low,
      17386
    );

    assert.equal(
      anaResult.estimate_high,
      22128
    );

    console.log('✓ Test 1 passed: valid estimate');


    // ----------------------------------------
    // Test 2: Minimum roof area
    // ----------------------------------------

    const minimumAreaResult = calculateEstimate(
      config,
      {
        roof_area: 300,
        material: 'asphalt_3tab',
        pitch: 'low',
        layers: '0',
        stories: '1',
      }
    );

    assert.ok(
      minimumAreaResult.estimate_low > 0
    );

    assert.ok(
      minimumAreaResult.estimate_high >
      minimumAreaResult.estimate_low
    );

    console.log(
      '✓ Test 2 passed: minimum roof area'
    );


    // ----------------------------------------
    // Test 3: Maximum roof area
    // ----------------------------------------

    const maximumAreaResult = calculateEstimate(
      config,
      {
        roof_area: 12000,
        material: 'cedar_shake',
        pitch: 'steep',
        layers: '2',
        stories: '3',
      }
    );

    assert.ok(
      maximumAreaResult.estimate_low > 0
    );

    assert.ok(
      maximumAreaResult.estimate_high >
      maximumAreaResult.estimate_low
    );

    console.log(
      '✓ Test 3 passed: maximum roof area'
    );


    // ----------------------------------------
    // Test 4: Roof area below minimum
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 299,
            material: 'asphalt_arch',
            pitch: 'medium',
            layers: '1',
            stories: '2',
          }
        ),
      /Roof area must be between/
    );

    console.log(
      '✓ Test 4 passed: rejects roof area below minimum'
    );


    // ----------------------------------------
    // Test 5: Roof area above maximum
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 12001,
            material: 'asphalt_arch',
            pitch: 'medium',
            layers: '1',
            stories: '2',
          }
        ),
      /Roof area must be between/
    );

    console.log(
      '✓ Test 5 passed: rejects roof area above maximum'
    );


    // ----------------------------------------
    // Test 6: Invalid material
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 2100,
            material: 'invalid_material',
            pitch: 'medium',
            layers: '1',
            stories: '2',
          }
        ),
      /Invalid value/
    );

    console.log(
      '✓ Test 6 passed: rejects invalid material'
    );


    // ----------------------------------------
    // Test 7: Invalid pitch
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 2100,
            material: 'asphalt_arch',
            pitch: 'invalid_pitch',
            layers: '1',
            stories: '2',
          }
        ),
      /Invalid value/
    );

    console.log(
      '✓ Test 7 passed: rejects invalid pitch'
    );


    // ----------------------------------------
    // Test 8: Invalid layers
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 2100,
            material: 'asphalt_arch',
            pitch: 'medium',
            layers: 'invalid_layers',
            stories: '2',
          }
        ),
      /Invalid value/
    );

    console.log(
      '✓ Test 8 passed: rejects invalid layers'
    );


    // ----------------------------------------
    // Test 9: Invalid stories
    // ----------------------------------------

    assert.throws(
      () =>
        calculateEstimate(
          config,
          {
            roof_area: 2100,
            material: 'asphalt_arch',
            pitch: 'medium',
            layers: '1',
            stories: 'invalid_stories',
          }
        ),
      /Invalid value/
    );

    console.log(
      '✓ Test 9 passed: rejects invalid stories'
    );


    console.log('\nAll calculator tests passed successfully.');

  } catch (error) {
    console.error('\nCalculator tests failed.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
};

runTests();