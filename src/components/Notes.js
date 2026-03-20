import React, { useContext, useEffect, useRef, useState } from "react";
import NoteItem from "./NoteItem";
import AddNote from "./AddNote";
import noteContext from "../context/notes/noteContext";
import { useNavigate } from "react-router-dom";
import config from "../config";

const Notes = (props) => {
  const context = useContext(noteContext);
  let navigate = useNavigate();

  const { notes = [], getNotes, editNote } = context; // ✅ safe default

  useEffect(() => {
    const token = localStorage.getItem(config.TOKEN_KEY);

    if (!token) {
      navigate("/login", { replace: true });
    } else {
      getNotes();
    }
    // eslint-disable-next-line
  }, []);

  const [note, setNote] = useState({
    id: "",
    etitle: "",
    edescription: "",
    etag: ""
  });

  const ref = useRef(null);
  const refClose = useRef(null);

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({
      id: currentNote._id,
      etitle: currentNote.title,
      edescription: currentNote.description,
      etag: currentNote.tag
    });
  };

  const handleClick = () => {
    editNote(note.id, note.etitle, note.edescription, note.etag);
    refClose.current.click();
    props.showAlert("Updated successfully", "success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // ✅ SAFE FILTERING (handles both string & array tags)
  const filteredNotes = (notes || []).filter((n) => {
    if (!props.search) return true;

    if (props.searchType === "title") {
      return n.title?.toLowerCase().includes(props.search.toLowerCase());
    }

    if (props.searchType === "tag") {
      const tags = Array.isArray(n.tag)
        ? n.tag
        : typeof n.tag === "string"
          ? n.tag.split(',').map(t => t.trim())
          : [];

      return tags.some(tag =>
        tag.toLowerCase().includes(props.search.toLowerCase())
      );
    }

    return true;
  });

  return (
    <>
      <AddNote showAlert={props.showAlert} />

      {/* Hidden button for modal */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch modal
      </button>

      {/* Modal */}
      <div className="modal fade" id="exampleModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Edit Note</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              <form>
                <input
                  type="text"
                  className="form-control mb-2"
                  name="etitle"
                  value={note.etitle}
                  onChange={onChange}
                  placeholder="Title"
                />

                <input
                  type="text"
                  className="form-control mb-2"
                  name="edescription"
                  value={note.edescription}
                  onChange={onChange}
                  placeholder="Description"
                />

                <input
                  type="text"
                  className="form-control"
                  name="etag"
                  value={note.etag}
                  onChange={onChange}
                  placeholder="Tag"
                />
              </form>
            </div>

            <div className="modal-footer">
              <button ref={refClose} className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button onClick={handleClick} className="btn btn-primary">
                Update Note
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="row my-3">
        <h2>Your Notes</h2>

        {Array.isArray(notes) && notes.length === 0 && (
          <p>No notes to display</p>
        )}

        {filteredNotes.map((n) => (
          <NoteItem
            key={n._id}
            updateNote={updateNote}
            showAlert={props.showAlert}
            note={n}
          />
        ))}
      </div>
    </>
  );
};

export default Notes;