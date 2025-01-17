import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import api from "../../api";

export const fetchNotes = createAsyncThunk("notes/fetchNotes", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/notes/", { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createNote = createAsyncThunk("notes/createNote", async (noteData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/notes/", noteData);
    toast.success("Note created successfully!");
    return response.data;
  } catch (error) {
    toast.error("Failed to create note. Please try again.");
    return rejectWithValue(error.response.data);
  }
});

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/notes/${id}/`, updatedData);
      toast.success("Note updated successfully!");
      return response.data;
    } catch (error) {
      toast.error("Failed to update note. Please try again.");
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteNote = createAsyncThunk("notes/deleteNote", async (noteId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/notes/${noteId}/`);
    toast.success("Note deleted successfully!");
    return noteId;
  } catch (error) {
    toast.error("Failed to delete note. Please try again.");
    return rejectWithValue(error.response.data);
  }
});

const notesSlice = createSlice({
  name: "notes",
  initialState: { notes: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notes = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.push(action.payload);
        state.loading = false;
      })
      .addCase(createNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note.id !== action.payload);
        state.loading = false; // Set loading to false
      })
      .addCase(deleteNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false; // Set loading to false
        state.error = action.payload;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex((note) => note.id === action.payload.id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
        state.loading = false; // Set loading to false
      })
      .addCase(updateNote.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.loading = false; // Set loading to false
        state.error = action.payload;
      });
  },
});

export default notesSlice.reducer;
