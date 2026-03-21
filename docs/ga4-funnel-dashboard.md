# GA4 Funnel Dashboard — Cver AI

Property ID: `G-CDMCYEXE2W`
Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-CDMCYEXE2W` in `.env` and `production.env`.

---

## 1. Mark Conversion Events

`GA4 Admin → Events → (find event) → toggle "Mark as conversion"`

| Event | Why |
|---|---|
| `gmail_connect_success` | Core activation gate |
| `payment_success` | Revenue event |

---

## 2. Custom Dimensions (Admin → Custom definitions → Create)

These let every event carry UTM + platform without needing a separate join.

| Name | Scope | User property / param | Notes |
|---|---|---|---|
| Platform | Event | `platform` | Always "web" for now |
| Source | Event | `source` | utm_source or "direct" |
| UTM Medium | Event | `utm_medium` | |
| UTM Campaign | Event | `utm_campaign` | |
| Signup Method | Event | `method` | "email" or "google" |
| Job ID | Event | `job_id` | |
| Plan | Event | `plan` | e.g. "pro" |
| User ID (linked) | User | `user_id` | Set via `Analytics.identify()` — enables cross-device |

---

## 3. Funnel Exploration (Daily report)

`Explore → Funnel exploration → New`

Name it **"Signup → Payment Funnel"** and add steps in order:

| Step | Event |
|---|---|
| 1 | `signup_complete` |
| 2 | `onboarding_complete` |
| 3 | `gmail_connect_warning_view` |
| 4 | `gmail_connect_success` *(conversion)* |
| 5 | `auto_apply_enable` |
| 6 | `trial_start` |
| 7 | `payment_success` *(conversion)* |

**Breakdowns to add:**
- Dimension: `Source` (utm_source) — answers "where do users come from?"
- Dimension: `Signup Method` — do Google sign-ups convert better?

**Save as shared report** so the whole team can access it.

---

## 4. Free-form Exploration — Drop-off Analysis

`Explore → Free form → New`

Rows: `Event name`
Values: `Event count`, `Total users`
Filter: Event name = `job_view`, `job_save`, `gmail_connect_start`, `gmail_connect_success`

This answers: **"What do users do first and where do they drop?"**

---

## 5. Daily Overview Dashboard

`Reports → Library → Create new report → Blank`

Add the following cards:

| Card | Metric | Dimension |
|---|---|---|
| New users today | `New users` | Day |
| Signups | `signup_complete` event count | Day |
| Gmail connects | `gmail_connect_success` event count | Day |
| Payments | `payment_success` event count | Day |
| Revenue | `payment_success` → param `value` (use event value) | Day |
| Top sources | `New users` | `Source` dimension |
| Activation rate | `gmail_connect_success` ÷ `signup_complete` | (calculated metric) |

**Bookmark** `Reports → Realtime` for live event verification after deploys.

---

## 6. Realtime Verification Checklist

After each deploy, open `Reports → Realtime` and confirm:

- [ ] `signup_complete` fires on `/register` form submit (check `method` param)
- [ ] `onboarding_complete` fires at the end of onboarding flow
- [ ] `gmail_connect_success` fires after OAuth redirect
- [ ] `payment_success` fires after Paystack webhook verifies (check `value` + `currency`)
- [ ] All events show `platform=web` and correct `source`

---

## 7. Answering the Four Daily Questions

| Question | Where to look |
|---|---|
| Where do users come from? | Funnel exploration → breakdown by `Source` |
| What do they do first? | Free-form → event count sorted by first occurrence time |
| Where do they drop? | Funnel exploration → step drop-off % |
| How many pay? | Daily overview → Payments card + Activation rate |
