# Requirements Document

## Introduction

CampusProtein is a campus-based alternative-protein ecosystem for Veritas University, Nigeria. It connects students with campus vendors that sell alternative proteins, and it uses personalized nutrition recommendations, AI food guidance, gamification, and educational impact information to encourage healthier and more sustainable eating habits. The product is a functional hackathon prototype built in a time-limited AWS environment (region us-east-1). It is not a mock-up: every feature in the P0 and P1 tiers must work end to end with synthetic data.

The product has two pillars:

1. **Campus Marketplace**: Consumers discover vendors and foods, build a cart, and place prototype orders for campus pickup. Vendors manage a storefront, listings, and orders. Administrators approve vendors and manage the food catalogue, listings, and users.
2. **Nutrition and Alternative-Protein Recommendation System**: Consumers set goals, a budget, and exclusions, and receive recommendations for alternative-protein foods that are actually available from approved vendors. A deterministic Recommendation_Engine computes every nutrition value, allergen check, price, availability, and ranking. An AI_Assistant only produces conversational guidance, explanations, preparation instructions, and food education from supplied Verified_Data, and a deterministic fallback exists for every AI feature.

The central journey is: food recommendation, then nutritional reason, then benefit explanation, then available campus vendor, then purchase action.

### Priority tiers

Each requirement carries one priority tag that follows the project development priority.

- **P0**: The thinnest working end-to-end experience (the Golden_Path) and the foundations it needs. P0 never depends on the AI_Provider.
- **P1**: The complete prototype: marketplace, consumer and vendor accounts, product discovery, vendor inventory and orders, the nutrition and recommendation engine, a polished responsive interface, and AI integration that works reliably.
- **P2**: Streaks, points, badges, challenges, and environmental and sustainability information, plus supporting tooling that is not on the demonstration path.
- **P3**: Advanced analytics and any complexity beyond the above. P3 items are listed under Out of Scope and carry no requirement.

### Scope boundaries

- The prototype holds only synthetic, public, or anonymized data. Real personal, sensitive, financial, and health data are out of scope (see Requirement 4).
- No requirement assumes that a specific AWS service or a specific Bedrock model is available. AWS access and model access are unverified at the time of writing and are verified in a later phase.
- Technical architecture, technology stack, database design, AI architecture, and deployment belong to the design phase. Milestones, risks, and the development sequence belong to the tasks phase.

## Glossary

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

## Requirements

### Requirement 1: Account Registration

**User Story:** As a student or a campus vendor, I want to create an account for my role, so that I can use the features intended for that role.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Visitor submits a registration form with a login identifier in email format, a display name of 2 to 40 characters, a password of at least 8 characters, and the role Consumer or Vendor, THE Access_Control SHALL create an Account with the selected role.
2. IF the submitted login identifier matches an existing Account identifier, compared without regard to letter case, THEN THE Access_Control SHALL reject the registration and display a message that the identifier is already in use.
3. IF a registration field fails validation, THEN THE Access_Control SHALL reject the registration and display a message for each invalid field.
4. THE Access_Control SHALL offer only the roles Consumer and Vendor on the registration form.
5. WHEN a registration succeeds, THE Access_Control SHALL start an authenticated session and display the onboarding flow of Requirement 25 for a Consumer and the Vendor_Profile form of Requirement 5 for a Vendor.

### Requirement 2: Login, Logout, and Session

**User Story:** As a registered user, I want to sign in and out securely, so that only I can use my account.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Visitor submits the login identifier and password of an active Account, THE Access_Control SHALL start an authenticated session and display the home screen for the role of the Account.
2. IF the submitted login identifier or password is incorrect, THEN THE Access_Control SHALL reject the login with one generic message that does not reveal which value was incorrect.
3. WHEN a user submits valid credentials of a deactivated Account, THE Access_Control SHALL reject the login and display a message that the Account is deactivated.
4. WHEN a user selects logout, THE Access_Control SHALL end the session and reject every later request that presents the ended session.
5. THE Access_Control SHALL end each authenticated session no later than 12 hours after the session started.

### Requirement 3: Role-Based Access Control

**User Story:** As a platform owner, I want every function restricted to the correct role and the correct owner, so that Consumers, Vendors, and Administrators can only see and change what is theirs to manage.

**Priority:** P0

#### Acceptance Criteria

1. WHILE a user is a Visitor, THE Access_Control SHALL permit access only to the landing, registration, and login screens.
2. IF a request for a protected function carries no valid session, THEN THE Access_Control SHALL reject the request as unauthenticated and make no change to stored data.
3. IF a signed-in user requests a function that the role of the user does not permit, THEN THE Access_Control SHALL reject the request as forbidden and make no change to stored data.
4. THE Access_Control SHALL restrict Vendor functions (Vendor_Profile, Listing management, incoming Orders, and sales summary) to the Vendor role and to records owned by the requesting Vendor.
5. THE Access_Control SHALL restrict Consumer functions (vendor and food discovery, search, comparison, the learn screen, Recommendations, Consumer_Profile, Cart, Orders, Meal_Log_Entries, Protein_Coach, Points, Badges, and Challenges) to the Consumer role and, for personal records, to records owned by the requesting Consumer.
6. THE Access_Control SHALL restrict Admin_Console functions to the Administrator role.
7. WHEN a user requests a record that belongs to another user and the role of the requesting user grants no access to that record, THE Access_Control SHALL respond as if the record does not exist.
8. THE Access_Control SHALL perform every authorization check on the server for every request, independent of the navigation shown in the Web_Interface.

### Requirement 4: Prototype Data Notice and Data Minimization

**User Story:** As a platform owner, I want the prototype to hold only synthetic or anonymized data, so that no real personal, sensitive, financial, or health information is collected.

**Priority:** P0

#### Acceptance Criteria

1. THE Web_Interface SHALL display a notice on the landing, registration, Consumer onboarding, and Consumer profile screens stating that the prototype accepts only synthetic data and that users must not enter real personal, health, or financial information.
2. THE CampusProtein SHALL store only these user data items: login identifier, display name, password hash, role, Consumer_Profile fields, Vendor_Profile fields, Carts, Orders, Meal_Log_Entries, engagement records (Points, Badges, and Challenge progress), and Administrator audit entries.
3. THE Web_Interface SHALL provide no input field for payment card, bank account, or mobile-money details.
4. THE Web_Interface SHALL provide no input field for body measurements, medical conditions, or diagnoses.
5. THE Web_Interface SHALL accept allergies and dietary exclusions only as selections from the Allergen_Category list and the Diet_Category list.
6. THE Web_Interface SHALL display the notice from criterion 1 next to every free-text input that accepts text written by a user, including the Protein_Coach message box.

### Requirement 5: Vendor Profile and Operating Information

**User Story:** As a Vendor, I want to create my storefront profile with my campus location and operating information, so that Consumers know who I am and where to collect orders.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Vendor Account is created, THE Marketplace SHALL create an empty Vendor_Profile owned by the Vendor with the Verification_Status Not_Submitted.
2. WHEN a Vendor saves a Vendor_Profile with a business name of 2 to 60 characters, a description of at most 300 characters, one active Campus_Location, at least one operating day, an opening time, and a closing time, THE Marketplace SHALL store the Vendor_Profile.
3. IF the closing time is not later than the opening time, THEN THE Marketplace SHALL reject the Vendor_Profile and display a validation message.
4. IF a Vendor_Profile field fails validation, THEN THE Marketplace SHALL reject the save and display a message for each invalid field.
5. WHEN a Vendor edits the Vendor_Profile, THE Marketplace SHALL display the updated values in every Consumer-facing view on the next page load.
6. THE Marketplace SHALL use operating days and times for display only and SHALL accept Orders regardless of the time of day.

### Requirement 6: Vendor Verification Submission

