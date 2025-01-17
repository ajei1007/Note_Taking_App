import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import NoteModal from "../NoteModal";
import api from "../../api";

jest.mock("../../api"); // Mock the API module

const mockStore = configureStore([]);

describe("NoteModal Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      notes: {
        notes: [],
        loading: false,
        error: null,
      },
    });
  });

  test("creates a note with audio successfully", async () => {
    // Mock API responses
    api.post.mockResolvedValueOnce({
      data: { file_url: "http://localhost:8000/media/audio_notes/test-audio.mp3" },
    });
    store.dispatch = jest.fn();

    const { getByLabelText, getByText } = render(
      <Provider store={store}>
        <NoteModal type="new" onClose={jest.fn()} />
      </Provider>
    );

    // Fill in the form
    fireEvent.change(getByLabelText(/Title/i), { target: { value: "Test Note" } });
    fireEvent.change(getByLabelText(/Description/i), { target: { value: "Test Description" } });

    // Mock audio file selection
    const audioFile = new Blob(["Test audio data"], { type: "audio/mp3" });
    const audioInput = getByLabelText(/Record Audio/i).querySelector('input[type="file"]');
    Object.defineProperty(audioInput, "files", { value: [audioFile] });
    fireEvent.change(audioInput);

    // Submit the form
    fireEvent.click(getByText(/Create/i));

    // Wait for API call and Redux dispatch
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/api/upload-audio/", expect.any(FormData));
      expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
