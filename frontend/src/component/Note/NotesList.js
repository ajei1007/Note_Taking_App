import React from "react";
import { useDispatch } from "react-redux";
import { deleteNote } from "../app/notesSlice";

const NotesList = ({ notes, onEdit, onDetail }) => {
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    dispatch(deleteNote(id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <div
          key={note.id}
          className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow h-52 flex flex-col justify-between cursor-pointer"
          onClick={(e) => {
            if (e.target.tagName !== "BUTTON") {
              onDetail(note);
            }
          }}
        >
          <div className="h-full flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 truncate">{note.title}</h3>
              <p className="text-gray-600 mb-2 overflow-hidden text-ellipsis line-clamp-3">
                {note.description}
              </p>
            </div>
            <p className="text-sm text-gray-400 mb-3 text-right">
              {new Date(note.updated_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => onEdit(note)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(note.id);
              }}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