**User Story:** As a Vendor, I want to submit my storefront for verification and see the outcome, so that Consumers can find my listings once I am approved.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Vendor with a complete Vendor_Profile submits the Vendor_Profile for verification while the Verification_Status is Not_Submitted or Rejected, THE Marketplace SHALL set the Verification_Status to Pending.
2. IF a Vendor submits an incomplete Vendor_Profile for verification, THEN THE Marketplace SHALL reject the submission and list the missing fields.
3. THE Marketplace SHALL display the current Verification_Status on the Vendor dashboard and, when the status is Rejected, the reason entered by the Administrator.
4. WHILE the Verification_Status is not Approved, THE Marketplace SHALL let the Vendor create and edit Listings that remain hidden from Consumers until the Vendor is approved.
5. THE Marketplace SHALL base verification on the content of the Vendor_Profile alone and SHALL provide no field for identity documents or business registration numbers.

### Requirement 7: Administrator Vendor Review

**User Story:** As an Administrator, I want to review and approve or reject vendors, so that only vetted vendors appear to Consumers.

**Priority:** P0

#### Acceptance Criteria

1. THE Admin_Console SHALL list all Vendor_Profiles with the Verification_Status Pending, oldest submission first, together with the full content of each Vendor_Profile.
2. WHEN an Administrator approves a Pending Vendor_Profile, THE Marketplace SHALL set the Verification_Status to Approved and record the Administrator and the decision time.
3. WHEN an Administrator rejects a Pending Vendor_Profile and enters a reason of 5 to 200 characters, THE Marketplace SHALL set the Verification_Status to Rejected and store the reason.
4. IF an Administrator rejects a Vendor_Profile without a reason of 5 to 200 characters, THEN THE Admin_Console SHALL refuse the decision and request a valid reason.
5. WHEN an Administrator suspends an Approved Vendor_Profile, THE Marketplace SHALL set the Verification_Status to Suspended.
6. WHEN an Administrator reinstates a Suspended Vendor_Profile, THE Marketplace SHALL set the Verification_Status to Approved.
7. WHILE the Verification_Status of a Vendor is not Approved, THE Marketplace SHALL exclude the Vendor and the Listings of the Vendor from vendor discovery, food discovery, search results, and recommendations.
8. WHILE a Vendor is Suspended, THE Marketplace SHALL reject new Orders for the Listings of the Vendor and keep existing Orders accessible to the Vendor and to the Consumers who placed the Orders.

### Requirement 8: Vendor Listing Management

**User Story:** As a Vendor, I want to add, edit, and remove food listings with price, quantity, and availability, so that Consumers see what I currently sell.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Vendor with a complete Vendor_Profile submits a new Listing with an active Catalogue_Entry, a title of 2 to 60 characters, a Listing_Type, a price of 1 to 50000 Naira, and an available quantity of 0 to 999, THE Marketplace SHALL create the Listing owned by the Vendor and flagged Available.
2. IF a Listing field fails validation, THEN THE Marketplace SHALL reject the change and display a message for each invalid field.
3. IF a Vendor with an incomplete Vendor_Profile attempts to create a Listing, THEN THE Marketplace SHALL reject the creation and ask the Vendor to complete the Vendor_Profile first.
4. WHEN a Vendor selects a Catalogue_Entry for a Listing, THE Marketplace SHALL display the Core_Nutrients per Standard_Serving, the Allergen_Flags, and the Source_Attribution of the Catalogue_Entry to the Vendor.
5. THE Marketplace SHALL let a Vendor declare additional Allergen_Categories for a Listing from the Allergen_Category list and SHALL calculate the effective Allergen_Flags of the Listing as the union of the Catalogue_Entry flags and the declared allergens.
6. WHEN a Vendor edits the title, price, available quantity, declared allergens, or availability flag of an owned Listing, THE Marketplace SHALL save the change and display the updated values in every Consumer-facing view on the next page load.
7. WHEN a Vendor marks a Listing Unavailable, THE Marketplace SHALL remove the Listing from every Consumer-facing view and from recommendations.
8. WHEN a Vendor removes an owned Listing, THE Marketplace SHALL remove the Listing from every Consumer-facing view and from recommendations and SHALL keep the item lines of existing Orders unchanged.
9. WHILE the available quantity of a Visible_Listing is 0, THE Marketplace SHALL display the Listing as Sold out in Consumer-facing views and exclude the Listing from recommendations.

### Requirement 9: Food Images with Fallback

**User Story:** As a Vendor, I want to add images to my storefront and listings, so that Consumers see appealing food even when I have no photo.

**Priority:** P1

#### Acceptance Criteria

1. WHERE Image_Upload is enabled, WHEN a Vendor uploads a JPEG, PNG, or WebP file of at most 2 MB for an owned Listing or the owned Vendor_Profile, THE Marketplace SHALL store the file and use the file as the image of that Listing or Vendor_Profile.
2. IF an uploaded file has another file type or exceeds 2 MB, THEN THE Marketplace SHALL reject the upload, keep the existing image, and display the accepted file types and the size limit.
3. THE Marketplace SHALL let a Vendor choose a Seed_Image as the image of an owned Listing or the owned Vendor_Profile, whether or not Image_Upload is enabled.
4. WHILE a Listing has no Vendor-chosen image, THE Web_Interface SHALL display the Seed_Image of the linked Catalogue_Entry.
5. WHILE neither a Vendor-chosen image nor a Seed_Image exists for a Listing, THE Web_Interface SHALL display the placeholder illustration of the style guide.
6. THE Nutrition_Catalogue SHALL record the source and the license of every Seed_Image, and each license SHALL be public domain, an open license with attribution, or a creation of the Project_Team.
7. WHERE the license of a Seed_Image requires attribution, THE Web_Interface SHALL display the attribution on the detail screen of every Listing that shows the Seed_Image.

### Requirement 10: Vendor Dashboard and Sales Summary

**User Story:** As a Vendor, I want a dashboard with a simple sales and order summary, so that I can run my storefront without spreadsheets.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Vendor opens the dashboard, THE Marketplace SHALL display the Verification_Status, the number of Orders in each Order_Status, and the number of Listings that are Available (flagged Available with a quantity of at least 1), Sold out (flagged Available with a quantity of 0), and Unavailable (flagged Unavailable).
2. WHEN a Vendor selects the period Today, Last 7 days, or All time, THE Marketplace SHALL display, for Orders placed within that period in WAT, the number of Orders in each Order_Status, the total value in Naira of Completed Orders, and the units sold per Listing for Completed Orders.
3. THE Marketplace SHALL calculate the dashboard and the sales summary from the Orders of the requesting Vendor only.
4. WHEN the Order_Status of an Order changes, THE Marketplace SHALL reflect the change in the dashboard counts and the sales summary on the next request.

### Requirement 11: Administrator Catalogue Management

**User Story:** As an Administrator, I want to manage food catalogue entries, so that every Listing is linked to curated nutrition and allergen data.

**Priority:** P1

#### Acceptance Criteria

1. WHEN an Administrator submits a new Catalogue_Entry with a name, Protein_Class, Food_Type, Standard_Serving, Core_Nutrients per 100 g, Allergen_Flags, Diet_Compatibility, Source_Attribution, and Preparation_Notes, THE Nutrition_Catalogue SHALL store the Catalogue_Entry as active.
2. IF a Catalogue_Entry has an empty Source_Attribution, a negative nutrient value, a Standard_Serving of 0 g or less, or a sum of protein, carbohydrate, and fat per 100 g above 100 g, THEN THE Nutrition_Catalogue SHALL reject the entry and state the violated rule.
3. WHEN an Administrator edits a Catalogue_Entry, THE Nutrition_Catalogue SHALL apply the new values to every linked Listing in Consumer-facing views on the next page load.
4. WHEN an Administrator deactivates a Catalogue_Entry, THE Marketplace SHALL remove every linked Listing from Consumer-facing views and from recommendations.
5. WHEN an Administrator reactivates a Catalogue_Entry, THE Marketplace SHALL restore every linked Listing that satisfies the other conditions of a Visible_Listing.

