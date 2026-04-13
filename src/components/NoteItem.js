import React, { useContext } from 'react'
import noteContext from '../context/notes/noteContext';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const NoteItem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;

  const { note, updateNote } = props;

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

  const isEdited = !!note.lastEditedAt;

  const highlightText = (text, search) => {
  if (!search) return text;

  const regex = new RegExp(`(${search})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === search.toLowerCase()
      ? <mark key={index}>{part}</mark>
      : part
  );
};
const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
  id: note._id
});

const style = {
  transform: CSS.Transform.toString(transform),
  transition
};

  return (
  <div
    ref={setNodeRef}
    style={style}
    {...attributes}
    className="col-md-3"
    onClick={() => props.openNote(note)}
  >

      <div className={`card my-3 ${props.mode === "dark" ? "bg-dark text-light border-secondary" : ""}`}
  style={{
    backgroundColor: note.color || (props.mode === "dark" ? "#1e1e1e" : "#fff")
  }}
>
        <div className="card-body">

          {/* DATE + TIME */}
          <div className="d-flex justify-content-between text-muted" style={{ fontSize: "12px" }}>
            <span>
              {isEdited
                ? formatDate(note.lastEditedAt)
                : formatDate(note.createdAt)}
            </span>

            <span>
              {isEdited
                ? `Edited at: ${formatTime(note.lastEditedAt)}`
                : formatTime(note.createdAt)}
            </span>
          </div>

          {/* TITLE + ACTIONS */}
          <div className="d-flex justify-content-between align-items-center mt-1">
            <h5 className="card-title mb-0">{props.searchType === "title"  ? highlightText(truncate(note?.title, 17), props.search)  : truncate(note?.title, 17)}</h5>
            <div>
    

                <i
                  className="fa-solid fa-grip-vertical mx-2"
                  {...listeners}
                  style={{ cursor: "grab" }}
                  onClick={(e) => e.stopPropagation()}
                />
              <div className="d-flex flex-column align-items-end">

  {/* ROW 1 */}
  <div className="d-flex">
    {/* EDIT */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-pen-to-square mx-2"
        onClick={(e) => {
          e.stopPropagation();
          updateNote(note);
        }}
      ></i>
      <span>Edit</span>
    </div>

    {/* HISTORY */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-clock-rotate-left mx-2"
        onClick={(e) => {
          e.stopPropagation();
          props.openHistory(note);
        }}
      ></i>
      <span>History</span>
    </div>

    {/* DELETE */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-trash mx-2"
        onClick={async (e) => {
          e.stopPropagation();
          const success = await deleteNote(note._id);
          if (success) props.showAlert("Deleted successfully", "success");
          else props.showAlert("Delete failed", "danger");
        }}
      ></i>
      <span>Delete</span>
    </div>
  </div>

  {/* ROW 2 */}
  <div className="d-flex mt-1">
    {/* COPY */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-copy mx-2"
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(note.description);
          props.showAlert("Copied to clipboard", "success");
        }}
      ></i>
      <span>Copy</span>
    </div>

    {/* SHARE */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-share-nodes mx-2"
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
      <span>Share</span>
    </div>

    {/* SUMMARY */}
    <div className="icon-wrapper">
      <i
        className="fa-solid fa-wand-magic-sparkles mx-2"
        onClick={(e) => {
          e.stopPropagation();
          props.generateSummary(note);
        }}
      ></i>
      <span>Summary</span>
    </div>
  </div>

</div>
            </div>
          </div>

          <p className="card-text mt-2">{props.searchType === "description"  ? highlightText(truncate(note?.description, 55), props.search)  : truncate(note?.description, 55)}</p>
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