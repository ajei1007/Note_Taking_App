import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNote } from "../app/notesSlice";

const NoteForm = () => {
  const dispatch = useDispatch();
  const [noteData, setNoteData] = useState({ title: "", description: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createNote(noteData));
    setNoteData({ title: "", description: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-3 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          type="text"
          placeholder="Enter the note title"
          value={noteData.title}
          onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Enter the note description"
          value={noteData.description}
          onChange={(e) => setNoteData({ ...noteData, description: e.target.value })}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          rows="4"
        ></textarea>
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        Add Note
      </button>
    </form>
  );
};

export default NoteForm;
