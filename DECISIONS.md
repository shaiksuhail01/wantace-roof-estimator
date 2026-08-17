# Engineering Decisions

A concise record of the key architectural and product decisions made
for the Wantace Roof Estimator.

## 1. Configuration-Driven Pricing

Pricing rules and estimator questions are stored in MongoDB rather than
hardcoded in the frontend.

**Why:** Admins can update business rules without code changes and redeployments.

---

## 2. Versioned Configuration

Every published configuration creates a new version. Only one version
is active at a time; previous versions are retained.

**Why:** Pricing changes must not overwrite historical business rules.

---

## 3. Leads Store the Configuration Version

Each lead stores the `config_version` used to generate its estimate,
along with the customer's submitted answers and calculated range.

**Why:** An old lead must remain traceable to the pricing rules used
when it was created.

---

## 4. Server-Side Calculation

The estimate is calculated in the backend using the active
configuration.

**Why:** Pricing logic should be trusted and cannot depend solely on
client-side calculations.

---

## 5. Centralized Calculator Service

Pricing logic lives in a dedicated `calculator.js` service rather than
inside the controller or frontend.

**Why:** Keeps business logic reusable, testable, and separate from
HTTP concerns.

---

## 6. Calculator-Required Questions

The current calculator requires:

`roof_area`, `material`, `pitch`, `layers`, and `stories`.

The backend prevents an admin from publishing a configuration where any
of these questions is missing, inactive, or optional.

**Why:** Prevents an admin configuration from breaking the pricing
engine.

---

## 7. Public vs Admin Access

Customers can access the estimator and public configuration without
authentication. Lead management and configuration management require
admin authentication.

**Why:** Keeps the customer experience frictionless while protecting
customer data and business controls.

---

## 8. Historical Data Is Preserved

Historical leads and configurations are not recalculated or overwritten
when pricing changes.

**Why:** A historical estimate should represent what the customer
actually received at that time.

---

## 9. Flexible Additional Questions

Admins can add non-pricing questions, such as `gutter_replace`, without
changing the calculator.

**Why:** The business can collect additional customer information
without coupling every question to the pricing formula.

---

## 10. Backend Validation

Important validation is performed on the backend even when the frontend
also validates the input.

**Why:** Frontend validation improves UX, while backend validation
protects the application from invalid or manipulated requests.

---

## Summary

The system is designed around three principles:

1. **Configuration-driven** — business pricing can change without code changes.
2. **Versioned and traceable** — every lead remains tied to the rules used for its estimate.
3. **Secure and server-controlled** — pricing and administrative operations are protected by the backend.