### Requirement 12: Administrator Listing Monitoring

**User Story:** As an Administrator, I want to monitor all listings and take down inappropriate ones, so that Consumers see only suitable offerings.

**Priority:** P1

#### Acceptance Criteria

1. THE Admin_Console SHALL list all Listings with Vendor, Catalogue_Entry, price, available quantity, availability flag, and visibility state, and SHALL support filtering by Vendor and by visibility state.
2. WHEN an Administrator disables a Listing and enters a reason of 5 to 200 characters, THE Marketplace SHALL remove the Listing from Consumer-facing views and from recommendations and display the disabled state and the reason to the owning Vendor.
3. IF an Administrator disables a Listing without a reason of 5 to 200 characters, THEN THE Admin_Console SHALL refuse the action and request a valid reason.
4. WHEN an Administrator enables a disabled Listing, THE Marketplace SHALL restore the Listing to the visibility determined by the settings of the owning Vendor and the Catalogue_Entry.

### Requirement 13: Administrator User and Platform Data Management

**User Story:** As an Administrator, I want to manage user accounts and basic platform data, so that I can keep the prototype tidy and safe during a demonstration.

**Priority:** P1

#### Acceptance Criteria

1. THE Admin_Console SHALL list Accounts with login identifier, display name, role, state, and creation time, and SHALL support filtering by role and searching by login identifier or display name.
2. WHEN an Administrator deactivates an Account, THE Access_Control SHALL end the active sessions of the Account and reject later logins of the Account.
3. WHEN an Administrator reactivates an Account, THE Access_Control SHALL permit logins of the Account again.
4. IF an Administrator attempts to deactivate the Administrator's own Account, THEN THE Admin_Console SHALL reject the action.
5. WHEN an Administrator adds a Campus_Location with a name of 2 to 60 characters or renames a Campus_Location, THE Admin_Console SHALL update the Campus_Location list used by Vendor_Profiles and Consumer filters.
6. WHEN an Administrator deactivates a Campus_Location that no Vendor_Profile references, THE Admin_Console SHALL remove the Campus_Location from the list offered for new selections.
7. IF an Administrator deactivates a Campus_Location that a Vendor_Profile references, THEN THE Admin_Console SHALL reject the action and name the referencing Vendors.
8. WHILE the Account of a Vendor is deactivated, THE Marketplace SHALL exclude the Vendor and the Listings of the Vendor from Consumer-facing views and from recommendations.

### Requirement 14: Consumer Profile

**User Story:** As a Consumer, I want a profile that holds my display name and eating preferences, so that CampusProtein can personalize what I see.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer Account is created, THE CampusProtein SHALL create a Consumer_Profile with the Nutrition_Goal Eat_Healthier, a Daily_Protein_Target of 55 g, a Food_Budget of 2000 Naira, empty Exclusions, and empty Preferred_Protein_Classes.
2. WHEN a Consumer saves a display name of 2 to 40 characters, THE CampusProtein SHALL update the display name of the Account.
3. THE Web_Interface SHALL display on the profile screen the display name, Nutrition_Goal, Daily_Protein_Target, Food_Budget, Exclusions, and Preferred_Protein_Classes of the Consumer.

### Requirement 15: Vendor Browsing and Campus Location Discovery

**User Story:** As a Consumer, I want to browse vendors and find them by campus location, so that I can collect food close to where I am.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer opens vendor discovery, THE Marketplace SHALL display every Approved_Vendor with business name, image, Campus_Location, operating days, and operating hours, sorted by business name ascending.
2. WHEN a Consumer selects a Campus_Location, THE Marketplace SHALL display only the Approved_Vendors at that Campus_Location.
3. WHEN a Consumer opens a Vendor profile, THE Marketplace SHALL display the Vendor_Profile and every Visible_Listing of the Vendor that has no Exclusion_Conflict for the Consumer, each with image, title, price, protein per Standard_Serving, and availability state.
4. IF no Approved_Vendor matches the selected Campus_Location, THEN THE Web_Interface SHALL display an empty-state message with a control that clears the Campus_Location filter.

### Requirement 16: Food Browsing and Food Detail

**User Story:** As a Consumer, I want to browse available foods and see price, nutrition, availability, and vendor, so that I can decide what to buy.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer opens food discovery, THE Marketplace SHALL display the Visible_Listings that have no Exclusion_Conflict for the Consumer, sorted by title ascending, each with image, title, Vendor name, Campus_Location, price in Naira, protein per Standard_Serving, and availability state.
2. WHEN a Consumer opens the detail of a Listing, THE Marketplace SHALL display the title, image, Vendor name with a link to the Vendor profile, Campus_Location, price, availability state, Core_Nutrients per Standard_Serving and per 100 g, Protein_Class, effective Allergen_Flags, Diet_Compatibility, and Source_Attribution.
3. THE Web_Interface SHALL label every nutrition value shown for a Listing as an estimate based on the reference Catalogue_Entry.
4. THE Web_Interface SHALL display on every Listing detail screen a statement that allergen information comes from reference data and Vendor declarations and that the Consumer must confirm allergens with the Vendor before eating.
5. WHEN a Consumer opens the detail of a Listing that has an Exclusion_Conflict, THE Web_Interface SHALL display a warning that names each conflicting Allergen_Category and Diet_Category.
6. WHERE the Exclusions of a Consumer hide at least one Listing from a list, THE Web_Interface SHALL display the number of hidden Listings on that list.
7. WHILE a Listing is Sold out, THE Web_Interface SHALL disable the add-to-cart control of the Listing and display the label Sold out.

### Requirement 17: Search, Filter, and Sort

**User Story:** As a Consumer, I want to search, filter, and sort foods, so that I can find what fits my needs quickly.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer enters search text, THE Marketplace SHALL return the Visible_Listings without an Exclusion_Conflict whose title, Catalogue_Entry name, or Vendor business name contains the text, compared without regard to letter case.
2. THE Marketplace SHALL support filtering Listings by Listing_Type, Protein_Class, Food_Type, Campus_Location, minimum price, maximum price, and minimum protein per Standard_Serving.
3. WHEN a Consumer applies two or more filters, THE Marketplace SHALL return only the Listings that satisfy every applied filter.
4. THE Marketplace SHALL support the sort orders title ascending (default), price ascending, price descending, protein per Standard_Serving descending, and Protein_Value descending.
5. IF no Listing matches the search text and the filters, THEN THE Web_Interface SHALL display an empty-state message with a control that clears the search text and the filters.

### Requirement 18: Cart

**User Story:** As a Consumer, I want to add foods to a cart and adjust quantities, so that I can order several items from one vendor in one step.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer adds an Orderable_Listing with a quantity from 1 to 10 that does not exceed the available quantity, THE Marketplace SHALL add a line for the Listing to the Cart of the Consumer.
2. WHEN a Consumer adds a Listing that already has a Cart line, THE Marketplace SHALL add the requested quantity to the existing line within the limits of criterion 1.
3. IF the requested quantity exceeds the available quantity of the Listing, THEN THE Marketplace SHALL reject the change and display the available quantity.
4. IF a Consumer adds a Listing from a Vendor different from the Vendor of the lines already in the Cart, THEN THE Marketplace SHALL keep the Cart unchanged and offer to replace the Cart contents with the new Listing.
5. WHEN a Consumer changes the quantity of a Cart line or removes a Cart line, THE Marketplace SHALL update the Cart and recalculate the Cart total.
6. THE Marketplace SHALL display each Cart line with title, unit price, quantity, and line total in Naira, and SHALL display the Cart total as the sum of the line totals.
7. THE Marketplace SHALL keep the Cart of a Consumer across logins until the Consumer places an Order or removes every line.

### Requirement 19: Prototype Checkout and Order Placement

