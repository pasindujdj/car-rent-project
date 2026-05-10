const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// If running locally, you might need to supply region/credentials. 
// When deployed to Lambda, it uses the attached IAM role automatically.
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });

const dynamoDb = DynamoDBDocumentClient.from(client);

// Ensure the table names match exactly what you created manually in the AWS Console.
const TABLE_NAMES = {
  VEHICLES: process.env.VEHICLES_TABLE || "Vehicles",
  TASKS: process.env.TASKS_TABLE || "Tasks",
  BOOKINGS: process.env.BOOKINGS_TABLE || "Bookings",
};

module.exports = {
  dynamoDb,
  TABLE_NAMES
};
