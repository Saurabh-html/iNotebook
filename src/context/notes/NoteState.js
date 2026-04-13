import NoteContext from "./noteContext";
import { useState } from "react";
import config from "../../config";

const NoteState = (props) => {
  const host = config.API_URL;
  const [notes, setNotes] = useState([]);
  const [serverDown, setServerDown] = useState(false);

  // GET NOTES
  const getNotes = async () => {
    try {
      const response = await fetch(`${host}/api/notes/fetchallnotes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem(config.TOKEN_KEY)
        },
      });

      if (!response.ok) throw new Error();

      const json = await response.json();

      if (Array.isArray(json)) {
        setNotes(json);
        setServerDown(false);
      } else {
        setNotes([]);
        setServerDown(true);
      }

    } catch (error) {
      console.error(error);
      setNotes([]);
      setServerDown(true);
    }
  };

  // ADD NOTE (FIXED)
  const addNote = async (title, description, tag, color) => {
    try {
      const response = await fetch(`${host}/api/notes/addnote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem(config.TOKEN_KEY)
        },
        body: JSON.stringify({ title, description, tag, color })
      });

      if (!response.ok) throw new Error();

      const json = await response.json();

      setNotes(prev => [...prev, json]);
      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // DELETE NOTE (FIXED)
  const deleteNote = async (id) => {
    try {
      const response = await fetch(`${host}/api/notes/deletenote/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem(config.TOKEN_KEY)
        },
      });

      if (!response.ok) throw new Error();

      setNotes(notes.filter((note) => note._id !== id));
      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  };

  //  EDIT NOTE (FIXED UPDATED TIME)
  const editNote = async (id, title, description, tag, color) => {
    try {
      const response = await fetch(`${host}/api/notes/updatenote/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem(config.TOKEN_KEY)
        },
        body: JSON.stringify({ title, description, tag, color })
      });

      if (!response.ok) throw new Error();

      const json = await response.json();

      let newNotes = JSON.parse(JSON.stringify(notes));

      for (let i = 0; i < newNotes.length; i++) {
        if (newNotes[i]._id === id) {
          newNotes[i] = json; // IMPORTANT FIX (includes updatedAt)
          break;
        }
      }

      setNotes(newNotes);
      return true;

    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <NoteContext.Provider value={{
      notes,
      setNotes, // REQUIRED FOR PIN FEATURE
      addNote,
      deleteNote,
      editNote,
      getNotes,
      serverDown
    }}>
      {props.children}
    </NoteContext.Provider>
  );
};

export default NoteState;