**User Story:** As a Consumer, I want to place a prototype order for campus pickup, so that I can reserve food from a vendor without paying online.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer places an Order from a non-empty Cart, THE Marketplace SHALL create one Order with the Order_Status Placed that contains the Vendor, the pickup Campus_Location, a snapshot of each item line (title, unit price, and quantity), the total in Naira, the placement time, and a unique Order_Code.
2. WHEN an Order is created, THE Marketplace SHALL reduce the available quantity of each ordered Listing by the ordered quantity and empty the Cart of the Consumer.
3. IF any Cart line is no longer an Orderable_Listing or exceeds the available quantity when the Consumer places the Order, THEN THE Marketplace SHALL create no Order, leave all available quantities unchanged, and report each affected line.
4. THE Marketplace SHALL keep the available quantity of every Listing at 0 or above, including when Consumers place Orders at the same moment.
5. THE Marketplace SHALL offer Pay at pickup as the only payment option and SHALL collect no payment details.
6. THE Web_Interface SHALL label the checkout screen and the Order confirmation as a prototype order for which no payment is taken online.
7. WHEN an Order is created, THE Web_Interface SHALL display the Order_Code, the Vendor name, the pickup Campus_Location, and the operating hours of the Vendor.

### Requirement 20: Vendor Order Management

**User Story:** As a Vendor, I want to receive orders and update their status, so that Consumers know when to collect their food.

**Priority:** P0

#### Acceptance Criteria

1. WHEN an Order is created, THE Marketplace SHALL show the Order to the owning Vendor with the Order_Code, the Consumer display name, the item lines, the total, the placement time, and the Order_Status Placed.
2. WHILE the incoming Orders screen of a Vendor is open, THE Marketplace SHALL show new Orders and Order_Status changes within 15 seconds without a manual page reload.
3. WHEN a Vendor changes the Order_Status of an owned Order, THE Marketplace SHALL permit only these transitions: Placed to Accepted, Accepted to Preparing, Preparing to Ready_For_Pickup, Ready_For_Pickup to Completed, and Placed to Rejected.
4. IF a Vendor requests an Order_Status transition outside the permitted list of criterion 3, THEN THE Marketplace SHALL reject the change and keep the Order_Status unchanged.
5. WHEN an Order becomes Rejected, THE Marketplace SHALL add the ordered quantities back to the available quantities of the Listings.
6. WHEN the Order_Status of an Order changes, THE Marketplace SHALL record the new status and the change time in the status history of the Order.
7. THE Marketplace SHALL list the Orders of a Vendor newest first and SHALL support filtering by Order_Status.

### Requirement 21: Consumer Order History and Status

**User Story:** As a Consumer, I want to see my orders and their current status, so that I know when my food is ready for pickup.

**Priority:** P0

#### Acceptance Criteria

1. THE Marketplace SHALL list the Orders of the signed-in Consumer newest first with Order_Code, Vendor name, total, placement time, and current Order_Status.
2. WHEN a Consumer opens an Order, THE Marketplace SHALL display the item lines, the total, the pickup Campus_Location, the current Order_Status, and the status history with change times.
3. WHILE the screen of an Order is open, THE Marketplace SHALL show Order_Status changes within 15 seconds without a manual page reload.
4. WHILE an Order has the Order_Status Ready_For_Pickup, THE Web_Interface SHALL highlight the Order_Code and the pickup Campus_Location on the screen of the Order.
5. WHILE an Order has the Order_Status Rejected, THE Web_Interface SHALL display a message that the Vendor could not fulfil the Order.

### Requirement 22: Nutrition Dataset and Calculations

**User Story:** As a Consumer, I want nutrition values that come from a curated public source, so that I can trust the numbers shown for each food.

**Priority:** P0

#### Acceptance Criteria

1. THE Nutrition_Catalogue SHALL hold, for every Catalogue_Entry, the Core_Nutrients per 100 g, a Standard_Serving in grams with a household description, a Protein_Class, a Food_Type, Allergen_Flags, Diet_Compatibility, and a Source_Attribution that names a public food-composition source.
2. THE Nutrition_Catalogue SHALL calculate each Core_Nutrient per Standard_Serving as the per 100 g value multiplied by the Standard_Serving grams and divided by 100.
3. THE Nutrition_Catalogue SHALL calculate the Core_Nutrients of a number of servings as the per Standard_Serving values multiplied by the number of servings.
4. THE Web_Interface SHALL display protein, carbohydrate, fat, and fibre in grams rounded to 1 decimal place and energy in whole kilocalories, while every calculation uses unrounded values.
5. THE Nutrition_Catalogue SHALL store, for every Protein_Class, a Benefit_Statement with a Source_Attribution.
6. THE Nutrition_Catalogue SHALL take every nutrition value and Allergen_Flag from the Nutrition_Dataset and from Vendor declarations, and no AI-generated value SHALL enter the Nutrition_Dataset.

### Requirement 23: Seed Dataset Loading

**User Story:** As a developer, I want a defined seed file that loads curated data into CampusProtein, so that the prototype starts with verified nutrition data and a demonstrable marketplace.

**Priority:** P0

#### Acceptance Criteria

1. WHEN the Seed_Loader receives a valid Seed_Dataset_File, THE Seed_Loader SHALL load the Catalogue_Entries, Protein_Class records, Campus_Locations, Impact_Facts, Badge definitions, and Challenge definitions that the file contains.
2. IF the Seed_Dataset_File is not valid JSON or violates the schema, THEN THE Seed_Loader SHALL reject the whole file, load no record, and report the location of each violation.
3. IF a Catalogue_Entry in the Seed_Dataset_File violates a rule of Requirement 11 criterion 2, THEN THE Seed_Loader SHALL reject the whole file, load no record, and name the Catalogue_Entry.
4. WHEN the Seed_Loader loads a Seed_Dataset_File whose records already exist, THE Seed_Loader SHALL update the existing records without creating duplicates, so that loading the same file twice yields the same stored data as loading the file once.
5. THE Project_Team SHALL deliver a Seed_Dataset_File that contains at least 30 Catalogue_Entries, of which at least 20 are Alternative_Proteins covering each of the five Alternative_Protein Protein_Classes and at least 5 are Conventional.
6. THE Project_Team SHALL build every Catalogue_Entry from a public food-composition source, state every value per 100 g, record the Source_Attribution, and provide Preparation_Notes for every Alternative_Protein Catalogue_Entry.

### Requirement 24: Dataset Export and Round-Trip

**User Story:** As a developer, I want to export the catalogue data to the seed file format, so that curated edits can be saved and the loading logic can be verified.

**Priority:** P2

#### Acceptance Criteria

1. WHEN an Operator requests an export, THE Dataset_Serializer SHALL write the Catalogue_Entries, Protein_Class records, Campus_Locations, Impact_Facts, Badge definitions, and Challenge definitions into a Seed_Dataset_File.
2. THE Dataset_Serializer SHALL write files that the Seed_Loader accepts.
3. FOR ALL valid catalogue states, loading the exported Seed_Dataset_File into an empty CampusProtein SHALL produce a catalogue equal to the exported catalogue (round-trip property).
4. FOR ALL valid Seed_Dataset_Files, loading, exporting, and loading again SHALL produce the same stored catalogue as the first load (round-trip property).

### Requirement 25: Consumer Nutrition Preferences and Onboarding

