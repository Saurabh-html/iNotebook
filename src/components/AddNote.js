import React, { useContext, useState } from 'react'
import noteContext from "../context/notes/noteContext"

const AddNote = (props) => {
  const context = useContext(noteContext);
  const { addNote } = context;
  const [isListening, setIsListening] = useState(false);
  const [note, setNote] = useState({
    title: "",
    description: "",
    tag: "",
    color: "#ffffff"
  });

  const handleClick = async (e) => {
    e.preventDefault();

    const tagArray = note.tag
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    const success = await addNote(note.title, note.description, tagArray, note.color);

    if (success) {
      setNote({ title: "", description: "", tag: "", color: "#ffffff" });
      props.showAlert("Added successfully", "success");
    } else {
      props.showAlert("Failed to add note", "danger");
    }
  };

  const onChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  const isFormValid =
    note.title.trim().length >= 3 &&
    note.description.trim().length >= 5;

    const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    props.showAlert("Voice not supported in this browser", "danger");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;

  setIsListening(true);

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;

    setNote((prev) => ({
      ...prev,
      description: prev.description + " " + transcript
    }));

    setIsListening(false);
  };
  recognition.lang = "hi-IN";
  recognition.onerror = () => {
    setIsListening(false);
    props.showAlert("Voice recognition error", "danger");
  };

  recognition.onend = () => {
    setIsListening(false);
  };
};

  return (
    <div className="container my-3">
      <h2>Add a Note</h2>

      <form>
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

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={note.description}
            onChange={onChange}
          />
          {note.description && note.description.length < 5 && (
            <small className="text-danger">
              Description must be at least 5 characters
            </small>
          )}
        </div>

        <button
          type="button"
          className={`btn btn-${isListening ? "danger" : "secondary"} mt-2`}
          onClick={startListening}
        >
          {isListening ? "Listening..." : "🎤 Speak"}
        </button>

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

        <div className="mb-3">
        <label className="form-label">Note Color</label>
        <input
          type="color"
          className="form-control form-control-color"
          name="color"
          value={note.color}
          onChange={onChange}
        />
      </div>

        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleClick}
          disabled={!isFormValid}
        >
          Add Note
        </button>

      </form>
    </div>
  )
}

export default AddNote;