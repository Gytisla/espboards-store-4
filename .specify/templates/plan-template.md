# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Backend-First Architecture ✓
- [ ] Backend implementation planned before frontend
- [ ] APIs documented (OpenAPI/Swagger spec required)
- [ ] Database schema migrations version-controlled
- [ ] Health check endpoints included
- [ ] Services independently testable

### II. Test-Driven Development (NON-NEGOTIABLE) ✓
- [ ] Tests written BEFORE implementation begins
- [ ] Unit test coverage target: 80% minimum
- [ ] Integration tests for API contracts included
- [ ] E2E tests for P1 user scenarios planned
- [ ] All tests executable in CI/CD pipeline

### III. Code Quality Standards ✓
- [ ] Linters/formatters configured (ESLint, Prettier)
- [ ] TypeScript strict mode enabled
- [ ] Code review process defined (minimum 1 approval)
- [ ] Function complexity limits enforced (<50 lines, complexity <10)
- [ ] Public API documentation (JSDoc/TSDoc) planned

### IV. User Experience Consistency ✓
- [ ] Design system/component library used
- [ ] WCAG 2.1 AA accessibility compliance planned
- [ ] Responsive design (320px-2560px) included
- [ ] Error handling UX patterns defined
- [ ] Performance budget specified (TTI <5s)

### V. Performance Requirements ✓
- [ ] API response time targets: GET <200ms (p95), POST <500ms (p95)
- [ ] Database queries indexed, no N+1 queries
- [ ] Pagination for collections >100 items
- [ ] Frontend bundle size <200KB per route
- [ ] Image optimization (WebP/AVIF) and lazy loading

### VI. API Design Excellence ✓
- [ ] RESTful conventions followed
- [ ] API versioning strategy defined (/api/v1/)
- [ ] Request validation schemas (Joi/Zod) included
- [ ] Consistent error response format
- [ ] Authentication/authorization implemented
- [ ] Rate limiting configured

### VII. Observability & Monitoring ✓
- [ ] Structured JSON logging implemented
- [ ] Trace IDs propagate across services
- [ ] Health check endpoints (/health, /ready)
- [ ] Key metrics tracked (request rate, error rate, latency)
- [ ] Alerts and runbooks prepared

### Performance Standards ✓
- [ ] Load testing plan (10x peak traffic)
- [ ] Stress testing to identify breaking points
- [ ] Database query execution plans reviewed
- [ ] Lighthouse score target >90

### Quality Gates ✓
- [ ] All automated tests pass in CI/CD
- [ ] 80% code coverage minimum
- [ ] Zero linter errors, justified warnings
- [ ] Security scan shows no high/critical vulnerabilities
- [ ] Performance budgets not exceeded
- [ ] Documentation updated (README, API specs)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
