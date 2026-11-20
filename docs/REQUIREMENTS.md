# CampusProtein Requirements

## 1. About this document

This document states what CampusProtein must do and how well. It is self-contained. The companion document `PROJECT_BRIEF.md` gives the problem, users, journeys, scope, demonstration plan, and success criteria in plain language.

### How to read the requirements

- **Requirement numbers.** Each requirement has a stable number (R1, R2, and so on). "Requirement 27" and "R27" mean the same thing. The Glossary and the Assumptions refer to requirements by number.
- **Priority tags.** Every requirement carries one tag from P0 to P3.

| Tier | Meaning | Depends on the AI? |
|---|---|---|
| P0 | The thinnest working end-to-end experience (the Golden Path, R48) and the foundations it needs. P0 includes the minimum versions of accounts, vendor approval, listings, recommendations, cart, orders, and status updates. | Never |
| P1 | The complete prototype: marketplace, accounts, product discovery, vendor inventory and orders, the nutrition and recommendation engine, a polished responsive interface, and AI integration that works reliably. | Only through a fallback |
| P2 | Streaks, points, badges, challenges, environmental and sustainability information, and supporting tooling that is not on the demonstration path. | Only through a fallback |
| P3 | Advanced analytics and any unnecessary complexity. P3 items are not built and carry no requirement. | Not applicable |

- **Priority and development order.** P0 comes first and is built as a thin slice. The P1 work then completes the same areas to prototype quality. P2 follows. Where a feature area has both a thin first version and a fuller version, the two are separate requirements with separate tags (for example R8 listing management is P0 and R9 images is P1).
- **Wording.** The tables state each requirement with its key rules and exact numbers. Every rule is written so that an automated test or a recorded manual check can confirm the rule.

### Two rules behind every requirement

1. **Facts come from data.** Nutrition values, allergen flags, prices, quantities, availability, and vendor data come only from the curated nutrition dataset and from vendor-entered listings. The AI never supplies or changes them.
2. **P0 never needs the AI, AWS, or a Bedrock model.** AWS and Bedrock access are unverified. Each AI feature has a deterministic fallback, so the product works with the AI switched off.

## 2. Glossary

Terms in capitalised form with underscores (for example Catalogue_Entry) are defined here and used consistently in every section.

### Systems and actors

- **CampusProtein**: The complete browser-based web application, including every subsystem named below.
- **Access_Control**: The subsystem that handles registration, authentication, sessions, and role-based authorization.
- **Marketplace**: The subsystem that handles Vendor_Profiles, Listings, discovery, Carts, and Orders.
- **Admin_Console**: The part of the Web_Interface and its backing functions that only Administrators can use.
- **Nutrition_Catalogue**: The subsystem that stores and serves the Nutrition_Dataset and performs nutrition calculations.
- **Recommendation_Engine**: The deterministic subsystem that filters, calculates, and ranks Listings using Verified_Data. The Recommendation_Engine never calls the AI_Provider.
- **AI_Assistant**: The subsystem that obtains AI-generated text from the AI_Provider and that applies throttling, caching, output validation, and fallback.
- **Progress_Tracker**: The subsystem that stores Meal_Log_Entries and computes Daily_Totals and goal progress.
- **Gamification_Engine**: The subsystem that computes Points, Streaks, Badges, and Challenge progress.
- **Impact_Library**: The subsystem that stores and serves Impact_Facts.
- **Seed_Loader**: The function that parses a Seed_Dataset_File and loads its contents into CampusProtein.
- **Dataset_Serializer**: The function that writes catalogue data back into the Seed_Dataset_File format.
- **Web_Interface**: The responsive browser user interface of CampusProtein.
- **Project_Team**: The people who build and document CampusProtein.
- **Operator**: A Project_Team member who runs the seeding, reset, and export procedures outside the web application. These procedures need no application role.
- **AI_Provider**: The external generative AI service that the AI_Assistant calls. The provider and model are chosen in the design phase after access is verified.
- **Visitor**: A person who has not signed in.
- **Consumer**: A signed-in user with the Consumer role, typically a student.
- **Vendor**: A signed-in user with the Vendor role. Each Vendor owns exactly one Vendor_Profile.
- **Administrator**: A signed-in user with the Administrator role. Administrator Accounts are created only by seeding.
- **Account**: The stored record of a user: login identifier, display name, password hash, role, and active or deactivated state.

### Marketplace terms

- **Vendor_Profile**: The storefront record of a Vendor: business name, description, Campus_Location, operating days, opening time, closing time, and optional image. A Vendor_Profile is complete when it holds a business name, a Campus_Location, at least one operating day, an opening time, and a closing time.
- **Verification_Status**: The state of a Vendor_Profile: Not_Submitted, Pending, Approved, Rejected, or Suspended.
- **Approved_Vendor**: A Vendor whose Verification_Status is Approved and whose Account is active.
- **Campus_Location**: A named place on the campus from an Administrator-managed list. The prototype list consists of synthetic placeholder names.
- **Listing**: A Vendor-entered offering of one unit (equal to one Standard_Serving) of a Catalogue_Entry, with title, Listing_Type, price, available quantity, availability flag, optional image, and Vendor-declared allergens.
- **Listing_Type**: Either Product (packaged or ready-to-eat item) or Prepared_Meal (cooked meal).
- **Visible_Listing**: A Listing that has not been removed, is flagged Available by its Vendor, belongs to an Approved_Vendor, is linked to an active Catalogue_Entry, and has not been disabled by an Administrator.
- **Orderable_Listing**: A Visible_Listing whose available quantity is at least 1.
- **Consumer-facing view**: A screen or data response that shows Vendors or Listings to a Consumer, such as vendor discovery, food discovery, search results, Vendor profile pages, Listing detail screens, the comparison screen, and the Cart. Recommendations are named separately.
- **Cart**: The Consumer's pending set of Listing lines, all from one Vendor.
- **Order**: A record created from a Cart at checkout, with a Vendor, item lines, total, Order_Code, Order_Status, and status history.
- **Order_Code**: A short, unique, human-readable code that identifies an Order at pickup.
- **Order_Status**: One of Placed, Accepted, Preparing, Ready_For_Pickup, Completed, or Rejected.
- **Prototype_Order**: An Order for which no payment is processed. The Consumer pays the Vendor at pickup outside CampusProtein. Pickup on campus is the only fulfilment method.
- **Naira**: Nigerian currency (symbol ₦, code NGN). All prices and budgets are whole-number Naira amounts.
- **WAT**: West Africa Time (UTC+1), the campus time zone. Every calendar day used in a requirement is a WAT calendar day.

### Nutrition and recommendation terms

