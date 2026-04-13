const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
  },
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  tag:{
    type: [String],
    default: ["General"]
  },
  lastEditedAt: {
  type: Date,
  default: null
},
color: {
  type: String,
  default: "#ffffff"
},
history: [
  {
    title: String,
    description: String,
    tag: [String],
    color: String,
    editedAt: Date
  }
],
  date:{
    type: Date,
    default: Date.now()
  },
}, 
{timestamps:true});

module.exports = mongoose.model('notes', NotesSchema);