# CampusProtein Project Brief

CampusProtein is a campus-based alternative-protein ecosystem for Veritas University, Nigeria. It connects students with campus vendors that sell alternative proteins and gives each student personalized, data-backed food guidance.

This brief is a plain-language summary. The companion document `REQUIREMENTS.md` holds the detailed requirements, and requirement numbers in this brief (R1, R2, and so on) refer to that document.

## 1. Problem statement

Students choose food in a hurry, on a small budget, and with little information. Three gaps follow from that.

1. **Students cannot easily find affordable protein on campus.** Options such as beans, moi moi, akara, soy products, mushrooms, and edible insects exist, but a student has no single place that shows which vendor sells what, at what price, and whether the item is available right now.
2. **Students cannot see what a food offers.** Nutrition values, allergen information, and the wider effects of a food (environment, animal welfare, cost) are rarely visible at the moment of choosing.
3. **Vendors have no simple channel to reach students.** A small campus vendor has no easy way to publish a menu, track stock, and receive and manage orders.

These gaps are the working assumptions behind the project vision. They are not survey results, and the prototype does not depend on them being measured.

CampusProtein addresses the three gaps with one product that works on a phone.

## 2. Project vision

A modern, friendly, image-rich product that university students would actually use. It has two pillars.

1. **Campus Marketplace.** Consumers discover vendors and foods, build a cart, and place prototype orders for campus pickup. Vendors manage a storefront, listings, and orders. Administrators approve vendors and manage the food catalogue, listings, and users.
2. **Nutrition and Alternative-Protein Recommendation System.** Consumers state a goal, a budget, and exclusions. The system recommends alternative-protein foods that are actually available from approved vendors, explains why each one fits, and links straight to buying it. Points, streaks, badges, and an Alternative Protein Challenge make the habit stick.

The central user journey is: food recommendation, then nutritional reason, then benefit explanation, then available campus vendor, then purchase.

Two rules shape every decision.

- **Facts come from data, never from the AI.** Nutrition values, allergen flags, prices, availability, and vendor details come only from a curated nutrition dataset and from vendor-entered listings. A deterministic recommendation engine does all filtering, calculation, and ranking. The AI only explains, converses, and suggests preparation, using the verified data it is given.
- **A working prototype beats a mock-up.** Every P0 and P1 feature must work end to end with synthetic data. Where a feature cannot be finished, a functional fallback replaces it.

## 3. Target users

### Student consumers

- **Who:** Veritas University students, mostly on phones, with limited money and limited time between classes.
- **Needs:** find protein-rich food they can afford, avoid foods that conflict with their allergies or diet, understand why a food is a good choice, and build a healthy habit without effort.
- **Pain points:** unknown availability, unknown prices, unclear nutrition, and no easy way to try unfamiliar proteins with confidence.

### Campus vendors

- **Who:** small food sellers on campus, for example sellers of bean-based dishes, soy products, mushrooms, or insect-based snacks.
- **Needs:** a storefront with their location and hours, a way to list foods with price and stock, a clear queue of orders, and a simple view of sales.
- **Pain points:** low visibility, manual order tracking, and no way to show students what makes their food a good choice.

### Administrators

- **Who:** the people who run the platform. In the prototype this is the project team or a campus staff member.
- **Needs:** approve trustworthy vendors, keep the food catalogue accurate, take down inappropriate listings, and manage users and campus locations.
- **Pain points:** unvetted vendors and inconsistent food data would damage trust in every recommendation.

## 4. User journeys

### Consumer journey

1. Register as a Consumer. A notice states that the prototype accepts only synthetic data.
2. Complete a short onboarding: pick a goal (Build Muscle, Eat Healthier, Save Money, or Explore Alternatives), a food budget in Naira, and exclusions from fixed allergen and diet lists.
3. Open the home screen: today's protein progress, top recommendations, and active orders.
4. Open recommendations. Each card shows the food, the vendor and campus location, the price, the protein per serving, the reasons it fits, a short benefit explanation, and an Add to cart action.
5. Compare a conventional protein with an alternative and read the sourced educational estimates.
6. Add to cart and place a prototype order (pay at pickup).
7. Watch the order move from Placed to Ready for Pickup, then collect the food on campus.
8. Log the meal, see daily protein progress, earn points, grow a streak, and advance the Alternative Protein Challenge.
9. Ask the Protein Coach a question and get guidance that points to foods available now.