- **Alternative_Protein**: A protein-rich food or meal whose primary protein source is a legume (for example cowpea beans, bambara groundnut, or pigeon pea), a soy product (for example soy milk, tofu, or soy chunks), an edible insect (for example crickets, termites, or palm weevil larvae), a mushroom, or an edible seed or nut (for example groundnut or melon seed). Conventional animal protein from beef, goat, pork, poultry, fish, eggs, and dairy is not an Alternative_Protein. In the Nutrition_Dataset, a Catalogue_Entry is an Alternative_Protein when its Protein_Class is not Conventional.
- **Protein_Class**: The classification of a Catalogue_Entry by primary protein source: Legume, Soy_Product, Edible_Insect, Mushroom, Seed_or_Nut, or Conventional.
- **Nutrition_Dataset**: The curated seed dataset, built from public food-composition sources, that holds Catalogue_Entries. It is the project's "verified nutrition database". Verified means curated from the cited public sources, not clinically validated.
- **Catalogue_Entry**: One food record in the Nutrition_Dataset: name, Protein_Class, Food_Type, Standard_Serving, Core_Nutrients per 100 g, Allergen_Flags, Diet_Compatibility, Source_Attribution, Preparation_Notes, optional Seed_Image, and active or inactive state.
- **Food_Type**: Snack, Meal, or Drink.
- **Standard_Serving**: The serving size of a Catalogue_Entry, stated in grams with a household description. Nutrition per serving equals the per 100 g value multiplied by the serving grams and divided by 100.
- **Core_Nutrients**: Energy (kcal), protein (g), carbohydrate (g), fat (g), and fibre (g).
- **Source_Attribution**: The citation of the public food-composition source (title, publisher, year, and food identifier or link) from which a Catalogue_Entry's values were taken.
- **Allergen_Category**: One of Peanut, Tree_Nut, Soy, Egg, Milk, Fish, Shellfish, Wheat_Gluten, Sesame, or Insect.
- **Allergen_Flags**: The set of Allergen_Categories present in a Catalogue_Entry or Listing. The effective Allergen_Flags of a Listing are the union of the Catalogue_Entry flags and the Vendor-declared allergens.
- **Diet_Category**: One of Vegetarian, Vegan, or Pescatarian. Religion-linked labels are not offered because composition data cannot verify them.
- **Diet_Compatibility**: The set of Diet_Categories with which a Catalogue_Entry is compatible, set by the curator. Edible insects are treated as animal-derived foods.
- **Exclusions**: The set of Allergen_Categories that a Consumer avoids and Diet_Categories that the Consumer follows, selected from the fixed lists.
- **Exclusion_Conflict**: The condition in which the effective Allergen_Flags of a Listing contain an Allergen_Category in the Exclusions of a Consumer, or the Diet_Compatibility of the Catalogue_Entry of the Listing lacks a Diet_Category in the Exclusions of the Consumer.
- **Nutrition_Goal**: One of the fixed presets Build_Muscle, Eat_Healthier, Save_Money, or Explore_Alternatives.
- **Daily_Protein_Target**: The Consumer's daily protein goal in grams. Each Nutrition_Goal preset supplies a default.
- **Food_Budget**: The maximum price in Naira that a Consumer wants to pay for one Listing.
- **Food_Need**: The kind of food a Consumer wants now: Snack, Meal, Drink, or Any.
- **Preferred_Protein_Classes**: The optional set of Alternative_Protein Protein_Classes that a Consumer wants to see more of.
- **Consumer_Profile**: A Consumer's display name, Nutrition_Goal, Daily_Protein_Target, Food_Budget, Exclusions, and Preferred_Protein_Classes.
- **Protein_Value**: The protein in grams per Standard_Serving divided by the Listing price in hundreds of Naira.
- **Recommendation_Request**: The inputs to the Recommendation_Engine: Food_Budget, Nutrition_Goal, Food_Need, optional Campus_Location, and the Consumer's Exclusions and Preferred_Protein_Classes.
- **Eligible_Listing**: An Orderable_Listing that has an Alternative_Protein Catalogue_Entry, a price not above the Food_Budget, no Exclusion_Conflict for the Consumer, a Food_Type matching the Food_Need (any Food_Type when the Food_Need is Any), and (when a Campus_Location is selected) a Vendor at that Campus_Location.
- **Recommendation**: An Eligible_Listing with a rank, a set of Recommendation_Reasons, and an explanation.
- **Recommendation_Reason**: A structured item (reason code plus the Verified_Data values behind it) that states why a Listing was recommended.
- **Benefit_Statement**: The single curated sentence stored with a Protein_Class that states a general benefit of that class, with a source.
- **Verified_Data**: Data held in CampusProtein's structured stores: Nutrition_Dataset values, Allergen_Flags, Listing prices, quantities and availability, and Vendor_Profile data. No AI-generated value is Verified_Data.
- **Meal_Log_Entry**: A Consumer's record of eating a number of servings of one Catalogue_Entry at a time, with the Core_Nutrients computed at logging time.
- **Daily_Totals**: The sum of Core_Nutrients over a Consumer's Meal_Log_Entries for one WAT calendar day.

### AI terms

- **Protein_Coach**: The Consumer-facing chat screen in which a Consumer asks food and nutrition questions and receives replies built from Verified_Data.
- **Structured_AI_Output**: A response from the AI_Provider that conforms to the response schema defined in the design phase.
- **Fallback_Mode**: The condition in which the AI_Assistant produces output without a usable AI_Provider response because the AI_Provider is disabled, not configured, unavailable, rate limited, slow, or returned unusable output.
- **Fallback_Output**: The deterministic output used in Fallback_Mode: the Fallback_Explanation for explanations, the Preparation_Notes of the Catalogue_Entry for preparation instructions, and a scripted reply that lists foods selected by the Recommendation_Engine for the Protein_Coach.
- **Fallback_Explanation**: A templated sentence set generated from Recommendation_Reasons and the Benefit_Statement without any AI call.
- **Preparation_Notes**: Short curated preparation instructions stored with a Catalogue_Entry.

### Engagement and education terms

- **Points_Table**: The configured list of point awards: logging a Meal_Log_Entry (10 points, counted for at most 3 entries per WAT calendar day), reaching the Daily_Protein_Target (25 points, once per WAT calendar day), logging a Catalogue_Entry of an Alternative_Protein Protein_Class for the first time (20 points per Protein_Class), and completing a Challenge (100 points).
- **Streak**: The number of consecutive WAT calendar days, ending today or yesterday, on each of which the Consumer logged at least one Meal_Log_Entry.
- **Badge_Catalogue**: The fixed list of Badges: First_Bite (first Meal_Log_Entry), Streak_3 (Streak of 3), Streak_7 (Streak of 7), Protein_Goal_Hit (first day reaching the Daily_Protein_Target), Legume_Explorer, Soy_Explorer, Insect_Explorer, Mushroom_Explorer, and Seed_Nut_Explorer (first log of each Alternative_Protein Protein_Class), and Challenge_Champion (first completed Challenge).
- **Challenge**: A time-boxed goal that a Consumer joins and that has a progress count, a deadline, and a reward.
- **Alternative_Protein_Challenge**: The flagship Challenge: log at least 5 distinct Alternative_Protein Catalogue_Entries within 7 days of joining. The reward is 100 points and the Challenge_Champion Badge.
- **Impact_Fact**: A curated static educational statement or figure about one Impact_Dimension of a Protein_Class, with a unit (for numeric figures), a Source_Attribution, and an Estimate label.
- **Impact_Dimension**: Health, Environment, Animal_Welfare, Affordability, or Sustainability.

### Delivery terms

- **Golden_Path**: The P0 demonstration scenario defined in Requirement 48.
- **Demo_State**: The documented, seeded state of CampusProtein used for demonstrations: synthetic Accounts, Vendors, Listings, Catalogue_Entries, and the Alternative_Protein_Challenge.
- **Seed_Dataset_File**: A UTF-8 JSON file that lists Catalogue_Entries, Protein_Class records, Campus_Locations, Impact_Facts, and Badge and Challenge definitions. The JSON schema is defined in the design phase.
- **Seed_Image**: A curated food image with a recorded source and license.
- **Image_Upload**: The optional capability for Vendors to upload their own images, enabled by configuration.

## 3. Functional requirements

Requirements are grouped by pillar and by role. Each table row gives the requirement number, the title, the key rules with exact numbers, and the priority tag.

### 3.1 Platform and access (all roles)

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R1 | Account registration | A Visitor registers with an email-format login identifier, a display name of 2 to 40 characters, a password of at least 8 characters, and the role Consumer or Vendor. Duplicate identifiers are rejected without regard to letter case. Only the Consumer and Vendor roles are offered. After registration a session starts, a Consumer sees onboarding (R25), and a Vendor sees the storefront profile form (R5). | P0 |
| R2 | Login, logout, and session | Wrong credentials give one generic message. A deactivated Account gets a deactivation message after valid credentials. Logout ends the session, and later requests with the ended session are rejected. Every session ends within 12 hours of starting. | P0 |
| R3 | Role-based access control | The server checks authorization on every request. Visitors reach only the landing, registration, and login screens. Vendor functions are limited to the owning Vendor, Consumer functions to the Consumer role and the owning Consumer, and the Admin_Console to Administrators. A record that belongs to another user appears as not found. | P0 |
| R4 | Prototype data notice and data minimization | A notice states that only synthetic data is accepted. It appears on the landing, registration, onboarding, and profile screens and beside every free-text input. Only the data items in section 6 are stored. There is no input for payment card, bank, or mobile-money details, none for body measurements, medical conditions, or diagnoses, and allergies and diets are selected from fixed lists. | P0 |

### 3.2 Pillar 1, Campus Marketplace: Consumer

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R14 | Consumer profile | A new profile holds the goal Eat_Healthier, a protein target of 55 g, a budget of 2000 Naira, and no exclusions or preferred classes. The Consumer can change the display name (2 to 40 characters). The profile screen shows the display name, goal, protein target, budget, exclusions, and preferred classes. | P0 |
| R15 | Vendor browsing and campus location discovery | The Consumer sees every Approved_Vendor with business name, image, Campus_Location, operating days, and hours, sorted by business name. Selecting a Campus_Location shows only Vendors at that place. A Vendor page shows the Vendor_Profile and the Vendor's Visible_Listings that do not conflict with the Consumer's Exclusions. An empty result offers a way to clear the filter. | P0 |
| R16 | Food browsing and food detail | The list shows Visible_Listings without an Exclusion_Conflict, sorted by title, each with image, title, Vendor, Campus_Location, price in Naira, protein per Standard_Serving, and availability. Detail adds Core_Nutrients per serving and per 100 g, Protein_Class, effective allergen flags, diet compatibility, and source. Nutrition values are labelled as estimates. A statement tells the Consumer to confirm allergens with the Vendor. A conflicting Listing shows a warning that names each conflict. A count shows how many Listings the Exclusions hide. Sold-out Listings show Sold out and cannot be added to the cart. | P0 |
| R17 | Search, filter, and sort | Case-insensitive text search over title, catalogue food name, and Vendor business name. Filters: Listing_Type, Protein_Class, Food_Type, Campus_Location, minimum and maximum price, and minimum protein per serving. All applied filters combine. Sort by title (default), price ascending, price descending, protein per serving, or Protein_Value. An empty result offers a way to clear the search and filters. | P1 |
| R18 | Cart | A Consumer adds 1 to 10 units of an Orderable_Listing, never more than the available quantity. A Cart holds lines from one Vendor. Adding from a second Vendor leaves the Cart unchanged and offers to replace the contents. Quantities can be changed and lines removed. Lines show unit price, quantity, and line total, and the Cart shows the total in Naira. The Cart persists across logins until an Order is placed or every line is removed. | P0 |
| R19 | Prototype checkout and order placement | Placing an Order creates one Order with status Placed, the Vendor, the pickup Campus_Location, a snapshot of each line (title, unit price, quantity), the total, the time, and a unique Order_Code. Stock is reduced and the Cart is emptied. If any line is no longer orderable or exceeds stock, no Order is created, stock is unchanged, and each affected line is reported. The available quantity of a Listing never falls below 0, even when Orders arrive at the same moment. Pay at pickup is the only payment option and no payment details are collected. Checkout and confirmation say that no payment is taken online. Confirmation shows the Order_Code, Vendor, pickup location, and hours. | P0 |
| R21 | Consumer order history and status | The Consumer sees Orders newest first with code, Vendor, total, time, and status. An Order page shows lines, total, pickup location, status, and status history with times. Status changes appear within 15 seconds without a manual reload. Ready_For_Pickup highlights the code and location. Rejected shows a message that the Vendor could not fulfil the Order. | P0 |

