const API_URL = "http://localhost:5000/api/user-profile";

// Fetch user data from the backend
export const fetchUserData = async () => {
    try {
        const response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        return {};
    }
};

// Update user profile in the backend
export const updateUserProfile = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};