**User Story:** As a Consumer, I want to set my nutrition goal, food budget, and exclusions, so that recommendations match my needs without exposing personal health details.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer signs in for the first time, THE Web_Interface SHALL present an onboarding flow that collects the Nutrition_Goal, Food_Budget, Exclusions, and Preferred_Protein_Classes, and SHALL let the Consumer skip the flow and keep the default values.
2. THE Web_Interface SHALL offer the Nutrition_Goal presets Build_Muscle, Eat_Healthier, Save_Money, and Explore_Alternatives.
3. WHEN a Consumer selects a Nutrition_Goal, THE CampusProtein SHALL set the Daily_Protein_Target to the preset default: 90 g for Build_Muscle and 55 g for each other preset.
4. WHEN a Consumer enters a Daily_Protein_Target from 20 g to 200 g, THE CampusProtein SHALL store the value.
5. WHEN a Consumer enters a Food_Budget from 100 to 50000 Naira, THE CampusProtein SHALL store the value.
6. IF a Daily_Protein_Target or a Food_Budget is outside the permitted range, THEN THE CampusProtein SHALL reject the value and display the permitted range.
7. THE Web_Interface SHALL let a Consumer choose Exclusions only from the Allergen_Category list and the Diet_Category list, and SHALL let the Consumer choose zero or more Preferred_Protein_Classes from the five Alternative_Protein Protein_Classes.
8. WHEN a Consumer saves a change to the Consumer_Profile, THE Recommendation_Engine SHALL use the saved values for the next Recommendation_Request.

### Requirement 26: Recommendation Eligibility

**User Story:** As a Consumer, I want recommendations to include only foods that are available now and that fit my budget and exclusions, so that every recommendation is something I can actually buy and eat.

**Priority:** P0

#### Acceptance Criteria

1. WHEN a Consumer submits a Recommendation_Request, THE Recommendation_Engine SHALL compute the Eligible_Listings from Verified_Data only.
2. THE Recommendation_Engine SHALL include only Listings that are Orderable_Listings and whose Catalogue_Entry has a Protein_Class other than Conventional.
3. THE Recommendation_Engine SHALL include only Listings whose price does not exceed the Food_Budget.
4. THE Recommendation_Engine SHALL include only Listings that have no Exclusion_Conflict for the Consumer.
5. WHERE the Food_Need is Snack, Meal, or Drink, THE Recommendation_Engine SHALL include only Listings whose Catalogue_Entry has the Food_Type equal to the Food_Need.
6. WHERE a Campus_Location is selected, THE Recommendation_Engine SHALL include only Listings whose Vendor is at the selected Campus_Location.
7. THE Recommendation_Engine SHALL produce the Eligible_Listings without calling the AI_Provider.
8. IF no Eligible_Listing exists, THEN THE Recommendation_Engine SHALL return an empty result and THE Web_Interface SHALL display a message that offers to change the Food_Budget, the Food_Need, or the Campus_Location.

### Requirement 27: Recommendation Ranking

**User Story:** As a Consumer, I want the best matches for my goal ranked first, so that I can choose quickly.

**Priority:** P0

#### Acceptance Criteria

1. THE Recommendation_Engine SHALL rank Eligible_Listings by a score that combines protein per Standard_Serving, Protein_Value, the emphasis of the Nutrition_Goal, the Preferred_Protein_Classes, and the Protein_Classes logged by the Consumer in the previous 7 days, using weights defined in configuration.
2. WHEN the Nutrition_Goal is Build_Muscle and two Eligible_Listings differ only in protein per Standard_Serving, THE Recommendation_Engine SHALL rank the Listing with the higher protein per Standard_Serving first.
3. WHEN the Nutrition_Goal is Save_Money and two Eligible_Listings differ only in Protein_Value, THE Recommendation_Engine SHALL rank the Listing with the higher Protein_Value first.
4. WHEN the Nutrition_Goal is Explore_Alternatives and two Eligible_Listings differ only in whether the Consumer logged the Protein_Class in the previous 7 days, THE Recommendation_Engine SHALL rank the Listing whose Protein_Class was not logged first.
5. WHEN two Eligible_Listings differ only in whether the Protein_Class is one of the Preferred_Protein_Classes, THE Recommendation_Engine SHALL rank the Listing in a preferred Protein_Class first.
6. WHEN two Eligible_Listings have equal scores, THE Recommendation_Engine SHALL order the Listings by ascending price and then by ascending Listing identifier.
7. THE Recommendation_Engine SHALL return at most 10 Recommendations ordered by rank.
8. FOR ALL identical Recommendation_Requests and identical Verified_Data, THE Recommendation_Engine SHALL return the same ordered Recommendations (determinism property).

### Requirement 28: Recommendation Results, Reasons, and Purchase Action

**User Story:** As a Consumer, I want each recommendation to show why it suits me and where to get it, so that I can go from recommendation to purchase in one flow.

**Priority:** P0

#### Acceptance Criteria

1. WHEN the Recommendation_Engine returns Recommendations, THE Web_Interface SHALL display for each Recommendation the image, title, Vendor name, Campus_Location, price in Naira, and the protein, energy, carbohydrate, and fat per Standard_Serving.
2. THE Recommendation_Engine SHALL attach to each Recommendation the Recommendation_Reasons computed from Verified_Data: the protein per Standard_Serving, the percentage of the Daily_Protein_Target that one Standard_Serving supplies, the price compared with the Food_Budget, the Protein_Value, the statement that no Exclusion_Conflict exists, the match with the Nutrition_Goal, and the Vendor and Campus_Location.
3. THE CampusProtein SHALL display for each Recommendation the Fallback_Explanation or the AI-generated explanation defined in Requirement 34, together with the Benefit_Statement of the Protein_Class and the source of the Benefit_Statement.
4. THE Web_Interface SHALL provide on each Recommendation an Add to cart action, a link to the Listing detail screen, and a link to the Vendor profile.
5. WHEN a Consumer selects Add to cart on a Recommendation, THE Marketplace SHALL apply the rules of Requirement 18.
6. THE Web_Interface SHALL render every number shown on a Recommendation from Verified_Data.

### Requirement 29: Conventional and Alternative Protein Comparison

**User Story:** As a Consumer, I want to compare a conventional protein with an alternative option, so that I can see how the two foods differ and where to buy the alternative.

**Priority:** P1

#### Acceptance Criteria

1. THE Web_Interface SHALL provide a comparison screen that a Consumer can open from a Listing detail screen and from a Recommendation.
2. WHEN a Consumer selects one Conventional Catalogue_Entry and one Alternative_Protein Catalogue_Entry, THE Nutrition_Catalogue SHALL display the Core_Nutrients of both foods side by side per Standard_Serving and per 20 g of protein.
3. THE Web_Interface SHALL display for each Core_Nutrient the difference between the Alternative_Protein and the Conventional food, calculated from unrounded values.
4. WHEN the comparison screen is displayed, THE Marketplace SHALL list the Orderable_Listings of the Alternative_Protein Catalogue_Entry that have no Exclusion_Conflict for the Consumer, each with Vendor, Campus_Location, price, and an Add to cart action.
5. IF the Alternative_Protein Catalogue_Entry has no Orderable_Listing, THEN THE Web_Interface SHALL state that no campus Vendor currently offers the food.

### Requirement 30: Meal Logging and Daily Progress

**User Story:** As a Consumer, I want to log what I eat and see my progress toward my daily protein goal, so that I know how I am doing today.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer logs an active Catalogue_Entry with a number of servings from 0.5 to 10 in steps of 0.5, THE Progress_Tracker SHALL create a Meal_Log_Entry that stores the Catalogue_Entry, the number of servings, the logging time, and the Core_Nutrients computed from the Catalogue_Entry values at the logging time.
2. IF the number of servings is outside the permitted range, THEN THE Progress_Tracker SHALL reject the entry and display the permitted range.
3. THE Web_Interface SHALL let a Consumer start logging from a search of active Catalogue_Entries and from the item lines of the Orders of the Consumer.
4. WHEN a Consumer opens the daily progress screen, THE Progress_Tracker SHALL display for the selected WAT calendar day the Daily_Totals, the Daily_Protein_Target, the protein progress as a percentage of the target, the remaining protein in grams, and the list of Meal_Log_Entries.
5. WHEN the protein in the Daily_Totals reaches or exceeds the Daily_Protein_Target, THE Web_Interface SHALL show the progress indicator as goal reached.
6. WHEN a Consumer deletes an owned Meal_Log_Entry, THE Progress_Tracker SHALL remove the Meal_Log_Entry and recompute the Daily_Totals of the affected day.
7. WHEN a Catalogue_Entry is edited or deactivated, THE Progress_Tracker SHALL keep the Core_Nutrients of existing Meal_Log_Entries unchanged.

