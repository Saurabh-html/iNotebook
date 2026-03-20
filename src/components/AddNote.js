import React, { useContext, useState } from 'react'
import noteContext from "../context/notes/noteContext"

const AddNote = (props) => {
  const context = useContext(noteContext);
  const { addNote } = context;

  const [note, setNote] = useState({
    title: "",
    description: "",
    tag: ""
  });

  const handleClick = (e) => {
    e.preventDefault();

    const tagArray = note.tag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    addNote(note.title, note.description, tagArray);

    setNote({ title: "", description: "", tag: "" });
    props.showAlert("Added successfully", "success");
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // ✅ VALIDATION (matches backend)
  const isFormValid =
    note.title.trim().length >= 3 &&
    note.description.trim().length >= 5;

  return (
    <div className="container my-3">
      <h2>Add a Note</h2>

      <form>
        {/* TITLE */}
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={note.title}
            onChange={onChange}
          />
          {note.title && note.title.length < 3 && (
            <small className="text-danger">
              Title must be at least 3 characters
            </small>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            type="text"
            className="form-control"
            id="description"
            name="description"
            value={note.description}
            onChange={onChange}
          />
          {note.description && note.description.length < 5 && (
            <small className="text-danger">
              Description must be at least 5 characters
            </small>
          )}
        </div>

        {/* TAG */}
        <div className="mb-3">
          <label htmlFor="tag" className="form-label">Tag</label>
          <input
            type="text"
            className="form-control"
            id="tag"
            name="tag"
            value={note.tag}
            onChange={onChange}
            placeholder="comma separated (optional)"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleClick}
          disabled={!isFormValid} // ✅ key change
        >
          Add Note
        </button>

      </form>
    </div>
  )
}

export default AddNote;