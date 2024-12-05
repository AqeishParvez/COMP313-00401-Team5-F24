const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

router.get("/", async (req, res) => {
    try {
      const students = await Student.find();
      res.status(200).json(students); 
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

router.post('/', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        const savedStudent = await newStudent.save();
        res.status(201).json(savedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
        res.json(updatedStudent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const deletedStudent = await Student.findByIdAndDelete(req.params.id);
        if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
        res.json(deletedStudent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
