import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000", // Replace with your API base URL
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response, // Return the response if successful
  async (error) => {
    const originalRequest = error.config;

    // If token is invalid or expired, attempt to refresh
    if (
      error.response?.status === 401 && // Unauthorized error
      error.response.data?.code === "token_not_valid" &&
      !originalRequest._retry // Prevent infinite retry loop
    ) {
      originalRequest._retry = true; // Mark request as retried

      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await axios.post(
            "http://localhost:8000/auth/token/refresh/",
            { refresh: refreshToken }
          );
          const newToken = response.data.access;

          // Update the token in localStorage
          localStorage.setItem("token", newToken);

          // Update the Authorization header for the failed request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the failed request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token", refreshError);

          // Clear tokens and redirect to login on refresh failure
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/";
        }
      } else {
        // No refresh token available, log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }

    // Reject the original error if it's not a token issue
    return Promise.reject(error);
  }
);

export default api;