### 3.3 Pillar 1, Campus Marketplace: Vendor

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R5 | Vendor profile and operating information | An empty profile with status Not_Submitted is created at registration. The Vendor saves a business name (2 to 60 characters), a description (up to 300 characters), one active Campus_Location, at least one operating day, and opening and closing times, with closing later than opening. Edits appear to Consumers on the next page load. Operating hours are informational and do not block Orders. | P0 |
| R6 | Vendor verification submission | A Vendor with a complete profile submits it and the status becomes Pending. An incomplete profile is rejected with the missing fields listed. The dashboard shows the status and, for Rejected, the reason. A Vendor can prepare Listings before approval, and those Listings stay hidden until approval. Verification uses the profile content only, with no identity documents or registration numbers. | P0 |
| R8 | Vendor listing management | A Vendor with a complete profile creates a Listing linked to one active Catalogue_Entry, with a title (2 to 60 characters), a Listing_Type (Product or Prepared_Meal), a price of 1 to 50000 Naira, and a quantity of 0 to 999. The Vendor sees the entry's nutrition, allergen flags, and source, and can declare extra allergens. The effective flags are the union of the entry flags and the declared allergens. The Vendor can edit a Listing, mark it Unavailable, or remove it. Removal leaves existing Order lines unchanged. Quantity 0 shows Sold out and excludes the Listing from recommendations. | P0 |
| R20 | Vendor order management | Each new Order appears to the owning Vendor with code, Consumer display name, lines, total, time, and status Placed. New Orders and status changes appear within 15 seconds without a manual reload. Allowed status changes: Placed to Accepted, Accepted to Preparing, Preparing to Ready_For_Pickup, Ready_For_Pickup to Completed, and Placed to Rejected. Other changes are rejected. Rejection returns the ordered quantities to stock. Each change is recorded with its time. Orders list newest first and can be filtered by status. | P0 |
| R9 | Food images with fallback | Where Image_Upload is enabled, a Vendor uploads a JPEG, PNG, or WebP file of at most 2 MB for a Listing or the Vendor_Profile. Other types and larger files are rejected with a message, and the existing image stays. A Vendor can choose a Seed_Image instead, whether or not uploads are enabled. Display falls back from the Vendor image to the catalogue Seed_Image to the placeholder illustration of the style guide. Every Seed_Image records its source and license (public domain, an open license with attribution, or created by the project team), and required attributions appear on the Listing detail. | P1 |
| R10 | Vendor dashboard and sales summary | The dashboard shows the verification status, the number of Orders in each status, and the number of Listings that are Available (flagged Available with a quantity of at least 1), Sold out (flagged Available with a quantity of 0), and Unavailable (flagged Unavailable). The sales summary covers Today, Last 7 days, or All time, using WAT days and the placement time of Orders. It shows Orders by status, the total Naira value of Completed Orders, and units sold per Listing for Completed Orders. It uses the requesting Vendor's Orders only and reflects status changes on the next request. | P1 |

### 3.4 Pillar 1, Campus Marketplace: Administrator

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R7 | Administrator vendor review | The Admin_Console lists Pending Vendors, oldest first, with the full profile. An Administrator approves (the Administrator and time are recorded) or rejects with a reason of 5 to 200 characters. A rejection without a valid reason is refused. An Administrator can suspend an Approved Vendor and reinstate a Suspended Vendor. A Vendor whose status is not Approved, and the Vendor's Listings, are excluded from vendor discovery, food discovery, search, and recommendations. A Suspended Vendor receives no new Orders, and existing Orders stay accessible to the Vendor and the Consumers. | P0 |
| R11 | Administrator catalogue management | An Administrator creates a Catalogue_Entry with name, Protein_Class, Food_Type, Standard_Serving, Core_Nutrients per 100 g, allergen flags, diet compatibility, source attribution, and preparation notes. An entry is rejected when the source is empty, any nutrient is negative, the serving is 0 g or less, or protein plus carbohydrate plus fat exceeds 100 g per 100 g. Edits reach linked Listings on the next page load. Deactivating an entry hides every linked Listing, and reactivating restores the Listings that satisfy the other visibility conditions. | P1 |
| R12 | Administrator listing monitoring | The Admin_Console lists all Listings with Vendor, catalogue food, price, quantity, availability flag, and visibility state, filterable by Vendor and visibility. An Administrator disables a Listing with a reason of 5 to 200 characters, which hides the Listing and shows the reason to the Vendor. Enabling restores visibility according to the Vendor and catalogue settings. | P1 |
| R13 | Administrator user and platform data management | The Admin_Console lists Accounts with identifier, display name, role, state, and creation time, with a role filter and a search. An Administrator deactivates an Account (sessions end and logins are rejected) and reactivates an Account. An Administrator cannot deactivate the Administrator's own Account. An Administrator adds (name of 2 to 60 characters), renames, and deactivates Campus_Locations, and deactivation is refused, naming the referencing Vendors, while a Vendor_Profile uses the location. A deactivated Vendor Account hides the Vendor and the Vendor's Listings. | P1 |
| R40 | Administrator platform overview | The overview shows the number of Accounts by role, Vendors by verification status, Listings by visibility state, and Orders by status, calculated at request time. | P2 |

### 3.5 Pillar 2, Nutrition and Recommendation: data foundation

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R22 | Nutrition dataset and calculations | Every Catalogue_Entry holds Core_Nutrients per 100 g (energy in kcal, and protein, carbohydrate, fat, and fibre in g), a Standard_Serving in grams, a Protein_Class, a Food_Type, allergen flags, diet compatibility, and a source attribution that names a public food-composition source. Per serving = per 100 g value x serving grams / 100. Values for several servings scale linearly. The interface rounds grams to 1 decimal place and energy to whole kcal, while calculations use unrounded values. Each Protein_Class has a sourced Benefit_Statement. No AI-generated value enters the dataset. | P0 |
| R23 | Seed dataset loading | The Seed_Loader loads a valid JSON Seed_Dataset_File (catalogue entries, class records, campus locations, impact facts, badge and challenge definitions). An invalid file is rejected as a whole, nothing is loaded, and each violation location is reported. A catalogue entry that breaks the R11 validation rules rejects the whole file. Loading the same file twice gives the same stored data as loading it once. The shipped file has at least 30 entries: at least 20 alternative proteins that cover all five classes, and at least 5 conventional proteins. Every entry is built from a public source with attribution and states every value per 100 g, and every alternative-protein entry has preparation notes. | P0 |
| R24 | Dataset export and round-trip | An Operator exports the catalogue data to the same file format, and the Seed_Loader accepts the export. Loading an export into an empty system gives a catalogue equal to the exported one. Loading, exporting, and loading again gives the same catalogue as the first load. | P2 |

