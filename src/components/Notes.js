import React, { useContext, useEffect, useRef, useState } from "react";
import NoteItem from "./NoteItem";
import AddNote from "./AddNote";
import noteContext from "../context/notes/noteContext";
import { useNavigate } from "react-router-dom";
import config from "../config";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

const Notes = (props) => {
  const context = useContext(noteContext);
  let navigate = useNavigate();

  const { notes = [], getNotes, editNote, serverDown, } = context;

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
    etag: "",
    ecolor: "#ffffff"
  });

  const [selectedNote, setSelectedNote] = useState(null);
  const [historyNote, setHistoryNote] = useState(null);

  const ref = useRef(null);
  const refClose = useRef(null);

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({
      id: currentNote._id,
      etitle: currentNote.title,
      edescription: currentNote.description,
      etag: currentNote.tag,
      ecolor: currentNote.color || "#ffffff"
    });
  };

  const handleClick = async () => {
  const success = await editNote(
    note.id,
    note.etitle,
    note.edescription,
    note.etag,
    note.ecolor
  );

  if (success) {
    props.showAlert("Note updated successfully", "success");
  } else {
    props.showAlert("Update failed", "danger");
  }

  refClose.current.click();
};

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // Prevent background scroll when modal open
  useEffect(() => {
    if (selectedNote) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedNote]);

  //  FILTER + SORT 
const filteredNotes = (notes || [])
  .filter((n) => {
    if (!props.search) return true;

    const query = props.search.toLowerCase();

    // TITLE SEARCH
    if (props.searchType === "title") {
      return n.title?.toLowerCase().includes(query);
    }

    // DESCRIPTION SEARCH 
    if (props.searchType === "description") {
      return n.description?.toLowerCase().includes(query);
    }

    // TAG SEARCH
    if (props.searchType === "tag") {
      const tags = Array.isArray(n.tag)
        ? n.tag
        : typeof n.tag === "string"
          ? n.tag.split(',').map(t => t.trim())
          : [];

      return tags.some(tag =>
        tag.toLowerCase().includes(query)
      );
    }

    return true;
  })
  .sort((a, b) => {
    const dateA = new Date(a.lastEditedAt || a.updatedAt || a.createdAt).getTime();
    const dateB = new Date(b.lastEditedAt || b.updatedAt || b.createdAt).getTime();
    return dateB - dateA;
  });
  const restoreVersion = async (id, version) => {
  await editNote(
    id,
    version.title,
    version.description,
    version.tag,
    version.color
  );

  props.showAlert("Version restored", "success");
};

const handleDragEnd = (event) => {
  const { active, over } = event;

  if (!over) return;

  if (active.id !== over.id) {
    const oldIndex = filteredNotes.findIndex(n => n._id === active.id);
    const newIndex = filteredNotes.findIndex(n => n._id === over.id);

    const newOrder = arrayMove(filteredNotes, oldIndex, newIndex);

    context.setNotes(newOrder);
  }
};
  return (
    <>
      <AddNote showAlert={props.showAlert} />

      {serverDown && (
        <div className="alert alert-danger">
          Server is down. Please try again later.
        </div>
      )}

      {/* Hidden button for edit modal */}
      <button
        ref={ref}
        type="button"
        className="btn btn-primary d-none"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
      >
        Launch modal
      </button>

      {/* EDIT MODAL */}
      <div className="modal fade" id="exampleModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className={`modal-content ${props.mode === "dark" ? "bg-dark text-light" : ""}`}>

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

                <textarea
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
                <div className="mb-2">
                <label className="form-label">Note Color</label>
                <input
                  type="color"
                  className="form-control form-control-color"
                  name="ecolor"
                  value={note.ecolor || "#ffffff"}
                  onChange={onChange}
                />
              </div>
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

      {/* NOTES LIST */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={filteredNotes.map(n => n._id)}
        strategy={verticalListSortingStrategy}
      >
      <div className="row my-3">
        <h2>Your Notes ({filteredNotes.length})</h2>

        {Array.isArray(notes) && notes.length === 0 && (
          <p>No notes to display</p>
        )}

        {filteredNotes.map((n) => (
          <NoteItem
            mode={props.mode}
            key={n._id}
            updateNote={updateNote}
            showAlert={props.showAlert}
            note={n}
            search={props.search}
            searchType={props.searchType}
            openNote={setSelectedNote}
            openHistory={setHistoryNote}
          />
        ))}
      </div>
        </SortableContext>
        </DndContext>
      {/* BLUR BACKGROUND */}
      {selectedNote && (
        <div
          className="blur-overlay"
          onClick={() => setSelectedNote(null)}
        ></div>
      )}

      {/* VIEW NOTE MODAL */}
      {selectedNote && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1050
          }}
        >
          <div
            className={`card p-3 ${props.mode === "dark" ? "bg-dark text-light border-secondary" : ""}`}
            style={{
              width: "90%",
              maxWidth: "500px",
              maxHeight: "80vh",
              overflow: "hidden",
              borderRadius: "12px"
            }}
          >

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">{selectedNote.title}</h5>

              <i
                className="fa-solid fa-xmark"
                style={{ cursor: "pointer", fontSize: "20px" }}
                onClick={() => setSelectedNote(null)}
              ></i>
            </div>

            <hr />

            <div
              style={{
                maxHeight: "60vh",
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                paddingRight: "5px"
              }}
            >
              {selectedNote.description}
            </div>

          </div>
        </div>
      )}
      {/* HISTORY MODAL */}
{historyNote && (
  <div
    className="d-flex justify-content-center align-items-center"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1100
    }}
  >
    <div
      className={`card p-3 ${props.mode === "dark" ? "bg-dark text-light border-secondary" : ""}`}
      style={{
        width: "90%",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto"
      }}
    >
      <h5>Version History</h5>
      <hr />

      {historyNote.history && historyNote.history.length > 0 ? (
        historyNote.history.slice().reverse().map((h, index) => (
          <div key={index} className="border p-2 mb-2 rounded">
            <strong>{h.title}</strong>
            <p style={{ whiteSpace: "pre-wrap" }}>{h.description}</p>
            <small>{new Date(h.editedAt).toLocaleString()}</small>

            <button
              className="btn btn-sm btn-primary mt-1"
              onClick={() => restoreVersion(historyNote._id, h)}
            >
              Restore
            </button>
          </div>
        ))
      ) : (
        <p>No history available</p>
      )}

      <button
        className="btn btn-danger mt-2"
        onClick={() => setHistoryNote(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </>
  );
};

export default Notes;