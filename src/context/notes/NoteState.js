import NoteContext from "./noteContext";
import { useState } from "react";
import config from "../../config";

const NoteState = (props) => {
  const host = config.API_URL;
  const [notes, setNotes] = useState([]);
  const [serverDown, setServerDown] = useState(false);

  // Get all Notes
const getNotes = async () => {
  try {
    const response = await fetch(`${host}/api/notes/fetchallnotes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem(config.TOKEN_KEY)
      },
    });

    // ✅ Handle server error (500, 502 etc.)
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const json = await response.json();

    // ✅ Keep your existing safety check
    if (Array.isArray(json)) {
      setNotes(json);
      setServerDown(false); // ✅ important reset
    } else {
      console.error("Invalid response:", json);
      setNotes([]);
      setServerDown(true);
    }

  } catch (error) {
    console.error("Fetch failed:", error);
    setNotes([]); // fallback
    setServerDown(true); // ✅ trigger UI alert
  }
};

  // Add a Note
  const addNote = async (title, description, tag) => {
    const response = await fetch(`${host}/api/notes/addnote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem(config.TOKEN_KEY)
      },
      body: JSON.stringify({ title, description, tag })
    });

    const json = await response.json();
    setNotes(notes.concat(json));
  };

  // Delete a Note
  const deleteNote = async (id) => {
    await fetch(`${host}/api/notes/deletenote/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem(config.TOKEN_KEY)
      },
    });

    const newNotes = notes.filter((note) => note._id !== id);
    setNotes(newNotes);
  };

  // Edit a Note
  const editNote = async (id, title, description, tag) => {
    await fetch(`${host}/api/notes/updatenote/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem(config.TOKEN_KEY)
      },
      body: JSON.stringify({ title, description, tag })
    });

    let newNotes = JSON.parse(JSON.stringify(notes));

    for (let index = 0; index < newNotes.length; index++) {
      if (newNotes[index]._id === id) {
        newNotes[index].title = title;
        newNotes[index].description = description;
        newNotes[index].tag = tag;
        break;
      }
    }

    setNotes(newNotes);
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, deleteNote, editNote, getNotes, serverDown }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;