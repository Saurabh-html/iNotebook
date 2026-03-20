import React, { useContext } from 'react'
import noteContext from '../context/notes/noteContext';

const NoteItem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;

  const { note, updateNote } = props;

  // ✅ Handle both string and array tags safely
  const tags = Array.isArray(note?.tag)
    ? note.tag
    : typeof note?.tag === "string"
      ? note.tag.split(',').map(t => t.trim())
      : [];

  return (
    <div className="col-md-3">
      <div className="card my-3">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">{note?.title}</h5>

            <div>
              <i
                className="fa-solid fa-pen-to-square mx-2"
                style={{ cursor: "pointer" }}
                onClick={() => updateNote(note)}
              ></i>

              <i
                className="fa-solid fa-trash mx-2"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  deleteNote(note._id);
                  props.showAlert("Deleted successfully", "success");
                }}
              ></i>
            </div>
          </div>

          <p className="card-text mt-2">{note?.description}</p>

          {/* ✅ Safe Tag Rendering */}
          <div className="mt-2">
            {tags.length > 0 ? (
              tags.map((t, index) => (
                <span key={index} className="badge bg-primary me-1">
                  {t}
                </span>
              ))
            ) : (
              <span className="badge bg-secondary">General</span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default NoteItem;