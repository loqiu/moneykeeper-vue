# MoneyKeeper Vue i18n Plan

## 1. Goal

This document defines the internationalization plan for the MoneyKeeper frontend and the minimum backend changes required to support a clean bilingual product experience.

The target is:

- frontend UI can switch cleanly between Chinese and English
- frontend owns the final user-facing copy
- backend returns stable protocol fields instead of hard-coding display language

---

## 2. Current status

### Frontend

Current repository status:

- no `vue-i18n` integration yet
- many page labels and button texts are still hard-coded
- error handling still prefers backend `message`
- formatting logic is still scattered across components

### Backend

Current API style:

- protocol enums are mostly language-neutral now (`income`, `expense`, `owner`, `member`, etc.)
- error responses still rely heavily on `message`
- frontend does not yet have a stable `errorKey`-based translation path

---

## 3. Frontend plan

### Phase 1: i18n infrastructure

Add:

- `src/i18n/index.js`
- `src/i18n/locales/zh-CN.json`
- `src/i18n/locales/en-GB.json`
- `src/stores/locale.js`

Integrate in:

- `src/main.js`

Requirements:

- default locale from browser language when possible
- fallback locale should be `zh-CN`
- persist selected locale in local storage / store

### Phase 2: high-frequency UI copy first

Prioritize these files:

- `src/components/TopNavBar.vue`
- `src/views/LoginPage.vue`
- `src/views/AccountingPage.vue`
- `src/views/CategoriesPage.vue`
- `src/views/BudgetsPage.vue`
- `src/views/NotificationsPage.vue`
- `src/views/SearchPage.vue`
- `src/views/StatisticsPage.vue`
- `src/views/StripeCheckoutPage.vue`

Replace first:

- page titles
- subtitles
- primary / secondary button text
- filter labels
- placeholders
- empty-state copy
- success messages

### Phase 3: shared component cleanup

Convert reusable components to i18n keys:

- `src/components/PlatformStateCard.vue`
- `src/components/AddRecordForm.vue`
- `src/components/EditRecordDialog.vue`
- `src/components/AddCategoryDialog.vue`
- `src/components/RecordsList.vue`
- `src/components/AccountingCharts.vue`
- `src/components/CategoryFilter.vue`

Requirements:

- remove hard-coded Chinese strings
- clean up legacy garbled copy while migrating
- avoid mixing translated copy and raw backend text in the same component

### Phase 4: formatting layer

Add shared formatters for:

- date
- currency
- percentage
- number
- relative time

Recommended location:

- `src/utils/formatters.js`

Do not keep formatting logic duplicated in page components.

### Phase 5: error handling internationalization

Current files to refactor:

- `src/api/response.js`
- `src/utils/axios.js`

Target behavior:

- frontend should prefer `code` or `errorKey`
- backend `message` should be fallback only
- transport errors should be translated on the frontend

Recommended additions:

- `src/i18n/errors/zh-CN.json`
- `src/i18n/errors/en-GB.json`
- optional `src/constants/errorKeys.js`

### Phase 6: language switch entry

Add a visible language switcher in:

- `src/components/TopNavBar.vue`

Requirements:

- available languages: `zh-CN`, `en-GB`
- switching language should not require page reload
- user choice should persist

---

## 4. Backend requirements

Frontend i18n will remain incomplete unless backend also stabilizes response semantics.

### 4.1 Add stable error identifiers

Recommended response shape:

```json
{
  "code": 40001,
  "errorKey": "ledger.invite.already_member",
  "message": "User is already a member of this ledger"
}
```

Rules:

- `code`: stable numeric or string business code
- `errorKey`: stable language-neutral translation key
- `message`: fallback only, not the primary display field

### 4.2 Keep protocol enums language-neutral

Continue using:

- `income` / `expense`
- `owner` / `admin` / `member`
- `pending` / `running` / `completed` / `failed`

Do not return localized enum values in protocol fields.

### 4.3 Separate display copy from protocol fields

If backend sends:

- notification titles
- notification messages
- budget warning messages
- email subjects

prefer one of these approaches:

1. backend returns a stable key and frontend renders localized copy
2. backend returns both machine-readable key and fallback message

### 4.4 Update API documentation

In `FRONTEND_API.md`, clearly mark:

- protocol enum fields
- fallback message fields
- stable error keys / business codes
- which response fields are safe for frontend translation mapping

---

## 5. Recommended rollout order

1. add frontend i18n infrastructure
2. migrate top navigation and login first
3. migrate platform pages
4. centralize formatters
5. refactor error handling
6. ask backend to add `errorKey`
7. finish long-tail component cleanup

---

## 6. Definition of done

The i18n task should be considered complete when:

- user can switch between Chinese and English
- core pages are fully translated
- shared components are translated
- dates / amounts / percentages respect locale
- error messages are primarily rendered from frontend translation keys
- backend no longer forces user-facing language through protocol messages

---

## 7. First implementation slice

If work starts immediately, the most practical first slice is:

- add `vue-i18n`
- wire locale store
- translate `TopNavBar.vue`
- translate `LoginPage.vue`
- translate `AccountingPage.vue`
- add language switcher in the top bar

This gives visible value quickly without forcing the whole repo to migrate at once.
