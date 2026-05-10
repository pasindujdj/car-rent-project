# AWS Setup Guide (via Web Console)

Since you are more comfortable using the AWS Web Console, you have two options. **Option 1 is highly recommended** because setting up Lambda functions, API Gateways, and permissions manually (Option 2) takes a lot of time and is prone to errors.

---

## Option 1: The 5-Minute Way (Recommended)
Instead of clicking through dozens of screens, you can just generate a "Key" from the AWS Console and paste it into your terminal. This allows the `serverless.yml` file we created to do 100% of the work automatically!

### Step 1: Create an IAM User in AWS Console
1. Log in to your **AWS Management Console** in Chrome.
2. In the top search bar, type **IAM** and click on it.
3. On the left menu, click **Users**, then click the **Create user** button (top right).
4. Give it a name like `car-rental-deployer` and click **Next**.
5. Choose **Attach policies directly**.
6. Check the box for **AdministratorAccess** (this gives it permission to create the database and APIs). Click **Next**, then **Create user**.

### Step 2: Generate Access Keys
1. Click on the user you just created (`car-rental-deployer`).
2. Go to the **Security credentials** tab.
3. Scroll down to **Access keys** and click **Create access key**.
4. Choose **Command Line Interface (CLI)**, check the confirmation box, and click **Next** -> **Create access key**.
5. **Important**: Keep this page open! You will see an **Access key ID** and a **Secret access key**. 

### Step 3: Run the setup in your Terminal
Open your VS Code terminal and type this command to configure your computer with the keys you just generated:

```powershell
aws configure
```
* **AWS Access Key ID**: Paste the Access Key ID from the console.
* **AWS Secret Access Key**: Paste the Secret Access Key from the console.
* **Default region name**: Type `us-east-1` (or your preferred region).
* **Default output format**: Press Enter (leave blank).

Now, inside the `Backend` folder, simply run:
```powershell
npx serverless deploy
```
*Boom! AWS will build your entire backend infrastructure automatically.*

---

## Option 2: The Manual Way (Only if you prefer not to use the terminal)
If you really want to click and create everything manually in the console, here are the steps for Phase 1. 

### 1. Create DynamoDB Tables
1. Go to **DynamoDB** -> **Tables** -> **Create table**.
2. **Vehicles Table**:
   - Table name: `Vehicles`
   - Partition key: `reg_number` (String) -> Create.
3. **Tasks Table**:
   - Table name: `Tasks`
   - Partition key: `task_id` (String). 
   - Under *Settings*, choose *Customize settings* to add a **Global secondary index**. 
   - Partition key: `reg_number` (String), Sort key: `date` (String). Index name: `DateIndex`. -> Create.
4. **Bookings Table**:
   - Table name: `Bookings`
   - Partition key: `book_number` (String).
   - Add a GSI with Partition key: `reg_number` (String), Sort key: `start_date` (String). Index name: `StartDateIndex`. -> Create.

### 2. Create S3 Bucket (For Images)
1. Go to **S3** -> **Create bucket**.
2. Bucket name: `car-rental-images-yourname` (must be globally unique).
3. Under **Block Public Access settings**, uncheck "Block *all* public access" (so users can see car images).
4. Click **Create bucket**.

### 3. Create Cognito User Pool
1. Go to **Cognito** -> **Create user pool**.
2. **Sign-in options**: Select **Email**.
3. Skip through the defaults (Next, Next...) until you reach **App integration**.
4. App client name: `car-rental-web`.
5. Click **Create user pool**.
6. Click into the newly created pool, go to the **Groups** tab, and create two groups: `Admins` and `DataEnter`.

### 4. Create Lambda & API Gateway (The hard part)
*(Because you cannot easily edit Node.js files with `node_modules` inside the AWS Web Console, you would still need to zip up your `Backend` folder and upload it manually to a new Lambda function, then manually map the API Gateway routes. This is why Option 1 is highly recommended!)*