### 3.6 Pillar 2, Nutrition and Recommendation: Consumer

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R25 | Consumer nutrition preferences and onboarding | A first-time Consumer sees a skippable onboarding for goal, budget, exclusions, and preferred classes. Goal presets: Build_Muscle (default target 90 g), and Eat_Healthier, Save_Money, and Explore_Alternatives (default target 55 g each). The protein target is 20 to 200 g and the budget is 100 to 50000 Naira, and values outside the range are rejected with the range shown. Exclusions come only from the 10 allergen categories and 3 diet categories. Preferred classes are zero or more of the five alternative-protein classes. Saved changes apply to the next recommendation request. | P0 |
| R26 | Recommendation eligibility | A Listing is eligible only when it is orderable (available, in stock, from an Approved_Vendor, linked to an active entry), is an alternative protein, costs no more than the budget, has no Exclusion_Conflict, matches the chosen Food_Need (Snack, Meal, or Drink) when one is chosen, and is at the chosen Campus_Location when one is chosen. Eligibility uses verified data only and never calls the AI. An empty result shows a message that offers to change the budget, food need, or location. | P0 |
| R27 | Recommendation ranking | The score combines protein per serving, Protein_Value (protein per 100 Naira), the goal emphasis, preferred classes, and classes logged in the previous 7 days, with weights in configuration. With other inputs equal: Build_Muscle ranks higher protein per serving first, Save_Money ranks higher Protein_Value first, Explore_Alternatives ranks a class not logged in 7 days first, and a preferred class ranks first. Equal scores order by lower price, then by Listing identifier. At most 10 recommendations are returned. Identical requests on identical data return the same order. | P0 |
| R28 | Recommendation results, reasons, and purchase action | Each card shows image, title, Vendor, Campus_Location, price, and protein, energy, carbohydrate, and fat per serving. Reasons come from verified data: protein per serving, the share of the daily protein target that one serving supplies, price against budget, Protein_Value, no exclusion conflict, goal match, and Vendor and location. Each card shows an explanation (AI-generated or the standard one), the sourced Benefit_Statement, and actions: Add to cart, Listing detail, and Vendor page. Every number comes from verified data. | P0 |
| R29 | Conventional and alternative protein comparison | A comparison screen opens from a Listing or a recommendation. The Consumer picks one conventional entry and one alternative entry. The screen shows Core_Nutrients side by side per serving and per 20 g of protein, the difference for each nutrient, and the orderable Listings of the alternative food with Vendor, location, price, and Add to cart. If no Vendor offers the food, the screen says so. | P1 |
| R30 | Meal logging and daily progress | A Consumer logs an active catalogue food with 0.5 to 10 servings in steps of 0.5. The entry stores the nutrients calculated at logging time, and later catalogue edits do not change old entries. Logging starts from a catalogue search or from the lines of the Consumer's Orders. The daily screen (WAT day) shows totals, the protein target, protein progress as a percentage, remaining protein in grams, and the day's entries. Reaching the target shows the goal as reached. A Consumer can delete an own entry, and the totals are recomputed. | P1 |
| R31 | Consumer home dashboard | The home screen shows today's protein progress, the top 3 recommendations, and active Orders (not Completed or Rejected). It links to food discovery, vendor discovery, the Protein Coach, daily progress, Orders, and the profile. With no active Order it shows an empty state that links to food discovery. | P1 |

### 3.7 Pillar 2, AI features

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R32 | AI reliability with throttling, caching, and fallback | No more than 1 request per second goes to the AI_Provider across all users, and no more than 1 AI request per 5 seconds per Consumer, both read from configuration. A request above a limit gets the fallback output within 1 second without calling the provider. A request with identical structured input, including the supplied verified values, is answered from a cache for 24 hours, and only requests that contain no user-written text are cached. An error, no response within 8 seconds, or a missing configuration gives the fallback output. With the provider disabled, every AI feature runs in fallback mode. AI text is labelled AI-generated and fallback text is labelled standard guidance. Each request is recorded with time, feature, outcome (AI response, cache hit, rate-limit fallback, error fallback, or invalid-output fallback), and latency, without message text or account identifiers. | P1 |
| R33 | AI output validation | The AI receives only verified data chosen by the engine or the catalogue, plus the Consumer's chat message, and must return structured output. The response is validated against its schema. A response is discarded, and the fallback is returned, when it is not valid, references an unknown listing, food, or Vendor identifier, or states a nutrition value, price, or quantity that differs from the supplied data. The interface renders every nutrition value, allergen indication, price, availability state, and Vendor detail from verified data, and shows AI text only as separate explanation. Allergen compatibility is decided from allergen flags and exclusions alone. The login identifier and display name are never sent to the AI. | P1 |
| R34 | AI-assisted explanations, preparation instructions, and recipe ideas | An explanation restates the reasons and the benefit statement in plain language of at most 60 words, and is labelled AI-generated. The fallback is the templated standard explanation that states every reason. Preparation instructions are numbered steps, and the fallback is the curated preparation notes of the food. A recipe idea uses up to 3 eligible Listings with distinct foods plus water, salt, cooking oil, and spices only, and the fallback lists the selected foods with Vendor, price, and preparation notes. | P1 |
| R35 | Protein Coach conversation | A message of 1 to 500 characters is combined with the goal, protein target, budget, exclusions, and eligible Listings. A valid reply appears with a card for every referenced Listing, rendered from verified data, with Add to cart. In fallback mode the reply is a scripted list of the top 3 recommendations, each with its standard explanation. Every request includes the benefit statements of all protein classes and, when the library holds them, the impact facts, and the AI is instructed to ground food-education answers in those statements. Message text is discarded when the session ends. A statement says the guidance is general food information and not medical advice. | P1 |

### 3.8 Pillar 2, Engagement and education

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R36 | Points and streaks | Points: 10 per logged meal (counted for at most 3 entries per WAT day), 25 once per day for reaching the protein target, 20 once per alternative-protein class for the first log of that class, and 100 for completing a challenge. A streak counts consecutive WAT days, ending today or yesterday, with at least one logged meal, and the longest streak is kept. Deleting a log recalculates logging, goal, and new-class points, the streak, and challenge progress, while awarded badges and challenge rewards stay. Total points and both streaks show on the home and profile screens. | P2 |
| R37 | Badges | The badge catalogue has 10 badges: First_Bite, Streak_3, Streak_7, Protein_Goal_Hit, five class explorer badges (Legume, Soy, Insect, Mushroom, and Seed_Nut), and Challenge_Champion. Each badge is awarded once on the first time its criterion is met, with the award date recorded. A notification names a new badge. The profile shows every badge with the award date or the criterion. | P2 |
| R38 | Alternative Protein Challenge | A Consumer joins the challenge and gets a 7-day window with progress 0 of 5. Logging an alternative-protein food not yet counted in the window adds 1. Reaching 5 completes the challenge, awards 100 points, and awards Challenge_Champion if not yet earned. A window that ends below 5 expires and the Consumer can join again. A Consumer has one active challenge at a time. The screen shows progress out of 5, time left, and the counted foods. Recommendations that would count toward the challenge are labelled Counts toward your challenge. | P2 |
| R39 | Health, environmental, animal-welfare, affordability, and sustainability information | The library holds at least one sourced fact for every combination of Protein_Class and Impact_Dimension. Numeric facts store value, unit, basis (for example per kg of protein), and source. Every fact shows an Estimate label and its source. Facts appear on the Listing detail screen, on the comparison screen, and on a learn screen, grouped by dimension, with a notice that figures are general estimates that vary by production system. A missing fact shows "No sourced estimate yet". Facts change only by loading a seed file. | P2 |

### 3.9 Cross-cutting quality

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R41 | Mobile-first responsive interface | Designed for a 360 px width first. No horizontal scrolling at 360, 768, and 1280 px. Primary actions have touch targets of at least 44 by 44 px. Loading, error, and empty states exist, and an error message names the failed action, offers a retry action, and shows no stack trace, status code, or internal identifier. Supported browsers: current and previous major versions of Chrome, Edge, Firefox, and Safari, plus Chrome on Android and Safari on iOS. Amounts use the Naira symbol and a thousands separator, and times use WAT. | P1 |
| R42 | Visual design and role-distinct experiences | Consumer, Vendor, and Administrator areas have separate navigation and a visible role label. Only navigation entries that the role permits are shown. Every Listing card, Vendor card, recommendation, and Listing detail shows an image. Daily protein progress is a visual indicator with numbers. One style guide covers colour, typography, spacing, and cards. | P1 |
| R43 | Basic accessibility | Text alternatives for informative images, visible labels on all inputs, contrast of at least 4.5 to 1 for body text and 3 to 1 for large text and component boundaries, full keyboard operation with a visible focus indicator, warnings that use text and an icon instead of colour alone, meaningful headings and landmarks, and support for 200 percent text zoom. | P1 |
| R44 | Performance | Discovery, search, filter, sort, and recommendations without an AI call respond within 1 second for 95 percent of requests at 50 concurrent users, 500 Listings, and 100 catalogue entries. Primary screens show main content within 3 seconds on a throttled 4G-class connection and a mid-range mobile CPU profile. Write actions respond within 2 seconds for 95 percent of requests. Deterministic recommendations appear first while an AI request is pending. The AI path returns an AI response or the fallback within 10 seconds. | P1 |
| R45 | Security controls | Passwords are stored only as salted one-way hashes. Secrets stay out of source control, client code, logs, and documentation, and are read from the environment or a secrets store at run time. The server validates every input. User-written text is rendered as text. Public deployments use HTTPS. Errors show generic messages. The AI_Provider is called only from server-side code. Uploaded files are served only with an image content type. | P1 |
| R46 | Security hardening | Administrator actions (vendor decisions, suspensions, listing and account state changes, catalogue changes) are written to an audit trail with administrator, action, target, and time. Audit entries list newest first and cannot be edited or deleted. After 5 consecutive failed logins for one identifier, further attempts are rejected for 15 minutes, and a successful login resets the count. | P2 |

