import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";
import { toast } from "react-toastify";

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await api.post("/auth/login/", credentials);
    localStorage.setItem("token", response.data.access);
    localStorage.setItem("refresh_token", response.data.refresh);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || "Login failed. Please try again.";
    toast.error(errorMsg);
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const register = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.detail || "Registration failed. Please try again.";
    toast.error(errorMsg);
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      toast.success("You have successfully logged out!");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.access;
        state.loading = false;
        state.error = null;
        toast.success("Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
