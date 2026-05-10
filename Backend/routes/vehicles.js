const express = require('express');
const router = express.Router();
const { dynamoDb, TABLE_NAMES } = require('../db');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const params = { TableName: TABLE_NAMES.VEHICLES };
    const { Items } = await dynamoDb.send(new ScanCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve vehicles" });
  }
});

// GET a specific vehicle
router.get('/:reg_number', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.VEHICLES,
      Key: { reg_number: req.params.reg_number },
    };
    const { Item } = await dynamoDb.send(new GetCommand(params));
    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ error: "Vehicle not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve vehicle" });
  }
});

// POST a new vehicle
router.post('/', async (req, res) => {
  const { reg_number, brand, model, image_url, status } = req.body;
  
  if (!reg_number || !brand || !model) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const params = {
      TableName: TABLE_NAMES.VEHICLES,
      Item: {
        reg_number,
        brand,
        model,
        image_url: image_url || "",
        status: status || "Available",
      },
    };
    await dynamoDb.send(new PutCommand(params));
    res.status(201).json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create vehicle" });
  }
});

// PUT (update) an existing vehicle
router.put('/:reg_number', async (req, res) => {
  const { brand, model, image_url, status } = req.body;
  const reg_number = req.params.reg_number;

  try {
    const params = {
      TableName: TABLE_NAMES.VEHICLES,
      Key: { reg_number },
      UpdateExpression: "SET #brand = :brand, #model = :model, #image_url = :image_url, #status = :status",
      ExpressionAttributeNames: {
        "#brand": "brand",
        "#model": "model",
        "#image_url": "image_url",
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":brand": brand,
        ":model": model,
        ":image_url": image_url,
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoDb.send(new UpdateCommand(params));
    res.json(Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update vehicle" });
  }
});

// DELETE a vehicle
router.delete('/:reg_number', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.VEHICLES,
      Key: { reg_number: req.params.reg_number },
    };
    await dynamoDb.send(new DeleteCommand(params));
    res.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete vehicle" });
  }
});

module.exports = router;