### Requirement 31: Consumer Home Dashboard

**User Story:** As a Consumer, I want a home screen that shows today's progress, recommendations, and my active orders, so that I can act without searching.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer opens the home screen, THE Web_Interface SHALL display the protein progress of the current WAT calendar day against the Daily_Protein_Target, the top 3 Recommendations for the current Consumer_Profile, and the Orders of the Consumer whose Order_Status is not Completed or Rejected.
2. THE Web_Interface SHALL provide on the home screen links to food discovery, vendor discovery, the Protein_Coach, daily progress, Orders, and the Consumer profile.
3. IF the Consumer has no active Order, THEN THE Web_Interface SHALL display an empty-state message with a link to food discovery.

### Requirement 32: AI Reliability with Throttling, Caching, and Fallback

**User Story:** As a Consumer, I want AI features to respond reliably, so that CampusProtein stays useful when the AI service is slow, busy, or unavailable.

**Priority:** P1

#### Acceptance Criteria

1. THE AI_Assistant SHALL send no more than 1 request per second to the AI_Provider, counted across all users, and SHALL read the limit from configuration.
2. THE AI_Assistant SHALL accept no more than 1 AI request per 5 seconds from the same Consumer, and SHALL read the interval from configuration.
3. IF an AI request would exceed a limit of criterion 1 or criterion 2, THEN THE AI_Assistant SHALL return the Fallback_Output within 1 second without calling the AI_Provider.
4. WHEN the AI_Assistant receives a request whose structured input, including the supplied Verified_Data values, is identical to the input of a response generated within the previous 24 hours, THE AI_Assistant SHALL return the cached response without calling the AI_Provider.
5. THE AI_Assistant SHALL cache only responses to requests that contain no text written by a user.
6. THE AI_Assistant SHALL include the supplied Verified_Data values in the cache key, so that a change of price, availability, nutrition value, or Allergen_Flag produces a new AI request.
7. IF the AI_Provider returns an error, does not respond within 8 seconds, or is not configured, THEN THE AI_Assistant SHALL return the Fallback_Output.
8. WHERE the AI_Provider is disabled by configuration, THE AI_Assistant SHALL operate in Fallback_Mode for every AI feature.
9. THE Web_Interface SHALL label AI-generated text as AI-generated and SHALL label Fallback_Output text as standard guidance.
10. WHEN the AI_Assistant handles a request, THE AI_Assistant SHALL record the time, the feature name, the outcome (AI response, cache hit, rate-limit fallback, error fallback, or invalid-output fallback), and the latency, and SHALL exclude message text and Account identifiers from the record.

### Requirement 33: AI Output Validation

**User Story:** As a platform owner, I want AI output checked against verified data, so that the AI never presents invented nutrition values, allergen claims, prices, availability, or vendor information.

**Priority:** P1

#### Acceptance Criteria

1. THE AI_Assistant SHALL supply the AI_Provider only with Verified_Data selected by the Recommendation_Engine or the Nutrition_Catalogue, together with the message written by the Consumer in the Protein_Coach, and SHALL request Structured_AI_Output.
2. WHEN the AI_Provider returns a response, THE AI_Assistant SHALL validate the response against the response schema before the response is used.
3. IF a response is not valid Structured_AI_Output, THEN THE AI_Assistant SHALL discard the response and return the Fallback_Output.
4. IF a response references a Listing, Catalogue_Entry, or Vendor identifier that was not in the supplied data, THEN THE AI_Assistant SHALL discard the response and return the Fallback_Output.
5. IF the text of a response states a nutrition value, price, or quantity that differs from the supplied Verified_Data, THEN THE AI_Assistant SHALL discard the response and return the Fallback_Output.
6. THE Web_Interface SHALL render every nutrition value, allergen indication, price, availability state, and Vendor detail from Verified_Data and SHALL render AI-generated text only as separate explanatory text.
7. THE Recommendation_Engine SHALL determine the allergen compatibility of every food from Allergen_Flags and Exclusions only, independent of any AI-generated text.
8. THE AI_Assistant SHALL exclude the login identifier and the display name of the Consumer from every request to the AI_Provider.

### Requirement 34: AI-Assisted Explanations, Preparation Instructions, and Recipe Ideas

**User Story:** As a Consumer, I want a clear explanation of why a food suits me and simple preparation guidance, so that I can understand and use the food.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer opens the explanation of a Recommendation, THE AI_Assistant SHALL request from the AI_Provider a plain-language explanation of at most 60 words that restates the Recommendation_Reasons and the Benefit_Statement.
2. WHEN the AI_Provider returns a valid explanation, THE Web_Interface SHALL display the explanation labeled as AI-generated.
3. WHILE the AI_Assistant is in Fallback_Mode for an explanation, THE Recommendation_Engine SHALL provide the Fallback_Explanation that states every Recommendation_Reason in a fixed template.
4. WHEN a Consumer requests preparation instructions for a Catalogue_Entry, THE AI_Assistant SHALL request numbered preparation steps from the AI_Provider, supplying the Catalogue_Entry and the Preparation_Notes.
5. WHILE the AI_Assistant is in Fallback_Mode for preparation instructions, THE Web_Interface SHALL display the Preparation_Notes of the Catalogue_Entry.
6. WHEN a Consumer requests a recipe idea, THE Recommendation_Engine SHALL select up to 3 Eligible_Listings with distinct Catalogue_Entries, and THE AI_Assistant SHALL request from the AI_Provider a recipe that uses only the selected foods and the pantry items water, salt, cooking oil, and spices.
7. WHILE the AI_Assistant is in Fallback_Mode for a recipe idea, THE Web_Interface SHALL list the selected foods with Vendor, price, and Preparation_Notes.

### Requirement 35: Protein Coach Conversation

**User Story:** As a Consumer, I want to ask food and nutrition questions in a chat, so that I get friendly guidance that points to foods I can buy on campus.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer sends a message of 1 to 500 characters in the Protein_Coach, THE AI_Assistant SHALL build a request from the message, the Nutrition_Goal, Daily_Protein_Target, Food_Budget, and Exclusions of the Consumer, and the Eligible_Listings computed by the Recommendation_Engine.
2. IF a message is empty or longer than 500 characters, THEN THE Protein_Coach SHALL reject the message and display the permitted length.
3. WHEN the AI_Provider returns a valid reply, THE Protein_Coach SHALL display the reply text together with a card for each Listing that the reply references, rendered from Verified_Data with an Add to cart action.
4. WHILE the AI_Assistant is in Fallback_Mode, THE Protein_Coach SHALL reply with a scripted message that lists the top 3 Recommendations for the Consumer_Profile, each with the Fallback_Explanation of the Recommendation.
5. THE AI_Assistant SHALL include the Benefit_Statements of all Protein_Classes in every Protein_Coach request and SHALL instruct the AI_Provider to ground food-education answers in the supplied statements.
6. WHERE the Impact_Library holds Impact_Facts, THE AI_Assistant SHALL also include the Impact_Facts in every Protein_Coach request.
7. THE Protein_Coach SHALL discard message text when the session ends.
8. THE Web_Interface SHALL display on the Protein_Coach screen a statement that the guidance is general food information and not medical advice.

### Requirement 36: Points and Streaks

**User Story:** As a Consumer, I want to earn points and keep a streak for logging my meals, so that I stay motivated to eat well.

**Priority:** P2

#### Acceptance Criteria

