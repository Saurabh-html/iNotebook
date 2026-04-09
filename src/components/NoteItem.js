import React, { useContext } from 'react'
import noteContext from '../context/notes/noteContext';

const NoteItem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;

  const { note, updateNote } = props;

  // Tags safe handling
  const tags = Array.isArray(note?.tag)
    ? note.tag
    : typeof note?.tag === "string"
      ? note.tag.split(',').map(t => t.trim())
      : [];

  const truncate = (text, limit) => {
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="col-md-3" onClick={() => props.openNote(note)} style={{ cursor: "pointer" }}>

      <div className={`card my-3 ${props.mode === "dark" ? "bg-dark text-light border-secondary" : ""}`}>
        <div className="card-body">

          {/* DATE + EDITED TIME */}
          <div className="d-flex justify-content-between text-muted" style={{ fontSize: "12px" }}>
            <span>{note.createdAt ? formatDate(note.createdAt) : ""}</span>

            <span>
              {note.updatedAt
                ? `Edited at: ${formatTime(note.updatedAt)}`
                : note.createdAt
                  ? formatTime(note.createdAt)
                  : ""}
            </span>
          </div>

          {/* TITLE + ACTIONS */}
          <div className="d-flex justify-content-between align-items-center mt-1">
            <h5 className="card-title mb-0">{truncate(note?.title, 17)}</h5>

            <div>
              {/* EDIT */}
              <i
                className="fa-solid fa-pen-to-square mx-2"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateNote(note);
                }}
              ></i>

              {/* DELETE */}
              <i
                className="fa-solid fa-trash mx-2"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note._id);
                  props.showAlert("Deleted successfully", "success");
                }}
              ></i>

              {/* COPY */}
              <i
                className="fa-solid fa-copy mx-2"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(note.description);
                  props.showAlert("Copied to clipboard", "success");
                }}
              ></i>

              {/* SHARE */}
              <i
                className="fa-solid fa-share-nodes mx-2"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: note.title,
                      text: note.description
                    });
                  } else {
                    props.showAlert("Sharing not supported", "warning");
                  }
                }}
              ></i>
            </div>
          </div>

          <p className="card-text mt-2">{truncate(note?.description, 55)}</p>

          {/* TAGS */}
          <div className="mt-2">
            {tags.length > 0 ? (
              tags.map((t, index) => (
                <span key={index} className="badge bg-primary me-1">
                  {t}
                </span>
              ))
            ) : (
              <span className={`badge ${props.mode === "dark" ? "bg-light text-dark" : "bg-primary"}`}>General</span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default NoteItem;