### 3.10 Demonstration and delivery

| ID | Requirement | Key rules | Priority |
|---|---|---|---|
| R47 | Demo data and reset | The demo state is synthetic and has at least 1 Administrator, 2 Consumers, 3 Approved_Vendors, 1 Pending Vendor, and 20 Listings, of which at least 15 are orderable alternative proteins. It includes a sold-out Listing, a Listing with the Peanut flag, a Listing with the Insect flag, and a Listing of the Pending Vendor that Consumers cannot see. It includes the challenge and badge definitions, and every display name and business name begins with the word Demo. An Operator restores the demo state within 60 seconds and removes all other data. Demo logins and passwords are documented in the demonstration guide and are used for no other system. | P0 |
| R48 | Golden Path end to end | Approving the Pending Vendor makes the Vendor's Listings appear in food discovery. A new Consumer registers, completes onboarding with a goal, budget, and exclusions, and receives recommendations that meet R26, R27, and R28. The Consumer adds a recommendation to the cart and places an Order, and the Vendor sees the Order as Placed. The Vendor moves the Order through Accepted, Preparing, Ready_For_Pickup, and Completed, and the Consumer sees each status within 15 seconds. Every step works with the AI disabled. A presenter completes the path in 5 minutes or less. | P0 |
| R49 | Delivery and verification rules | A milestone is complete only with implementation, executed tests, and a recorded verification result. A feature is described as working only when a test or recorded manual check supports the statement. An unfinished feature gets a documented limitation and its defined functional fallback. Work is committed to Git at the end of each task and each working session. A task list tracks each task as not started, in progress, or done with a completion date. Each major architectural decision gets a concise record. AWS services and Bedrock models are verified before anything depends on them, and any AWS resource is created in us-east-1. Secrets stay outside the repository. Verification methods per tier are in section 7. | P0 |

### 3.11 Priority view

| Tier | Requirements |
|---|---|
| P0 | R1, R2, R3, R4, R5, R6, R7, R8, R14, R15, R16, R18, R19, R20, R21, R22, R23, R25, R26, R27, R28, R47, R48, R49 |
| P1 | R9, R10, R11, R12, R13, R17, R29, R30, R31, R32, R33, R34, R35, R41, R42, R43, R44, R45 |
| P2 | R24, R36, R37, R38, R39, R40, R46 |
| P3 | No requirements. Advanced analytics and unnecessary complexity are out of scope. |

## 4. Non-functional requirements

### NFR-1 Mobile-first responsiveness (R41, R42, P1)

| Aspect | Requirement |
|---|---|
| Design approach | Every screen is designed for a 360 CSS pixel width first, and layout enhancements are added at wider widths. The rule covers Consumer, Vendor, and Administrator screens, because Vendors handle Orders on phones. |
| Layout | No horizontal scrolling at 360, 768, and 1280 CSS pixels. |
| Touch | Touch targets of at least 44 by 44 CSS pixels for add to cart, place order, update order status, log a meal, and send a message. |
| States | Every data screen has a loading state, an error state, and an empty state. An error message names the failed action, offers a retry action, and shows no stack trace, status code, or internal identifier. |
| Visual quality | One style guide covers colour, typography, spacing, and card styles. Every Listing card, Vendor card, recommendation, and Listing detail shows an image. Daily protein progress is a visual indicator with the numbers beside the indicator. Consumer, Vendor, and Administrator areas have separate navigation and a visible role label. |
| Browsers | Current and previous major versions of Chrome, Edge, Firefox, and Safari, plus Chrome on Android and Safari on iOS. |
| Formats | Amounts show the Naira symbol and a thousands separator. Times show WAT. |

### NFR-2 Reliability of AI features with fallback (R32, R33, R34, R35, R44, P1)

Every AI feature has a deterministic fallback, so the product works when the AI is disabled, slow, busy, or wrong.

| AI feature | What the AI does | Fallback output |
|---|---|---|
| Recommendation explanation | Restates the reasons and the benefit statement in plain language, at most 60 words | Templated standard explanation that states every reason, plus the sourced benefit statement |
| Preparation instructions | Writes numbered preparation steps for a food | The curated preparation notes of the food |
| Recipe idea | Builds a recipe from up to 3 eligible Listings (distinct foods) plus water, salt, cooking oil, and spices | The selected foods with Vendor, price, and preparation notes |
| Protein Coach | Answers a message of 1 to 500 characters and references Listings that are in stock | A scripted list of the top 3 recommendations, each with the standard explanation |

| Condition | Required behavior |
|---|---|
| AI_Provider disabled or not configured | Every AI feature runs in fallback mode. |
| More than 1 request per second across all users | The fallback output returns within 1 second, and the provider is not called. The request is not queued. |
| More than 1 AI request per 5 seconds from one Consumer | Same as above. |
| Provider error | The fallback output is returned. |
| No provider response within 8 seconds | The fallback output is returned. |
| Response not valid for the schema, unknown identifier, or a nutrition value, price, or quantity that differs from the supplied data | The response is discarded and the fallback output is returned. |
| Identical structured input within 24 hours, with no user-written text | The cached response is returned without calling the provider. |

Further rules:

- **Limits are configuration values.** The global limit, the per-Consumer interval, the cache lifetime, and the timeout are read from configuration.
- **Never blocking.** Deterministic recommendations and the standard explanation appear first. The AI text replaces the standard explanation when a valid response arrives. An AI response or the fallback arrives within 10 seconds of the request.
- **Always labelled.** AI text carries an AI-generated label. Fallback text carries a standard-guidance label.
- **Observable.** Each request is recorded with time, feature, outcome (AI response, cache hit, rate-limit fallback, error fallback, or invalid-output fallback), and latency. The record holds no message text and no account identifier.
- **Server side only.** The AI_Provider is called from server-side code only.
- **No dependency from P0.** The Golden Path works with the AI disabled.

### NFR-3 Performance (R44, R20, R21, R47, P1)

| Measure | Target |
|---|---|
| Discovery, search, filter, sort, and recommendations without an AI call | Response within 1 second for at least 95 percent of requests |
| Test load | 50 concurrent users, 500 Listings, and 100 catalogue entries |
| Main content of each primary screen | Visible within 3 seconds of the first load, measured with browser developer tools throttled to a 4G-class connection and a mid-range mobile CPU profile |
| Write actions (place Order, update status, save Listing, log meal) | Response within 2 seconds for at least 95 percent of requests |
| AI path | An AI response or the fallback within 10 seconds |
| Order and status updates on the open Order screens | Visible within 15 seconds without a manual reload |
| Demo reset | Within 60 seconds |

### NFR-4 Basic accessibility (R43, P1)

| Check | Requirement |
|---|---|
| Text alternatives | Every informative image has a text alternative that uses the Listing title or the Vendor business name. |
| Labels | Every form input has a visible text label. |
| Contrast | At least 4.5 to 1 for body text, and at least 3 to 1 for large text and the boundaries of interface components. |
| Keyboard | Every function works with a keyboard, and the focused element shows a visible focus indicator. |
| Warnings | Allergen and exclusion warnings use text and an icon, so colour is never the only signal. |
| Structure | Headings and landmark regions reflect the structure of each screen. |
| Zoom | The interface supports browser text zoom up to 200 percent without loss of content or function. |

These checks are a basic subset aligned with common web accessibility guidance. The prototype does not claim full conformance with any accessibility standard.

## 5. Authentication and role-based access

### 5.1 Authentication requirements

| Topic | Requirement | Source |
|---|---|---|
| Registration | Email-format login identifier, display name of 2 to 40 characters, password of at least 8 characters, and a role of Consumer or Vendor. Identifiers are unique without regard to letter case. | R1 |
| Administrator accounts | Created only by seeding. The registration form never offers the Administrator role. | R1, A-19 |
| Login | A generic message for wrong credentials. A deactivated Account is told after valid credentials. | R2 |
| Session | Sessions end at logout and no later than 12 hours after the start. Ended sessions are rejected. | R2 |
| Password storage | Salted one-way hash. Passwords and hashes never appear in logs or responses. | R45 |
| Brute-force protection | After 5 consecutive failed logins for one identifier, attempts are rejected for 15 minutes. A successful login resets the count. | R46 (P2) |
| Not provided | Email verification, password recovery, social login, and multi-factor authentication. | A-02, section 10 |

### 5.2 Roles

| Role | Description |
|---|---|
| Visitor | A person who has not signed in. Sees only the landing, registration, and login screens. |
| Consumer | A student. Discovers vendors and foods, orders, tracks nutrition, and uses the AI features. |
| Vendor | A campus seller who owns exactly one Vendor_Profile and manages Listings and Orders. |
| Administrator | A platform administrator who approves vendors and manages the catalogue, Listings, users, and campus locations. |
| Operator | A project team member who runs seeding, reset, and export outside the web application. Operator procedures need no application role. |

### 5.3 Permission matrix