1. WHEN a Consumer creates a Meal_Log_Entry, THE Gamification_Engine SHALL award the meal-logging Points of the Points_Table for at most 3 Meal_Log_Entries per WAT calendar day.
2. WHEN the protein in the Daily_Totals of a WAT calendar day first reaches the Daily_Protein_Target, THE Gamification_Engine SHALL award the goal Points of the Points_Table once for that day.
3. WHEN a Consumer logs a Catalogue_Entry of an Alternative_Protein Protein_Class for the first time, THE Gamification_Engine SHALL award the new-class Points of the Points_Table once for that Protein_Class.
4. THE Gamification_Engine SHALL calculate the Streak and the longest Streak of a Consumer from the WAT calendar days that contain at least one Meal_Log_Entry.
5. WHEN a Consumer deletes a Meal_Log_Entry, THE Gamification_Engine SHALL recalculate the meal-logging Points, goal Points, new-class Points, Streak, and Challenge progress from the remaining Meal_Log_Entries and SHALL keep the Badges and Challenge rewards already awarded.
6. THE Web_Interface SHALL display the total Points, the Streak, and the longest Streak on the Consumer home screen and the Consumer profile screen.

### Requirement 37: Badges

**User Story:** As a Consumer, I want to earn badges for milestones, so that I can see my progress and be rewarded for trying new foods.

**Priority:** P2

#### Acceptance Criteria

1. WHEN a Consumer meets the criterion of a Badge in the Badge_Catalogue for the first time, THE Gamification_Engine SHALL award the Badge once and record the award date.
2. WHEN a Consumer earns a Badge, THE Web_Interface SHALL display a notification that names the Badge.
3. THE Web_Interface SHALL display on the Consumer profile screen every Badge of the Badge_Catalogue, showing the award date for earned Badges and the criterion for unearned Badges.

### Requirement 38: Alternative Protein Challenge

**User Story:** As a Consumer, I want to join a challenge that rewards me for trying different alternative proteins, so that eating new foods becomes a game.

**Priority:** P2

#### Acceptance Criteria

1. THE Gamification_Engine SHALL offer the Alternative_Protein_Challenge to every Consumer.
2. WHEN a Consumer joins the Alternative_Protein_Challenge, THE Gamification_Engine SHALL start a 7-day window at the joining time with a progress of 0 out of 5.
3. WHEN a Consumer creates a Meal_Log_Entry for an Alternative_Protein Catalogue_Entry that the active window has not yet counted, THE Gamification_Engine SHALL increase the progress by 1.
4. WHEN the progress reaches 5 within the window, THE Gamification_Engine SHALL mark the Challenge as Completed, award 100 Points, and award the Challenge_Champion Badge if the Consumer has not earned the Badge.
5. WHEN the 7-day window ends with a progress below 5, THE Gamification_Engine SHALL mark the Challenge as Expired and permit the Consumer to join again.
6. THE Gamification_Engine SHALL permit one active Alternative_Protein_Challenge per Consumer.
7. WHILE a Challenge is active, THE Web_Interface SHALL display the progress as a count out of 5, the remaining time, and the names of the counted foods.
8. WHILE a Challenge is active, THE Web_Interface SHALL mark each Recommendation whose Catalogue_Entry the Challenge has not yet counted with the label Counts toward your challenge.

### Requirement 39: Health, Environmental, Animal-Welfare, Affordability, and Sustainability Information

**User Story:** As a Consumer, I want educational information about the health, environmental, animal-welfare, affordability, and sustainability effects of foods, so that I understand the wider benefits of alternative proteins.

**Priority:** P2

#### Acceptance Criteria

1. THE Impact_Library SHALL hold at least one Impact_Fact with a Source_Attribution for every combination of Protein_Class and Impact_Dimension.
2. THE Impact_Library SHALL store for each numeric Impact_Fact the value, the unit, the basis of the value (for example per kg of protein), and the Source_Attribution.
3. THE Web_Interface SHALL display every Impact_Fact with the label Estimate and with the Source_Attribution.
4. THE Web_Interface SHALL display on the Listing detail screen the Impact_Facts of the Protein_Class of the Listing grouped by Impact_Dimension, and on the comparison screen the Impact_Facts of both compared Protein_Classes.
5. THE Web_Interface SHALL provide a learn screen that lists the Impact_Facts of each Protein_Class grouped by Impact_Dimension.
6. THE Web_Interface SHALL display next to Impact_Facts a notice that the figures are general educational estimates that vary by production system and do not describe the individual Listing.
7. IF the Impact_Library holds no Impact_Fact for a Protein_Class and an Impact_Dimension, THEN THE Web_Interface SHALL display the text "No sourced estimate yet" for that Impact_Dimension.
8. THE Impact_Library SHALL change only when the Seed_Loader loads a Seed_Dataset_File.

### Requirement 40: Administrator Platform Overview

**User Story:** As an Administrator, I want a simple overview of platform activity, so that I can monitor the prototype during a demonstration.

**Priority:** P2

#### Acceptance Criteria

1. WHEN an Administrator opens the platform overview, THE Admin_Console SHALL display the number of Accounts by role, the number of Vendor_Profiles by Verification_Status, the number of Listings by visibility state, and the number of Orders by Order_Status, calculated at request time.

### Requirement 41: Mobile-First Responsive Interface

**User Story:** As a student using a phone, I want every screen to work well on a small screen, so that I can use CampusProtein between classes.

**Priority:** P1

#### Acceptance Criteria

1. THE Web_Interface SHALL be designed for a viewport width of 360 CSS pixels first and SHALL add layout enhancements at wider viewports.
2. THE Web_Interface SHALL render every screen without horizontal scrolling at viewport widths of 360, 768, and 1280 CSS pixels.
3. THE Web_Interface SHALL provide touch targets of at least 44 by 44 CSS pixels for every primary action: add to cart, place order, update Order_Status, log a meal, and send a message.
4. WHILE a screen waits for data, THE Web_Interface SHALL display a loading state.
5. IF a request fails, THEN THE Web_Interface SHALL display an error message that names the failed action and offers a retry action, and that shows no stack trace, status code, or internal identifier.
6. IF a list contains no records, THEN THE Web_Interface SHALL display an empty-state message.
7. THE Web_Interface SHALL function in the current and the previous major versions of Chrome, Edge, Firefox, and Safari, and in Chrome on Android and Safari on iOS.
8. THE Web_Interface SHALL display amounts in Naira with the ₦ symbol and a thousands separator, and SHALL display times in WAT.

### Requirement 42: Visual Design and Role-Distinct Experiences

**User Story:** As a student, I want a modern, friendly, image-rich interface that clearly separates the consumer and vendor experiences, so that CampusProtein feels like a product I would use.

**Priority:** P1

#### Acceptance Criteria

1. THE Web_Interface SHALL present the Consumer, Vendor, and Administrator areas with separate navigation and a visible role label, so that a user can tell which area is active.
2. THE Web_Interface SHALL display only the navigation entries that the role of the signed-in user permits.
3. THE Web_Interface SHALL show an image on every Listing card, Vendor card, Recommendation, and Listing detail screen.
4. THE Web_Interface SHALL display progress toward the Daily_Protein_Target as a visual progress indicator together with the numeric values.
5. THE Web_Interface SHALL apply one style guide of colours, typography, spacing, and card styles to all screens.

### Requirement 43: Basic Accessibility

**User Story:** As a student with a visual or motor impairment, I want to use the main features with assistive technology and a keyboard, so that I am not excluded from healthy food choices.

**Priority:** P1

#### Acceptance Criteria

1. THE Web_Interface SHALL provide a text alternative for every informative image, using the title of the Listing or the business name of the Vendor.
2. THE Web_Interface SHALL associate a visible text label with every form input.
3. THE Web_Interface SHALL provide a contrast ratio of at least 4.5 to 1 for body text and at least 3 to 1 for large text and for the boundaries of interface components.
4. THE Web_Interface SHALL make every function operable with a keyboard and SHALL display a visible focus indicator on the focused element.
5. THE Web_Interface SHALL present allergen and Exclusion_Conflict warnings with text and an icon, so that colour is not the only means of conveying the warning.
6. THE Web_Interface SHALL use heading levels and landmark regions that reflect the structure of each screen.
7. THE Web_Interface SHALL support browser text zoom up to 200 percent without loss of content or function.