### Vendor journey

1. Register as a Vendor.
2. Create the storefront profile: business name, description, campus location, operating days, and opening and closing times. Add an image.
3. Submit the profile for verification and watch the status (Pending, Approved, or Rejected with a reason).
4. Add listings by choosing a catalogue food, then set a title, price, available quantity, and any extra allergens.
5. Receive incoming orders on a phone-friendly screen and move each order through Accepted, Preparing, Ready for Pickup, and Completed (or Rejected).
6. Mark items available or unavailable and restock.
7. Review the dashboard and the sales summary for today, the last 7 days, or all time.

### Administrator journey

1. Sign in with a seeded administrator account.
2. Review the queue of vendors with Pending status, then approve, or reject with a reason.
3. Manage the food catalogue: add and edit foods with nutrition values, allergen flags, a source citation, and preparation notes.
4. Monitor all listings and disable inappropriate ones with a reason.
5. Manage user accounts and the list of campus locations.
6. Before a presentation, an operator (a project team member) restores the demo data with the documented reset procedure. The reset runs outside the web application and needs no application role.

## 5. MVP scope

### In scope

- **Core MVP (P0 and P1):**
  - Accounts and role-based access for three roles, and the vendor verification workflow.
  - Marketplace: vendor storefronts, listings and inventory, discovery by vendor, food, and campus location, a cart, and prototype orders with a vendor-driven status lifecycle.
  - Nutrition: a curated nutrition dataset, a deterministic recommendation engine with reasons, comparison of conventional and alternative proteins, meal logging, and daily progress.
  - AI: explanations, preparation instructions, recipe ideas, and a Protein Coach, each with a deterministic fallback.
  - Interface: polished, mobile-first, and responsive, with basic accessibility.
- **Engagement layer (P2):** points, streaks, badges, the Alternative Protein Challenge, sourced environmental, animal-welfare, affordability, and sustainability information, an administrator platform overview, a catalogue export, and extra security hardening. P2 is built after P1 is verified and is the first candidate to cut when time is short.

### Out of scope

- Real payment processing, delivery, refunds, vendor payouts, ratings, and reviews.
- Multi-vendor carts and delivery logistics.
- Native mobile apps, offline use, push notifications, email, and SMS.
- An interactive campus map and device location. Location discovery uses a list and a filter.
- Medical or clinical nutrition advice, and any calculation that uses body measurements.
- Leaderboards, social features, and administrator editing of challenge and badge definitions.
- Password recovery, social login, and multi-factor authentication.
- Vendor identity-document verification, vendor-requested catalogue entries, barcode scanning, and image recognition.
- Languages other than English.
- Advanced analytics and any complexity beyond the features above (P3).

### Data and safety boundaries

- The prototype holds only synthetic, public, or anonymized data. The interface tells users not to enter real personal, health, or financial information.
- Allergies and dietary exclusions are chosen from fixed lists. There is no free-text field for medical details, and no payment card, bank, or mobile-money data is collected.
- AWS access and Bedrock model access are unverified at this stage. No feature in P0 depends on the AI. Any AWS resource is created in the us-east-1 region.

## 6. Feature list with priorities

Priority tiers:

- **P0:** the thinnest working end-to-end path (the Golden Path) and the foundations it needs. It never depends on the AI.
- **P1:** the complete prototype: marketplace, accounts, discovery, inventory and orders, the nutrition and recommendation engine, a polished responsive interface, and AI that works reliably.
- **P2:** streaks, points, badges, challenges, environmental and sustainability information, and supporting tooling.
- **P3:** advanced analytics and unnecessary complexity. Not built.