| Function | Visitor | Consumer | Vendor | Administrator |
|---|---|---|---|---|
| Landing, registration, and login screens | Yes | Yes | Yes | Yes |
| Log out | No | Yes | Yes | Yes |
| Vendor and food discovery, search, comparison, and learn screen | No | Yes | No | No |
| Recommendations, Protein Coach, and other AI features | No | Yes | No | No |
| Own profile, preferences, cart, orders, meal logs, points, badges, and challenges | No | Yes, own records | No | No |
| Place an Order | No | Yes | No | No |
| Own Vendor_Profile and verification submission | No | No | Yes, own record | No |
| Own Listings: create, edit, remove, availability, and images | No | No | Yes, own records | No |
| Incoming Orders, status updates, dashboard, and sales summary | No | No | Yes, own Orders | No |
| Vendor review: approve, reject, suspend, and reinstate | No | No | No | Yes |
| Catalogue management | No | No | No | Yes |
| Listing monitoring: list, disable, and enable | No | No | No | Yes |
| User management and campus locations | No | No | No | Yes |
| Platform overview and audit trail | No | No | No | Yes |
| Seeding, reset, and export | Operator procedure outside the application | | | |

Rules that apply to the whole matrix:

- The server enforces every rule on every request (R3). Hiding a navigation entry is not an access control.
- A request for a record that belongs to another user gets a not-found response.
- An unauthenticated request to a protected function is rejected as unauthenticated, and an unauthorised request is rejected as forbidden. Neither changes stored data.

### 5.4 Vendor verification and visibility

| Verification status | Visible to Consumers | Vendor can prepare Listings | New Orders |
|---|---|---|---|
| Not_Submitted | No | Yes, hidden | Not possible |
| Pending | No | Yes, hidden | Not possible |
| Approved | Yes, with Visible_Listings | Yes | Accepted |
| Rejected | No | Yes, hidden | Not possible |
| Suspended | No | Yes, hidden | Rejected. Existing Orders stay accessible to the Vendor and the Consumers. |

A deactivated Vendor Account hides the Vendor and the Vendor's Listings in the same way (R13).

## 6. Security and data handling

### 6.1 Principles

- The prototype holds only synthetic, public, or anonymized data.
- CampusProtein collects the least data that the features need.
- Sensitive categories (health measurements, medical details, payment details, and identity documents) are never collected, because no input for them exists.
- Secrets never appear in the repository, the client code, the logs, or the documents.

### 6.2 Data items that CampusProtein stores

| Data item | Purpose | Handling |
|---|---|---|
| Login identifier | Sign-in | Email format for familiarity. Synthetic. CampusProtein never sends email or verifies ownership. |
| Display name | Shown on screens and to a Vendor on incoming Orders | Synthetic name. 2 to 40 characters. |
| Password hash | Authentication | Salted one-way hash only. |
| Role | Access control | Consumer, Vendor, or Administrator. |
| Consumer profile fields | Personalization | Goal preset, protein target (20 to 200 g), budget (100 to 50000 Naira), exclusions chosen from fixed lists, and preferred classes. |
| Vendor profile fields | Storefront | Business name, description, campus location from a list, operating days and times, and an image. Synthetic business data. |
| Carts and Orders | Marketplace | Orders keep a snapshot of titles, prices, and quantities. No payment data. |
| Meal log entries | Daily progress and engagement | Nutrients are calculated from catalogue values at logging time. |
| Engagement records | Points, badges, and challenge progress | Derived from meal logs and awards. |
| Administrator audit entries | Accountability | Administrator, action, target, and time. |
| AI request records | Monitoring of AI behavior | Time, feature, outcome, and latency only. No message text and no account identifier. |
| Listings and images | Vendor-entered business data | Titles, prices, quantities, declared allergens, and images. |

Not collected: payment card, bank account, or mobile-money details; body measurements; medical conditions or diagnoses; free-text medical details; identity documents; and business registration numbers.

### 6.3 Controls

| Control | Requirement | Priority |
|---|---|---|
| Synthetic-data notice on landing, registration, onboarding, profile, and beside free-text inputs | R4 | P0 |
| Allergies and diets chosen only from fixed lists | R4, R25 | P0 |
| Server-side authorization on every request and object-level ownership checks | R3 | P0 |
| Session lifetime of at most 12 hours | R2 | P0 |
| Salted one-way password hashing, with no passwords or hashes in logs or responses | R45 | P1 |
| Secrets read from the environment or a secrets store, and kept out of Git, client code, logs, and documents | R45, R49 | P1 |
| Server-side validation of type, length, range, and permitted values for every input | R45 | P1 |
| User-written text rendered as text so that entered markup does not run | R45 | P1 |
| HTTPS for every public deployment | R45 | P1 |
| Generic error messages without stack traces, secrets, or internal identifiers | R45 | P1 |
| Image uploads limited to JPEG, PNG, and WebP up to 2 MB and served only with an image content type | R9, R45 | P1 |
| AI calls made only from server-side code | R45 | P1 |
| Audit trail of Administrator actions | R46 | P2 |
| Login throttling after 5 consecutive failures for 15 minutes | R46 | P2 |

### 6.4 AI-specific safeguards

- The AI receives only verified data selected by the engine or the catalogue, plus the Consumer's own chat message (R33).
- The login identifier and the display name are never sent to the AI (R33).
- Allergen compatibility is decided from allergen flags and exclusions alone. AI text never decides it (R33).
- The interface renders every nutrition value, allergen indication, price, availability state, and Vendor detail from verified data. AI text appears only as separate explanation (R33).
- AI output that is invalid, references unknown identifiers, or states values that differ from the supplied data is discarded (R33).
- Only responses to requests without user-written text are cached. Chat messages are discarded when the session ends. Request records hold no message text (R32, R35).

### 6.5 Responsible-use statements

- Allergen information comes from reference data and Vendor declarations. A statement on every Listing detail tells the Consumer to confirm allergens with the Vendor before eating (R16). The flags are an aid and not a medical guarantee.
- Nutrition values are estimates based on the reference catalogue entry, and Vendor recipes vary (R16).
- Protein targets are generic educational reference values and not medical advice. The Protein Coach screen says that the guidance is general food information (R35).
- Environmental, animal-welfare, affordability, and sustainability figures are labelled Estimate and show their source (R39).

### 6.6 Data lifecycle

All prototype data is synthetic. The reset procedure restores the demo state and removes all other data (R47).

## 7. Testing and verification strategy

### 7.1 Principles

- A feature counts as working only when an executed automated test or a recorded manual check supports the statement (R49). Documents, demonstrations, and status reports follow the same rule.
- A milestone is complete only when it includes the implementation, the executed tests, and a recorded verification result (R49).
- Deterministic logic is tested automatically, including property-based tests that generate varied inputs. AI behavior is tested against a stubbed provider. Visual, responsive, and accessibility criteria get recorded manual checks.
- Tests use synthetic data and the seeded demo state. P0 and P1 tests need no AWS account and no Bedrock access.
- The P0 checks run before every demonstration.

### 7.2 Test types

| Test type | What it covers | Examples |
|---|---|---|
| Unit tests | Pure logic | Nutrition scaling, eligibility filters, ranking score, order status transitions, streak calculation, points rules, fallback explanation template |
| Property-based tests | Rules that must hold for all inputs | The targets in section 7.4 |
| API and integration tests | Server behavior against a test database | Registration, login, the permission matrix, Listing management, cart, checkout, stock, order lifecycle, seed loading, Administrator actions |
| AI behavior tests with a stubbed provider | Throttling, caching, validation, and fallback | Every condition in the NFR-2 table |
| End-to-end tests | Browser-driven user journeys | The Golden Path (P0) and the main P1 journeys |
| Manual checks | Visual, responsive, accessibility, and content criteria | The checklists in section 7.6 |
| Performance check | Response times under load | A load script at 50 concurrent users with 500 Listings and 100 catalogue entries |
| Security checks | Secrets, authorization, and input handling | A secret scan of the repository, permission tests, and tests that markup in user text is shown as text |
| Live AI smoke test | One real call to the chosen provider | Run once, only after AWS and model access are verified, and never a dependency of other tests |

### 7.3 Verification by priority tier

| Tier | What must pass | Evidence | When |
|---|---|---|---|
| P0 | The automated end-to-end test of the Golden Path (R48) with the AI disabled. Automated tests of the rules that the path depends on: R1 to R8, R14 to R16, R18 to R23, R25 to R28. The timed demo reset (R47) of at most 60 seconds. | Saved test output in the milestone record | Every milestone that touches P0 code, and before every demonstration |
| P1 | Automated unit and API tests for deterministic rules. AI behavior tests with a stubbed provider. Recorded manual checks for responsive layout at 360, 768, and 1280 px, the accessibility checklist, and the visual review against the style guide. The performance check at the stated load. A repository secret scan. | Test output plus a manual-check record with date, device or emulation, and result | At the completion of each P1 area |
| P2 | Automated tests of the rules for points, streaks, badges, challenge windows (including WAT day boundaries), deletion recalculation, dataset round trip, audit trail, and login throttling. A recorded manual check of content, sources, and Estimate labels. | Test output and a content-check record | At the completion of the P2 milestone |
| P3 | None. P3 items are not built. | Not applicable | Not applicable |

