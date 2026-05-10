const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');
const { dynamoDb, TABLE_NAMES } = require('../db');
const { ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// GET all tasks
router.get('/', async (req, res) => {
  try {
    const params = { TableName: TABLE_NAMES.TASKS };
    const { Items } = await dynamoDb.send(new ScanCommand(params));
    res.json(Items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve tasks" });
  }
});

// GET specific task
router.get('/:task_id', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.TASKS,
      Key: { task_id: req.params.task_id },
    };
    const { Item } = await dynamoDb.send(new GetCommand(params));
    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not retrieve task" });
  }
});

// POST a new task (income/expense)
router.post('/', async (req, res) => {
  const { reg_number, status, description, invoice_number, amount, date } = req.body;
  
  if (!reg_number || !status || !amount || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const task_id = randomUUID();
    const params = {
      TableName: TABLE_NAMES.TASKS,
      Item: {
        task_id,
        reg_number,
        status, // 'Income' or 'Expense'
        description: description || "",
        invoice_number: invoice_number || "",
        amount: Number(amount),
        date
      },
    };
    await dynamoDb.send(new PutCommand(params));
    res.status(201).json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create task" });
  }
});

// PUT (update) a task
router.put('/:task_id', async (req, res) => {
  const { reg_number, status, description, invoice_number, amount, date } = req.body;
  const task_id = req.params.task_id;

  try {
    const params = {
      TableName: TABLE_NAMES.TASKS,
      Key: { task_id },
      UpdateExpression: "SET #reg_number = :reg_number, #status = :status, #description = :description, #invoice_number = :invoice_number, #amount = :amount, #date = :date",
      ExpressionAttributeNames: {
        "#reg_number": "reg_number",
        "#status": "status",
        "#description": "description",
        "#invoice_number": "invoice_number",
        "#amount": "amount",
        "#date": "date"
      },
      ExpressionAttributeValues: {
        ":reg_number": reg_number,
        ":status": status,
        ":description": description,
        ":invoice_number": invoice_number,
        ":amount": Number(amount),
        ":date": date
      },
      ReturnValues: "ALL_NEW",
    };

    const { Attributes } = await dynamoDb.send(new UpdateCommand(params));
    res.json(Attributes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not update task" });
  }
});

// DELETE a task
router.delete('/:task_id', async (req, res) => {
  try {
    const params = {
      TableName: TABLE_NAMES.TASKS,
      Key: { task_id: req.params.task_id },
    };
    await dynamoDb.send(new DeleteCommand(params));
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete task" });
  }
});

module.exports = router;
