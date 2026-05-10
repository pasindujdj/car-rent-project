# Car Rental Management System - Development Plan

## 1. Architecture Overview
This system will be built using a modern Serverless architecture on AWS, combined with a React frontend.

*   **Frontend**: React.js (hosted via AWS Amplify)
*   **Authentication**: AWS Cognito (Integrated via Amplify on the frontend)
*   **Backend (API)**: Node.js with Express.js, wrapped with `serverless-http` to run as an AWS Lambda function behind an API Gateway.
*   **Database**: Amazon DynamoDB (NoSQL) for high-performance and scalable data storage.

## 2. Database Design (DynamoDB)
DynamoDB uses a NoSQL structure. Here is the proposed schema for the three main tables.

### Table: `Vehicles`
*   **Partition Key**: `reg_number` (String)
*   **Attributes**:
    *   `brand` (String)
    *   `model` (String)
    *   `image_url` (String) - We can store images in S3 and save the URL here.
    *   `status` (String) - e.g., "Available", "Rented", "Maintenance"

### Table: `Tasks`
*   **Partition Key**: `task_id` (String) - A unique UUID generated upon creation.
*   **Global Secondary Index (GSI)**: `reg_number` (Partition Key) + `date` (Sort Key) -> *For generating Vehicle-wise reports.*
*   **Attributes**:
    *   `reg_number` (String)
    *   `status` (String) - "Income" or "Expense"
    *   `description` (String)
    *   `invoice_number` (String) - Optional; populated if related to a booking.
    *   `amount` (Number)
    *   `date` (String - ISO 8601 Date) - Needed for Date-wise reports.

### Table: `Bookings`
*   **Partition Key**: `book_number` (String) - Unique identifier.
*   **Global Secondary Index (GSI)**: `reg_number` (Partition Key) + `start_date` (Sort Key) -> *To check vehicle availability.*
*   **Attributes**:
    *   `reg_number` (String)
    *   `start_date` (String)
    *   `end_date` (String)
    *   `customer_name` (String)
    *   `customer_number` (String)
    *   `status` (String) - "Pending", "Done", "Cancelled"

## 3. User Roles & Security
*   **Admin**: Full access to all modules (Vehicles, Tasks, Bookings, Reports).
*   **Data Enter**: Limited access. Can add/update Tasks and Bookings, but cannot delete records or view high-level financial reports.
*   *Implementation*: We will define User Groups in AWS Cognito (e.g., `Admins`, `DataEntry`). The frontend will show/hide routes based on the user's Cognito group, and the Backend API will verify the group from the JWT token.

## 4. API Design (Node.js/Express)
The Express backend will expose RESTful endpoints:

*   **Vehicles**
    *   `GET /api/vehicles` - List all vehicles
    *   `POST /api/vehicles` - Add a vehicle
    *   `PUT /api/vehicles/:reg_number` - Update a vehicle
    *   `DELETE /api/vehicles/:reg_number` - Remove a vehicle
*   **Tasks**
    *   `GET /api/tasks` - List tasks (supports query params like `?reg_number=XYZ` or `?startDate=X&endDate=Y`)
    *   `POST /api/tasks` - Add Income/Expense
    *   `PUT /api/tasks/:task_id` - Update task
    *   `DELETE /api/tasks/:task_id` - Remove task
*   **Bookings**
    *   `GET /api/bookings` - List bookings
    *   `POST /api/bookings` - Add a booking (will automatically generate an "Income" Task upon completion)
    *   `PUT /api/bookings/:book_number` - Update booking status
    *   `DELETE /api/bookings/:book_number` - Remove booking
*   **Reports**
    *   `GET /api/reports/income-expense` - Aggregates data from the Tasks table based on date ranges and vehicles.

## 5. Development Phases

### Phase 1: AWS Setup & Infrastructure
1.  Set up AWS Cognito User Pool with Groups (`Admin`, `DataEnter`).
2.  Provision DynamoDB Tables (`Vehicles`, `Tasks`, `Bookings`) with appropriate GSIs.
3.  Set up an S3 Bucket for Vehicle Images.

### Phase 2: Backend Development (Express + Lambda)
1.  Initialize the Node.js app in the `Backend` folder.
2.  Install dependencies: `express`, `aws-sdk` (or `@aws-sdk/client-dynamodb`), `serverless-http`, `cors`.
3.  Implement CRUD routes for Vehicles, Tasks, and Bookings.
4.  Implement a middleware to decode Cognito JWT tokens and enforce role-based access control.
5.  Deploy the Express app to AWS Lambda using the Serverless Framework or AWS SAM.

### Phase 3: Frontend Foundation & Auth (React + Amplify)
1.  Initialize the React app (using Vite or Create React App) in the `Frontend` folder.
2.  Install dependencies: `aws-amplify`, `@aws-amplify/ui-react`, `react-router-dom`, `axios`, and a UI library (e.g., Material-UI or TailwindCSS).
3.  Configure Amplify in the React app to connect to the created Cognito User Pool.
4.  Build a protected routing system that checks user authentication and roles.

### Phase 4: Core Features Implementation
1.  **Vehicle Management**: Build UI components to list, add, edit, and delete vehicles (with image uploads).
2.  **Booking Management**: Build a calendar/form interface to check availability and create bookings.
3.  **Task Management**: Build an interface to log expenses and incomes against specific vehicles.

### Phase 5: Reporting and Polish
1.  Build the Reports Dashboard.
2.  Implement Date-pickers and Vehicle dropdowns to filter Income/Expense data.
3.  Display data using charts (e.g., Recharts or Chart.js) and data tables.
4.  Final end-to-end testing and styling refinement.