### 7.4 Property-based test targets

| Area | Properties checked with generated inputs |
|---|---|
| Recommendation eligibility (R26) | Every returned item is orderable, from an Approved_Vendor, an alternative protein, at or under the budget, free of exclusion conflicts, and matches the food need and the location when they are set. Items from unapproved or suspended Vendors, sold-out items, and conventional foods do not appear. |
| Recommendation ranking (R27) | The same inputs give the same order. At most 10 items are returned. For each goal, changing only the goal-relevant attribute moves a Listing in the expected direction. Ties follow lower price, then Listing identifier. |
| Nutrition calculation (R22) | Per-serving values equal per 100 g values multiplied by grams and divided by 100. Scaling by n servings is linear. Display rounding does not change calculated values. Accepted entries have protein plus carbohydrate plus fat of at most 100 g per 100 g. |
| Stock and orders (R19, R20) | Stock is never negative, including when Orders are interleaved. For a sequence of Orders and status changes with no manual quantity edits, the stock equals the initial stock minus the quantities of Orders that are not Rejected. A failed Order leaves stock unchanged. A rejected Order restores exactly the ordered quantities. |
| Order status (R20) | Only the five permitted transitions succeed. Every other transition fails and leaves the state unchanged. |
| Cart (R18) | Each line holds 1 to 10 units and at most the available quantity. The Cart total equals the sum of the line totals. The Cart holds one Vendor. |
| Streak and points (R36) | The streak equals the longest run of consecutive WAT days that ends today or yesterday. Meal-logging points are awarded for at most 3 entries per day. Goal points are awarded at most once per day. New-class points are awarded at most once per class. Recalculating after a deletion equals recomputing from the remaining logs. |
| Challenge (R38) | Progress equals the number of distinct counted foods in the window. Completion happens at 5. Expiry happens at the end of the window. |
| Seed loading and export (R23, R24) | Loading the same file twice gives the same stored data. Export followed by load gives an equal catalogue. An invalid file loads nothing. |
| AI validation (R33) | Any generated response that is malformed, references an unknown identifier, or states a different nutrition value, price, or quantity leads to the fallback output. |
| Access control (R3) | For generated pairs of user and record, access is allowed only when the permission matrix allows it. Records of other users return not found. |

### 7.5 AI behavior tests

Each condition in the NFR-2 table has an automated test against the stubbed provider: provider disabled, global rate limit, per-Consumer rate limit, provider error, timeout at 8 seconds, invalid schema, unknown identifier, mismatched numeric value, and cache hit. A further test confirms that the request record contains no message text and no account identifier, and that no request carries the login identifier or the display name.

### 7.6 Manual check lists

- **Responsive.** Open each primary screen at 360, 768, and 1280 px. Confirm that nothing scrolls horizontally, that primary actions work by touch with targets of at least 44 by 44 px, and that loading, error, and empty states appear.
- **Accessibility.** Walk through the Golden Path with the keyboard only. Confirm the visible focus indicator, the labels, the text alternatives, the contrast ratios, the warning icons beside text, and the layout at 200 percent zoom. Run an automated accessibility scan if one is available.
- **Visual design.** Review every P1 screen against the style guide. Confirm the role-distinct navigation and role label, images on all cards, the progress indicator, and uncluttered cards.
- **Content and sources.** Confirm that every catalogue entry names a public source, that benefit statements and impact facts show a source and the Estimate label, that every demo display name and business name begins with the word Demo, and that no real personal data, credentials, or keys appear on screen or in the repository.

### 7.7 Verification record and definition of done

Each milestone keeps a verification record with these fields: milestone, requirement numbers covered, date, tester, environment, tests run, result, manual checks done, defects found and fixed, and any limitation or fallback in use.

A milestone is done when:

1. The implementation works end to end with the demo state.
2. The planned tests are written and executed, and the results are recorded.
3. The verification record exists.
4. The documents match the behavior that was tested.
5. The work is committed to Git and the task list is updated.

## 8. Constraints

### Environment and schedule

- The project is a time-limited AWS hackathon. The prototype must be demonstrably functional, and overengineering is avoided.
- The design prefers a modular monolith over microservices and keeps infrastructure simple, with a small architecture of approximately 3 to 5 major services.
- Any AWS resource is created in the us-east-1 region.
- AWS service access and Bedrock model access are not verified. No requirement assumes a specific AWS service or a specific Bedrock model, and each is verified before anything depends on it.
- The workspace starts empty and is not yet a Git repository. Installed tooling, as reported: Node.js v24.22.3, npm 11.19.1, Python 3.11.18, and Git 2.50.1.

### Data and secrets

- The prototype uses synthetic, public, or anonymized data only. It never uses personal, sensitive, financial, or health data.
- Secrets are never exposed in code, logs, documents, or the repository.

### AI

- The Bedrock guidance of about 1 request per second per person applies. The AI features use request throttling, caching, and a graceful deterministic fallback when the AI is unavailable or rate limited.
- The AI never invents nutrition values, allergy safety, prices, availability, or vendor information. Deterministic backend logic and structured data decide nutrition calculations, allergies and exclusions, budget filtering, food availability, vendor selection, protein calculations, and recommendation ranking.

### Process

- Work is built in working milestones. Each milestone includes implementation, testing, and verification.
- Work is archived to Git frequently: at the end of each task and each working session.
- A clear documentation trail exists. Major architectural decisions are documented concisely. A task list is maintained and updated.
- Working features are preferred over mock buttons. When a feature cannot be completed, the limitation is documented and the best functional fallback is implemented.
- No document, demonstration, or status report claims that something works unless it has been tested.

### Product

- The product serves Veritas University, Nigeria. Amounts are in Naira, times are in WAT, and the interface language is English.
- The interface is mobile-first and responsive, modern, youthful, and friendly. It is nature-inspired but not a generic green agriculture dashboard.
- The prototype is easy to demonstrate to judges: a synthetic demo state, a reset within 60 seconds, and a Golden Path that takes 5 minutes or less.
- Demonstration scale is up to 50 concurrent users, 500 Listings, and 100 catalogue entries.

### Priority order

P0 first (a working end-to-end experience), then P1 (marketplace, accounts, discovery, inventory, orders, the nutrition and recommendation engine, a polished responsive interface, and reliable AI), then P2 (streaks, points, badges, challenges, and environmental and sustainability information). P3 (advanced analytics and unnecessary complexity) is not built.

## 9. Assumptions and resolved decisions

The following decisions were resolved without asking the user. Each can be revisited in the design phase. The identifiers are stable and are reused in other project documents.

### Data, privacy, and safety

- **A-01 Synthetic data only.** The prototype holds only synthetic demo data or anonymized data. The Web_Interface tells users not to enter real personal, health, or financial information. Allergies and dietary exclusions are selections from fixed lists (ten Allergen_Categories and three Diet_Categories) with no free-text medical details. No payment card, bank, or mobile-money data is collected. Body measurements are never collected, and protein targets come from goal presets.
- **A-02 Login identifier.** The login identifier has an email format for familiarity, but CampusProtein never sends email, never verifies ownership of an address, and offers no email-based password recovery. Users are told to use made-up addresses such as demo.student1@example.com. The reset procedure restores demo Accounts.
- **A-03 Diet labels.** The Diet_Category list contains Vegetarian, Vegan, and Pescatarian. Religion-linked labels such as halal are left out because composition data cannot verify them and because such labels could reveal religious belief. Edible insects are treated as animal-derived foods, so the curator does not flag them as Vegetarian, Vegan, or Pescatarian compatible.
- **A-04 Allergen safety.** The effective Allergen_Flags of a Listing are the union of the Catalogue_Entry flags and the Vendor declarations. The Web_Interface states that allergen data comes from reference data and Vendor declarations and must be confirmed with the Vendor. The flags are an aid and not a medical guarantee. Insect is an Allergen_Category so that Consumers can avoid insect-based foods for any reason.

### Nutrition data and recommendations

