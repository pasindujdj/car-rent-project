const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { dynamoDb, TABLE_NAMES } = require('../db');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const params = { TableName: TABLE_NAMES.BOOKINGS };
    const { Items } = await dynamoDb.send(new ScanCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve bookings" });
  }
});

// GET specific booking
router.get('/:book_number', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.BOOKINGS,
      Key: { book_number: req.params.book_number },
    };
    const { Item } = await dynamoDb.send(new GetCommand(params));
    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ error: "Booking not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve booking" });
  }
});

// POST a new booking
router.post('/', async (req, res) => {
  const { reg_number, start_date, end_date, customer_name, customer_number, status } = req.body;
  
  if (!reg_number || !start_date || !end_date || !customer_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const book_number = randomUUID();
    const params = {
      TableName: TABLE_NAMES.BOOKINGS,
      Item: {
        book_number,
        reg_number,
        start_date,
        end_date,
        customer_name,
        customer_number: customer_number || "",
        status: status || "Pending"
      },
    };
    await dynamoDb.send(new PutCommand(params));
    res.status(201).json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create booking" });
  }
});

// PUT (update) a booking
router.put('/:book_number', async (req, res) => {
  const { reg_number, start_date, end_date, customer_name, customer_number, status } = req.body;
  const book_number = req.params.book_number;

  try {
    const params = {
      TableName: TABLE_NAMES.BOOKINGS,
      Key: { book_number },
      UpdateExpression: "SET #reg_number = :reg_number, #start_date = :start_date, #end_date = :end_date, #customer_name = :customer_name, #customer_number = :customer_number, #status = :status",
      ExpressionAttributeNames: {
        "#reg_number": "reg_number",
        "#start_date": "start_date",
        "#end_date": "end_date",
        "#customer_name": "customer_name",
        "#customer_number": "customer_number",
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":reg_number": reg_number,
        ":start_date": start_date,
        ":end_date": end_date,
        ":customer_name": customer_name,
        ":customer_number": customer_number,
        ":status": status
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoDb.send(new UpdateCommand(params));
    res.json(Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update booking" });
  }
});

// DELETE a booking
router.delete('/:book_number', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.BOOKINGS,
      Key: { book_number: req.params.book_number },
    };
    await dynamoDb.send(new DeleteCommand(params));
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete booking" });
  }
});

module.exports = router;
