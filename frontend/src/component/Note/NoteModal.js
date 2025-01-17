import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createNote, updateNote, deleteNote } from "../app/notesSlice";
import VoiceRecorder from "../VoiceRecorder/VoiceRecorder";
import api from "../../api";

const NoteModal = ({ type, note, onEdit, onClose }) => {
    const dispatch = useDispatch();
    const [noteData, setNoteData] = useState({ title: "", description: "", audio: null });
    const [audioBlob, setAudioBlob] = useState(null);

    useEffect(() => {
        if (type === "edit" || type === "detail") {
            setNoteData({ title: note.title, description: note.description, audio: note?.audio_secure_url });
        } else {
            setNoteData({ title: "", description: "", audio: null });
        }
    }, [type, note]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let audioUrl = null;

        if (noteData.audio) {
            audioUrl = "origin";
        }

        if (audioBlob) {
            const formData = new FormData();
            formData.append("file", audioBlob, "note-audio.mp3");
            try {
                const response = await api.post("/api/upload-audio/", formData);
                audioUrl = response.data.file_url;
            } catch (error) {
                console.error("Failed to upload audio:", error.message);
                return;
            }
        }

        const updatedData = {
            title: noteData.title,
            description: noteData.description,
            ...(audioUrl && { audio_url: audioUrl }), // Retain or use updated audio URL
        };

        try {
            if (type === "new") {
                await dispatch(createNote(updatedData)).unwrap();
            } else if (type === "edit") {
                await dispatch(updateNote({ id: note.id, updatedData })).unwrap();
            }
            onClose();
        } catch (error) {
            console.error("Error saving note:", error.message);
        }
    };

    const handleDelete = () => {
        dispatch(deleteNote(note.id))
            .unwrap()
            .then(() => onClose());
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[50%] p-6">
                <h2 className="text-lg font-bold mb-4">
                    {type === "new"
                        ? "Create Note"
                        : type === "edit"
                            ? "Edit Note"
                            : "Note Details"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={noteData.title}
                            onChange={(e) =>
                                setNoteData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            disabled={type === "detail"}
                            className={`w-full border rounded-lg px-4 py-2 ${type === "detail"
                                ? "bg-gray-100 cursor-not-allowed"
                                : "focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={noteData.description}
                            onChange={(e) =>
                                setNoteData((prev) => ({ ...prev, description: e.target.value }))
                            }
                            disabled={type === "detail"}
                            className={`w-full border rounded-lg px-4 py-2 ${type === "detail"
                                ? "bg-gray-100 cursor-not-allowed"
                                : "focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                }`}
                            rows="10"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Record Audio
                        </label>
                        <VoiceRecorder
                            type={type}
                            onSaveAudio={(blob) => {
                                setAudioBlob(blob);
                                if (!blob) {
                                    setNoteData((prev) => ({ ...prev, audio: null }));
                                }
                            }}
                            existingAudio={noteData.audio}
                        />

                    </div>

                    {type !== "detail" && (
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                            >
                                {type === "new" ? "Create" : "Update"}
                            </button>
                        </div>
                    )}

                    {type === "detail" && (
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => onEdit(note)}
                                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors w-24"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete()}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 w-24"
                            >
                                Delete
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-24"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default NoteModal;