- **A-05 Verified nutrition database.** The Nutrition_Dataset is a curated seed dataset built from public food-composition sources, with a Source_Attribution per food and values stated per 100 g and per Standard_Serving. Candidate sources are the [FAO/INFOODS Food Composition Table for Western Africa (2019)](https://openknowledge.fao.org/items/f817f8ff-fb99-44d3-ba9e-2168da12e389), [USDA FoodData Central](https://fdc.nal.usda.gov/) (published as public domain under CC0), and published analyses for foods that neither source covers, such as edible insects. Verified means curated and attributed, not clinically validated. Displayed values are estimates because Vendor recipes vary.
- **A-06 Source of truth.** Nutrition values, allergen flags, prices, quantities, availability, and Vendor data come only from the structured data and from Vendor-entered Listings. The AI_Assistant never supplies or alters these values.
- **A-07 Listing unit.** One Listing unit equals one Standard_Serving of exactly one Catalogue_Entry. Vendors choose the closest entry. If a food is missing, an Administrator adds the entry. Vendor-requested catalogue entries and Listings without a Catalogue_Entry are out of scope.
- **A-08 Alternative protein for the Nigerian campus context.** Alternative_Protein covers five Protein_Classes: Legume (for example cowpea beans, moi moi, akara, bambara groundnut), Soy_Product (for example soy milk and tofu), Edible_Insect (for example crickets, termites, and palm weevil larvae), Mushroom, and Seed_or_Nut (for example groundnut and melon seed). Conventional animal proteins (beef, goat, pork, poultry, fish, eggs, and dairy) appear only as comparison foods and as loggable foods, and the Recommendation_Engine never recommends them.
- **A-09 Budget meaning.** The Food_Budget is the maximum price of one Listing. Daily spend tracking and multi-item meal plans within a budget are out of scope.
- **A-10 Goal presets.** The default Daily_Protein_Target is 90 g for Build_Muscle and 55 g for the other presets, adjustable from 20 g to 200 g. The values are generic educational reference values and not medical advice. The 55 g default is close to the 56 g that the adult protein [Recommended Dietary Allowance of 0.8 g per kg body weight](https://pubmed.ncbi.nlm.nih.gov/26797090/) gives for an illustrative 70 kg adult. CampusProtein never asks for body weight.
- **A-11 Ranking weights.** The ranking weights are configuration values chosen in the design phase. The ordering rules in Requirement 27 are the testable behavior.
- **A-12 Default profile values.** A new Consumer_Profile has the Nutrition_Goal Eat_Healthier, a Daily_Protein_Target of 55 g, a Food_Budget of 2000 Naira, and no Exclusions or Preferred_Protein_Classes.

### Marketplace

- **A-13 Prototype orders.** No real payment is processed. Pay at pickup is the only payment option, and campus pickup is the only fulfilment method. The Order_Status lifecycle is Placed, Accepted, Preparing, Ready_For_Pickup, and Completed, with Rejected as the alternative end state that only the Vendor sets. Consumer cancellation, delivery, refunds, and ratings are out of scope.
- **A-14 Cart rules.** A Cart holds lines from one Vendor. Each line holds 1 to 10 units and no more than the available quantity.
- **A-15 Vendor verification.** Vendor verification is an Administrator approval of a completed Vendor_Profile. No identity documents are collected. Only Approved_Vendors and their Visible_Listings appear in discovery and recommendations. Vendors may prepare Listings before approval.
- **A-16 Operating hours.** Operating days and times are informational. The Marketplace accepts Orders at any time of day.
- **A-17 Campus locations.** Campus_Locations are synthetic placeholder names managed by Administrators. Discovery by location uses a list and a filter. An interactive campus map is P3.
- **A-18 Food images.** Vendors upload images where Image_Upload is enabled (JPEG, PNG, or WebP up to 2 MB). The functional fallback is the Seed_Image library of public-domain, openly licensed, or team-created images, from which Vendors can also choose, so every Listing always shows an image.
- **A-19 Access model.** Visitors see only the landing, registration, and login screens. Guest browsing is out of scope. Administrator Accounts are created only by seeding.
- **A-20 Locale.** The interface language is English, amounts are whole Naira, and times use WAT.

### AI

- **A-21 AI availability.** AWS service access and Bedrock model access are unverified. The AI_Provider is chosen in the design phase after verification. P0 never depends on the AI_Provider. With the AI_Provider disabled, each AI feature has a deterministic Fallback_Output: the Fallback_Explanation for explanations, the Preparation_Notes for preparation instructions, a list of foods with Preparation_Notes for recipe ideas, and a scripted list of the top 3 Recommendations for the Protein_Coach.
- **A-22 Rate limits and caching.** The guidance of about 1 Bedrock request per second per person is applied conservatively as 1 request per second across the whole prototype and 1 request per 5 seconds per Consumer, both configurable. A request above a limit receives the Fallback_Output immediately and is not queued. Responses to requests without user-written text are cached for 24 hours, and an AI call that takes longer than 8 seconds falls back.
- **A-23 AI privacy.** No Account identifier is sent to the AI_Provider, Protein_Coach messages are discarded when the session ends, and the AI request record contains no message text.

### Gamification and education

- **A-24 Engagement rules.** The Points_Table, the Streak definition, the Badge_Catalogue, and the Alternative_Protein_Challenge are defined in the Glossary. Challenge and Badge definitions are seeded and not editable in the Admin_Console. Leaderboards are out of scope.
- **A-25 Educational estimates.** Health, environmental, animal-welfare, affordability, and sustainability figures are curated static educational estimates that are stored in the Seed_Dataset_File, each with a Source_Attribution and the label Estimate. The figures describe Protein_Classes and not individual Listings. Candidate sources include the FAO report [Edible insects: future prospects for food and feed security (2013)](https://openknowledge.fao.org/items/4867d008-2840-4315-b958-59fe6dbd13ea) and [Poore and Nemecek (2018), Science](https://www.science.org/doi/10.1126/science.aaq0216). Where no sourced estimate exists, the Web_Interface displays "No sourced estimate yet". The affordability that drives ranking is the Protein_Value, which CampusProtein computes from real Listing prices and verified protein values.

### Delivery

- **A-26 AWS and region.** AWS resources, if used, are created in us-east-1 after access is verified. Technology choices are deferred to the design phase.
- **A-27 Demonstration scale.** Performance targets apply at up to 50 concurrent users, 500 Listings, and 100 Catalogue_Entries.
- **A-28 Functional fallbacks.** Where a feature cannot be completed in time, the fallback is: seed images instead of uploads (A-18), Fallback_Output instead of AI text (A-21), a list and a filter instead of a campus map (A-17), and seeded demo data instead of live vendor onboarding for judges who skip the vendor steps.

## 10. Out of scope

The following items are P3 or are excluded from the prototype.

- Advanced analytics, forecasting, and reporting beyond Requirements 10 and 40.
- Real payment processing, delivery, refunds, vendor payouts, ratings, and reviews.
- Multi-vendor carts and delivery logistics.
- Native mobile applications, offline use, push notifications, email, and SMS.
- An interactive campus map and device location.
- Medical or clinical nutrition advice and any calculation that uses body measurements.
- Leaderboards, social features, and Administrator editing of Challenge and Badge definitions.
- Password recovery, social login, and multi-factor authentication.
- Vendor identity-document verification, vendor-requested catalogue entries, barcode scanning, and image recognition.
- Languages other than English.

## 11. Known tensions and where they are resolved

| Tension | Resolution | Assumption and requirements |
|---|---|---|
| The project forbids personal, sensitive, financial, and health data, yet Consumers set goals, budgets, allergies, and preferences | Only synthetic or anonymized data. A notice tells users not to enter real personal, health, or financial information. Allergies and diets come from fixed lists with no free-text medical details. No payment card or bank data is collected. Protein targets come from presets, and body measurements are never asked. | A-01, A-03, A-10, R4, R25 |
| A verified nutrition database is required, and AI must not invent facts | The database is a curated seed dataset built from public food-composition sources, with a source attribution per food and values per 100 g and per serving. Nutrition values, allergen flags, prices, availability, and vendor data come only from this data and from vendor-entered Listings. | A-05, A-06, A-07, R22, R23, R33 |
| Orders need no real payment | Prototype orders with pay at pickup, campus pickup only, and a status lifecycle that Vendors update. | A-13, R19, R20, R21 |
| Vendors must be verified | Verification is an Administrator approval workflow. Only Approved_Vendors and their available Listings appear in discovery and recommendations. | A-15, R6, R7 |
| Food imagery is wanted but uploads may not be feasible | Vendor uploads where enabled, with a fallback to curated seed images, so every Listing shows an image. | A-18, R9 |
| Bedrock guidance is about 1 request per second per person | Throttling, caching, and a deterministic fallback for every AI feature. P0 never depends on the AI. | A-21, A-22, R32, R33, R34, R35 |
| "Alternative protein" and impact figures need a clear meaning | A definition for the Nigerian campus context with five classes. Impact figures are curated static educational estimates with sources, labelled as estimates. | A-08, A-25, R39 |

## 12. Items to verify in later phases

These items are open on purpose. They are carried forward and must be verified before anything depends on them.

1. AWS account access, and the availability of every AWS service in us-east-1 that the design proposes.
2. Bedrock model access, quotas, and observed request-rate behavior. A live AI smoke test follows once access is verified.
3. Whether file storage for Vendor image uploads exists in the hackathon environment. If it does not, the Seed_Image fallback delivers the feature (A-18).
4. The license of every Seed_Image (R9).
5. Public-source values, citations, and reuse terms for each catalogue entry (R23), including edible insects and Nigerian dishes that the cited tables may not list. The reuse terms of each source are confirmed before values are copied into the seed file.
6. Whether real campus location names may replace the synthetic placeholders (A-17).
7. The ranking weights (A-11), tuned against the demo data.
8. The seed file schema and the AI response schema, which the design phase defines.
