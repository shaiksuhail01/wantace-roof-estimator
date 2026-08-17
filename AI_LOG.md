# AI Development Log

## Tools Used

- ChatGPT, Anti-Gravity, Claude — planning, debugging, implementation guidance, Authentication, test-case
  planning, documentation, and UX review.

AI tools were used as development assistance throughout the project.
The final implementation, architectural decisions, testing, and
verification were reviewed and validated manually.

## 1. Planning & Architecture

**AI assistance:** Used to break down the brief into the public
estimator, authenticated owner panel, REST API, configuration model,
lead management, and calculation layer.

**My decision:** Kept the architecture simple around one backend API
and MongoDB as the single source of truth.

---

## 2. Configuration-Driven Design

**AI assistance:** Used to reason about storing questions, options,
rates, modifiers, and active states in MongoDB.

**My decision:** Configuration is fetched at runtime rather than
hardcoded in the frontend, allowing owner changes without a frontend
redeployment.

**Verification:** Added/edited questions and pricing through the owner
panel and verified that the public estimator reflected the new active
configuration.

---

## 3. Pricing Calculator

**AI assistance:** Used to review the calculation structure and edge
cases.

**My decision:** Kept the pricing calculation in a dedicated backend
service rather than placing it in the frontend or controller.

**Verification:** Tested minimum and maximum roof areas, different
materials, pitch values, roofing layers, stories, and invalid inputs.

The historical seed estimates were not treated as expected outputs
because the assignment explicitly states that they are historical
figures and the implementation may define its own calculation. 

---

## 4. Configuration Versioning

**AI assistance:** Used to evaluate how configuration changes could
affect existing leads.

**My decision:** Each published configuration creates a new version,
while previous configurations remain stored.

Leads store the configuration version used to calculate their estimate.

**Verification:** Published multiple configurations and confirmed that
the new version became active while previous versions remained
available in MongoDB.

---

## 5. Configuration Safety

**AI assistance:** Used to identify risks when an administrator
deactivates questions used by the calculator.

**My decision:** Calculator-required questions cannot be removed or
made inactive/optional in a way that would break the calculation.

**Verification:** Tested deactivating a required calculator question
and confirmed the application prevents an invalid configuration from
being published/used.

---

## 6. Authentication & Authorization

**AI assistance:** Used to review authentication flow and protected
admin routes.

**My decision:** Public estimator endpoints remain accessible without
authentication, while configuration management and lead management
require an authenticated admin.

**Verification:** Tested authenticated and unauthenticated requests,
including direct API access, and confirmed protected endpoints return
`401` when authentication is missing or invalid.

---

## 7. Historical & Legacy Data

**AI assistance:** Used to reason about the supplied historical leads,
including the older Version 1 lead with a different answer structure.

**My decision:** Historical records are preserved instead of being
rewritten to match the current configuration.

**Verification:** Confirmed historical leads and their stored
configuration versions remain available in MongoDB.

---

## 8. Debugging & Iteration

AI assistance was also used during implementation to investigate
development issues, including:

- Vite import resolution
- Tailwind/PostCSS configuration
- API authentication behavior
- Configuration activation/versioning
- Dynamic question handling
- Calculator validation
- Owner-panel behavior

Generated suggestions were not accepted blindly. Changes were tested
locally and adjusted when they did not match the actual project
structure or assignment requirements.

---

## 9. Final Verification

Before submission, I manually verified:

- Public estimator flow
- Dynamic questions and options
- Lead creation
- Estimate calculation
- Configuration editing
- Configuration version creation
- Configuration history
- Lead history
- Admin authentication
- Unauthorized API access
- Required-question validation
- Minimum/maximum roof-area validation
- MongoDB persistence
- Frontend/backend integration

The final implementation was reviewed against the assignment
requirements rather than relying solely on AI-generated output.