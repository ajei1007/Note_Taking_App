import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes } from "../component/app/notesSlice";
import NotesList from "../component/Note/NotesList";
import NoteModal from "../component/Note/NoteModal";
import { logout } from "../component/app/authSlice";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { notes, loading, error } = useSelector((state) => state.notes);
    const [modalType, setModalType] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

    useEffect(() => {
        dispatch(fetchNotes({ date: selectedDate }));
    }, [dispatch, selectedDate]);

    const handleLogout = () => {
        dispatch(logout());
        window.location.reload();
    };

    const openModal = (type, note = null) => {
        setModalType(type);
        setSelectedNote(note);
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedNote(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 pb-6">
            <header className="sticky top-0 z-50 p-4 bg-white shadow-md rounded-b-lg">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-indigo-600">
                        Notes Board
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main
                className="mt-6 mx-6 p-6 bg-white shadow-md rounded-lg overflow-auto"
                style={{ minHeight: "calc(100vh - 10rem)" }}
            >
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="date"
                            className="border border-gray-300 rounded-lg px-3 py-2"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        <button
                            onClick={() => openModal("new")}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            New Note
                        </button>
                    </div>
                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">Error fetching notes: {error}</p>
                    ) : (
                        <NotesList
                            notes={notes}
                            onEdit={(note) => openModal("edit", note)}
                            onDetail={(note) => openModal("detail", note)}
                        />
                    )}
                </section>
            </main>

            {modalType && (
                <NoteModal
                    type={modalType}
                    note={selectedNote}
                    onEdit={(note) => openModal("edit", note)}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default Dashboard;