| Area | Feature | Priority | Requirements |
|---|---|---|---|
| Access | Registration, login, session | P0 | R1, R2 |
| Access | Role-based access control | P0 | R3 |
| Access | Synthetic-data notice and data minimization | P0 | R4 |
| Marketplace: Vendor | Storefront profile and operating information | P0 | R5 |
| Marketplace: Vendor | Verification submission | P0 | R6 |
| Marketplace: Vendor | Listing management (price, quantity, availability) | P0 | R8 |
| Marketplace: Vendor | Incoming orders and status updates | P0 | R20 |
| Marketplace: Vendor | Images with seed-image fallback | P1 | R9 |
| Marketplace: Vendor | Dashboard and sales summary | P1 | R10 |
| Marketplace: Admin | Vendor review and approval | P0 | R7 |
| Marketplace: Admin | Catalogue management | P1 | R11 |
| Marketplace: Admin | Listing monitoring | P1 | R12 |
| Marketplace: Admin | User and campus location management | P1 | R13 |
| Marketplace: Admin | Platform overview | P2 | R40 |
| Marketplace: Consumer | Consumer profile | P0 | R14 |
| Marketplace: Consumer | Vendor discovery by campus location | P0 | R15 |
| Marketplace: Consumer | Food browsing and food detail | P0 | R16 |
| Marketplace: Consumer | Search, filter, and sort | P1 | R17 |
| Marketplace: Consumer | Cart | P0 | R18 |
| Marketplace: Consumer | Prototype checkout and order placement | P0 | R19 |
| Marketplace: Consumer | Order history and status | P0 | R21 |
| Nutrition | Curated nutrition dataset and calculations | P0 | R22 |
| Nutrition | Seed dataset loading | P0 | R23 |
| Nutrition | Catalogue export and round-trip check | P2 | R24 |
| Nutrition | Goal, budget, exclusions, and onboarding | P0 | R25 |
| Recommendation | Eligibility, ranking, reasons, and purchase action | P0 | R26, R27, R28 |
| Recommendation | Conventional and alternative protein comparison | P1 | R29 |
| Nutrition | Meal logging and daily progress | P1 | R30 |
| Nutrition | Consumer home dashboard | P1 | R31 |
| AI | Throttling, caching, and fallback | P1 | R32 |
| AI | Output validation against verified data | P1 | R33 |
| AI | Explanations, preparation instructions, recipe ideas | P1 | R34 |
| AI | Protein Coach conversation | P1 | R35 |
| Engagement | Points and streaks | P2 | R36 |
| Engagement | Badges | P2 | R37 |
| Engagement | Alternative Protein Challenge | P2 | R38 |
| Education | Health, environmental, animal-welfare, affordability, and sustainability information | P2 | R39 |
| Quality | Mobile-first responsive interface | P1 | R41 |
| Quality | Visual design and role-distinct experiences | P1 | R42 |
| Quality | Basic accessibility | P1 | R43 |
| Quality | Performance | P1 | R44 |
| Quality | Security controls | P1 | R45 |
| Quality | Audit trail and login throttling | P2 | R46 |
| Delivery | Demo data and reset | P0 | R47 |
| Delivery | Golden Path end to end | P0 | R48 |
| Delivery | Delivery and verification rules | P0 | R49 |
| Beyond MVP | Advanced analytics and unnecessary complexity | P3 | none |

## 7. Demonstration strategy for judges

### Principles

- **One story, five minutes.** The demo follows the Golden Path from vendor approval to order pickup, then adds meal logging and the AI fallback.
- **Synthetic data only.** The demo uses a documented demo state: one administrator, two consumers, three approved vendors, one pending vendor, and at least 20 listings. Every display name and business name begins with the word Demo, such as Demo Student 1 and Demo Soy Stop.
- **Repeatable.** A reset procedure restores the demo state within 60 seconds.
- **Honest.** The demo shows only what has been tested. The AI is shown working and then switched off to show that the product still works.

### Demo data design

- At least one sold-out listing, one listing with a peanut allergen, one with an insect allergen, and one listing from the pending vendor.
- The data is tuned so that the first recommendation for the demo student comes from the vendor approved in the first step, a peanut-based item is hidden by the student's peanut exclusion, and a sold-out item never appears.

