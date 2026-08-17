# Engineering Decisions

A concise record of the key assumptions, trade-offs, and decisions made for the Wantace Roof Estimator.

## 1. Configuration-Driven Pricing

The estimator questions, options, rates, and pricing modifiers are stored in MongoDB instead of being hardcoded in the frontend.

This was chosen because the brief requires an owner/admin to change business configuration without changing application code. The backend remains the source of truth for pricing.

## 2. Versioned Configuration

Every published configuration creates a new version, with only one version active at a time. Previous versions are retained.

Each lead stores the `config_version` used to calculate its estimate.

This ensures that a historical lead remains traceable to the pricing rules that were active when the estimate was generated.

## 3. Calculation Formula

The estimate is calculated server-side using the active configuration:

```text
Material Cost
= Roof Area × Material Rate × (1 + Waste Factor)

Tear-Off Cost
= Roof Area × Tear-Off Rate

Subtotal
= (Material Cost + Tear-Off Cost)
  × Pitch Multiplier × Stories Multiplier

Midpoint Estimate
= Subtotal + Permit Fee

Low Estimate
= Midpoint × (1 - Range Spread)

High Estimate
= Midpoint × (1 + Range Spread)
```

The calculator is kept in a dedicated backend service so pricing cannot be changed by manipulating frontend calculations.

## 4. Calculator-Required Questions

The calculator currently requires:

`roof_area`, `material`, `pitch`, `layers`, and `stories`.

An administrator cannot publish a configuration that removes or disables a question required by the calculator.

Additional non-pricing questions can be added without changing the calculator.

This prevents configuration changes from accidentally breaking the estimation flow.

## 5. Public vs Admin Access

Customers do not need an account to use the estimator or submit a lead.

Configuration management and lead/customer data require authenticated admin access.

This keeps the customer experience simple while protecting business configuration and customer information.

## 6. Historical Data

Historical configurations and leads are preserved rather than recalculated when pricing changes.

The supplied historical seed data was treated as historical business data, not as expected calculator outputs. Where historical records use older configuration structures, they are preserved rather than rewritten to fit the latest configuration.

## 7. What I Deliberately Did Not Build

Within the 24-hour scope, I did not build:

- Customer accounts
- Payments
- CRM integrations
- AI outbound voice calling
- Advanced role-based permissions

These were deliberately excluded because they were not necessary to demonstrate the core requirements: configuration management, versioning, estimation, lead capture, historical traceability, and admin security.

## 8. Questions I Would Ask Dale

Before a production build, I would clarify:

- Which pricing rules are authoritative if the seed data and business requirements conflict?
- Which questions are mandatory for every estimate, and which are informational only?
- Should admins be able to roll back an active configuration?
- Should historical leads display the exact question/option labels from their original configuration?
- What customer notification or CRM workflow should happen after lead submission?
- Are multiple admin roles required, or is one owner/admin role sufficient?

## 9. If I Had Another Week

I would add:

- Automated API/integration tests
- Stronger configuration validation
- Explicit configuration rollback
- A more complete audit trail
- Improved error handling and observability
- Additional production hardening

I would also improve the historical configuration UI so an admin can easily compare versions and inspect exactly what changed.

## Summary

The implementation prioritizes:

1. **Configuration-driven business rules**
2. **Versioning and historical traceability**
3. **Server-side pricing and validation**
4. **Secure and simple admin access**
