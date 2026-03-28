

### 📄 Kilowott CRM Integration: Implementation Plan

**Objective:** To build a secure, decoupled CRM dashboard that pulls read-only customer and order data from WooCommerce, while maintaining a local, isolated database for internal CRM communication workflows.

**Core Features to be Developed:**

**1. Secure Customer Data Management**
* **Action:** Fetch customer profiles from the WooCommerce REST API (`/wc/v3/customers`).
* **Implementation:** Use server-side PHP cURL requests to act as a secure bridge. This ensures the WooCommerce Consumer Key and Secret are never exposed to the client-side browser.

**2. Order Tracking Workflow**
* **Action:** Fetch and display WooCommerce order histories (`/wc/v3/orders`).
* **Implementation:** Link these orders to the respective customer profiles in the frontend dashboard, providing sales reps with a unified view of customer lifetime value without altering store data.

**3. Isolated CRM Communication Notes**
* **Action:** Allow the CRM user to save custom text notes against specific customer profiles.
* **Implementation:** Build a local MySQL database (`customer_notes` table). This data will not be pushed to WooCommerce. All database insertions will use PHP Data Objects (PDO) and prepared statements to strictly prevent SQL injection, alongside HTML entity sanitization for frontend display.

**Assumptions:**
* The target WooCommerce store is running standard v3 of the REST API.
* The CRM requires read-only access to the store; write access is restricted to the local database to protect store integrity.

****