const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).lean();

// MANUAL NOTES
const manualNotes = notes
  .filter(n => n.isManuallyOrdered)
  .sort((a, b) => a.order - b.order);

// AUTO NOTES
const autoNotes = notes
  .filter(n => !n.isManuallyOrdered)
  .sort((a, b) => {
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

res.json([...manualNotes, ...autoNotes]);
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 2: Add note
router.post(
  '/addnote',
  fetchuser,
  [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag, color } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag: Array.isArray(tag) ? tag : [tag],
        color,
        user: req.user.id,
      });

      const savedNote = await note.save();
      res.json(savedNote);

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);



// ROUTE 3: Update note (FINAL WITH HISTORY)
router.put('/updatenote/:id', fetchuser, async (req, res) => {
  const { title, description, tag, color } = req.body;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).send("Not Found");

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    // SAVE HISTORY (BEFORE UPDATE)
    note.history = note.history || [];

    note.history.push({
      title: note.title,
      description: note.description,
      tag: note.tag,
      color: note.color,
      editedAt: new Date()
    });

    // KEEP ONLY LAST 5 VERSIONS
    if (note.history.length > 5) {
      note.history = note.history.slice(-5);
    }

    await note.save();

    // BUILD UPDATE OBJECT
    const newNote = {};

    if (title) newNote.title = title;
    if (description) newNote.description = description;
    if (tag) newNote.tag = tag;
    if (color) newNote.color = color;

    if (title || description || tag) {
      newNote.lastEditedAt = new Date();
    }

    // APPLY UPDATE
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );

    res.json(note);

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE 4: Delete note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) return res.status(404).send("Not Found");

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Note deleted"
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// ROUTE: Update order of notes
router.put('/reorder', fetchuser, async (req, res) => {
  try {
    const { notes } = req.body;

    for (let item of notes) {
      await Note.findByIdAndUpdate(item.id, {
        $set: {
          order: item.order,
          isManuallyOrdered: true
        }
      });
    }

    res.json({ success: true });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;