### Demo story: "Demo Student 1 plans lunch"

| Time | Step | What the judges see |
|---|---|---|
| 0:00 | Introduce the problem in one sentence and show the landing screen | The synthetic-data notice and the three roles |
| 0:20 | **Administrator** approves the pending vendor | The pending queue, the approval, and the vendor's listings appearing for students |
| 0:45 | **Consumer** completes onboarding: goal Build Muscle, budget 1,500 Naira, exclusion Peanut | Fixed lists, no free-text health fields |
| 1:15 | Open recommendations | Ranked foods from approved vendors with reasons (protein per serving, share of daily target, price against budget, no exclusion conflict), vendor and location, and a benefit explanation |
| 1:45 | Compare a conventional protein with an alternative | Side-by-side nutrition from the curated dataset and sourced educational estimates labelled as estimates |
| 2:15 | Add to cart and place a prototype order | Order code, pickup location, and a notice that no payment is taken online |
| 2:40 | **Vendor** opens incoming orders and moves the order to Accepted, Preparing, and Ready for Pickup | The new order appears within 15 seconds, and the student's screen updates |
| 3:20 | **Vendor** marks the order Completed at pickup, then the **Consumer** logs the meal | Daily protein progress, points, a first streak day, the First Bite badge, and challenge progress of 1 out of 5 |
| 3:50 | Ask the Protein Coach for a high-protein snack | An AI reply with cards for foods that are in stock, with values taken from the data |
| 4:15 | Switch the AI off (or trigger the rate limit) and ask again | A deterministic reply that lists the top recommendations with the standard explanation, labelled as standard guidance |
| 4:40 | Close | Every number is traceable to a source, and the demo resets in 60 seconds |

### If something goes wrong

- If the AI is unavailable, continue with the fallback. This is a designed behavior and is part of the story.
- If a live step fails, run the reset procedure and restart from the last completed step.
- If the network fails, run the prototype locally with the AI disabled. Every P0 step works without the AI and without AWS.

### Pre-demo checklist

1. Run the reset procedure and confirm the demo state.
2. Run the automated end-to-end test of the Golden Path and confirm that it passes.
3. Check the AI status: enabled and answering, or disabled on purpose.
4. Open the three role sessions (administrator, consumer, vendor) on separate browser profiles or devices.
5. Confirm that no real credentials, keys, or personal data appear on screen or in the repository.

## 8. Success criteria

The prototype succeeds when all of the following hold. Each criterion is checked by a test or a recorded manual verification.

1. **End to end.** A presenter completes the Golden Path in 5 minutes or less with the AI disabled, and an automated end-to-end test of the same path passes.
2. **Marketplace works.** Vendors are approved by an administrator, only approved vendors and available listings appear to students, orders reduce stock, order status changes reach the student within 15 seconds, and a rejected order restores stock.
3. **Recommendations are trustworthy.** Across generated test inputs, no recommendation exceeds the budget, conflicts with an exclusion, comes from an unapproved vendor, or is sold out, and identical inputs give identical rankings.
4. **Nutrition data is traceable.** Every catalogue food carries a source citation, per-serving values follow from the per-100 g values, and no AI-generated value appears in any displayed number.
5. **AI is reliable.** Throttling, caching, and fallback are demonstrated: with the AI disabled, rate limited, slow, or returning invalid output, each AI feature still returns a usable deterministic result.
6. **Polished and accessible.** All screens render without horizontal scrolling at 360, 768, and 1280 pixel widths, the main content appears within 3 seconds on a simulated 4G connection, and basic accessibility checks pass.
7. **Engagement works (P2).** Points, streaks, badges, and the Alternative Protein Challenge follow their written rules in automated tests, and every educational estimate shows its source and an Estimate label.
8. **Responsible by design.** The prototype contains only synthetic data, the interface carries the data notice, no payment details are collected, and no secrets are present in the repository.
9. **Evidence exists.** Each milestone records the implementation, the executed tests, and the verification result. Work is committed to Git at the end of each task and each working session, and the documentation claims only what has been tested.