### Requirement 44: Performance

**User Story:** As a student on a mobile connection, I want screens and actions to respond quickly, so that using CampusProtein does not slow down my day.

**Priority:** P1

#### Acceptance Criteria

1. WHEN a Consumer requests discovery, search, filter, sort, or Recommendations without an AI call, THE CampusProtein SHALL respond within 1 second for at least 95 percent of requests, measured with 50 concurrent users, 500 Listings, and 100 Catalogue_Entries.
2. THE Web_Interface SHALL display the main content of each primary screen within 3 seconds of the first load, measured with browser developer tools throttled to a 4G-class connection and a mid-range mobile CPU profile.
3. WHEN a user submits a write action (placing an Order, updating an Order_Status, saving a Listing, or logging a meal), THE CampusProtein SHALL respond within 2 seconds for at least 95 percent of requests under the load of criterion 1.
4. WHILE an AI request is pending, THE Web_Interface SHALL display the deterministic Recommendations with the Fallback_Explanation and SHALL replace the Fallback_Explanation when a valid AI response arrives.
5. THE AI_Assistant SHALL return either an AI response or the Fallback_Output within 10 seconds of the request.

### Requirement 45: Security Controls

**User Story:** As a platform owner, I want basic security controls applied across the prototype, so that accounts, secrets, and data stay protected during the hackathon.

**Priority:** P1

#### Acceptance Criteria

1. THE Access_Control SHALL store each password only as a salted one-way hash and SHALL exclude passwords and password hashes from logs and responses.
2. THE CampusProtein SHALL keep credentials, keys, and tokens out of source control, client-delivered code, logs, and documentation, and SHALL read the credentials, keys, and tokens from environment configuration or a secrets store at run time.
3. THE CampusProtein SHALL validate every input on the server for type, length, range, and permitted values before the input is used.
4. THE Web_Interface SHALL render text written by users (display names, business names, descriptions, titles, and chat messages) as text, so that entered markup is not executed.
5. WHERE CampusProtein is reachable over a public network, THE CampusProtein SHALL serve all traffic over HTTPS.
6. IF an error occurs, THEN THE CampusProtein SHALL display a generic message and SHALL exclude stack traces, secrets, and internal identifiers from the message.
7. THE CampusProtein SHALL call the AI_Provider only from server-side code.
8. WHERE Image_Upload is enabled, THE Marketplace SHALL serve uploaded files only with an image content type.

### Requirement 46: Security Hardening

**User Story:** As a platform owner, I want an audit trail of administrator actions and protection against repeated password guessing, so that misuse is limited and traceable.

**Priority:** P2

#### Acceptance Criteria

1. WHEN an Administrator approves or rejects a Vendor_Profile, suspends or reinstates a Vendor, disables or enables a Listing, deactivates or reactivates an Account, or creates, edits, or deactivates a Catalogue_Entry, THE Admin_Console SHALL record an audit entry with the Administrator, the action, the target, and the time.
2. THE Admin_Console SHALL display audit entries newest first and SHALL provide no function to edit or delete an audit entry.
3. IF 5 consecutive login attempts for one login identifier fail, THEN THE Access_Control SHALL reject further login attempts for that login identifier for 15 minutes.
4. WHEN a login succeeds, THE Access_Control SHALL reset the count of failed login attempts for the login identifier.

### Requirement 47: Demo Data and Reset

**User Story:** As a hackathon presenter, I want a repeatable synthetic demo state, so that judges see a working product with realistic data every time.

**Priority:** P0

#### Acceptance Criteria

1. THE Project_Team SHALL provide a Demo_State that contains only synthetic data and that includes at least 1 Administrator, 2 Consumers, 3 Approved_Vendors, 1 Vendor with the Verification_Status Pending, and 20 Listings, of which at least 15 are Orderable_Listings of Alternative_Proteins.
2. THE Demo_State SHALL include at least one Sold out Listing, one Listing with the Peanut Allergen_Flag, one Listing with the Insect Allergen_Flag, and one Listing of the Pending Vendor, which Consumers cannot see.
3. THE Demo_State SHALL include the Alternative_Protein_Challenge definition and the Badge_Catalogue.
4. THE Project_Team SHALL begin every display name and business name in the Demo_State with the word Demo.
5. WHEN an Operator runs the documented reset procedure, THE CampusProtein SHALL restore the Demo_State within 60 seconds and remove all other data.
6. THE Project_Team SHALL document the login identifiers and demo passwords of the Demo_State in the demonstration guide, and each demo password SHALL be used for no other system.

### Requirement 48: Golden Path End to End

**User Story:** As a hackathon judge, I want to follow one complete journey from vendor approval to order pickup, so that I can see that the prototype works end to end.

**Priority:** P0

#### Acceptance Criteria

1. WHEN an Administrator approves the Pending Vendor of the Demo_State, THE CampusProtein SHALL make the Visible_Listings of that Vendor appear in food discovery for Consumers.
2. WHEN a Consumer registers, completes onboarding with a Nutrition_Goal, a Food_Budget, and Exclusions, and submits a Recommendation_Request, THE CampusProtein SHALL display Recommendations that meet Requirements 26, 27, and 28.
3. WHEN the Consumer adds a Recommendation to the Cart and places an Order, THE CampusProtein SHALL show the Order with the Order_Status Placed to the owning Vendor.
4. WHEN the Vendor moves the Order through Accepted, Preparing, Ready_For_Pickup, and Completed, THE CampusProtein SHALL show each Order_Status to the Consumer within 15 seconds.
5. THE CampusProtein SHALL complete every step of the Golden_Path with the AI_Provider disabled.
6. THE Golden_Path SHALL be completable within 5 minutes by a presenter who follows the demonstration guide.

### Requirement 49: Delivery and Verification Rules

**User Story:** As a team lead and a judge, I want each milestone implemented, tested, and documented, so that every claim about the prototype is backed by evidence.

**Priority:** P0

#### Acceptance Criteria

1. THE Project_Team SHALL mark a milestone complete only when the milestone includes the implementation, the executed tests, and a recorded verification result.
2. THE Project_Team SHALL describe a feature as working in documentation and demonstration material only when an executed automated test or a recorded manual verification supports the statement.
3. IF a feature cannot be completed within the available time, THEN THE Project_Team SHALL document the limitation and implement the functional fallback that the requirements and the assumptions define for the feature.
4. THE Project_Team SHALL commit work to Git at the completion of each task and at the end of each working session.
5. THE Project_Team SHALL maintain a task list that records each task as not started, in progress, or done, with the completion date of done tasks.
6. THE Project_Team SHALL record each major architectural decision in a concise decision record.
7. THE Project_Team SHALL verify that an AWS service or a Bedrock model is available and permitted before any design or implementation depends on the service or model.
8. WHERE an AWS resource is used, THE Project_Team SHALL create the resource in the us-east-1 region.
9. THE Project_Team SHALL keep all secrets outside the Git repository.
10. THE Project_Team SHALL verify every P0 requirement through an automated end-to-end test of the Golden_Path and automated tests of the rules on which the Golden_Path depends.
11. THE Project_Team SHALL verify every P1 requirement through automated unit and API tests for deterministic rules, automated tests with a stubbed AI_Provider for AI behavior, and a recorded manual check for visual, responsive, and accessibility criteria.
12. THE Project_Team SHALL verify every P2 requirement through automated tests of the rules and a recorded manual check of content and sources.
13. THE Project_Team SHALL test the Recommendation_Engine, the nutrition calculations, the stock and Order rules, the Order_Status transition rules, the Streak calculation, and the Seed_Loader with property-based tests that generate varied inputs.

## Assumptions and Resolved Decisions

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

## Out of Scope

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

