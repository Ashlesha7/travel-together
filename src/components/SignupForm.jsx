// import React, { useState } from "react";
// import axios from "axios";

// function SignupForm({ switchToLogin }) {
//     const [currentStep, setCurrentStep] = useState(1);
//     const [loading, setLoading] = useState(false); // Loading state

//     // State to store form data
//     const [formData, setFormData] = useState({
//         fullName: "",
//         email: "",
//         phoneNumber: "",
//         citizenshipNumber: "",
//         citizenshipPhoto: null,
//         profilePhoto: null,
//         password: "",
//         confirmPassword: "",
//     });

//     // Handle text input change
//     const handleChange = (e) => {
//         const { id, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [id]: value,
//         }));
//     };

//     // Handle file input change
//     const handleFileChange = (e) => {
//         const { id, files } = e.target;
//         if (files.length > 0) {
//             setFormData((prev) => ({
//                 ...prev,
//                 [id]: files[0], // Store selected file
//             }));
//         }
//     };

//     // Navigate between steps
//     const nextStep = () => {
//         if (currentStep < 3) setCurrentStep(currentStep + 1);
//     };

//     const prevStep = () => {
//         if (currentStep > 1) setCurrentStep(currentStep - 1);
//     };

//     // Submit form data to the backend
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // ✅ Basic validation
//         if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.citizenshipNumber) {
//             alert("All fields are required!");
//             return;
//         }

//         if (formData.password !== formData.confirmPassword) {
//             alert("Passwords do not match!");
//             return;
//         }

//         if (!formData.citizenshipPhoto || !formData.profilePhoto) {
//             alert("Please upload both Citizenship Photo and Profile Photo.");
//             return;
//         }

//         // ✅ Prepare FormData for file upload
//         const data = new FormData();
//         data.append("fullName", formData.fullName);
//         data.append("email", formData.email);
//         data.append("phoneNumber", formData.phoneNumber);
//         data.append("citizenshipNumber", formData.citizenshipNumber);
//         data.append("citizenshipPhoto", formData.citizenshipPhoto);
//         data.append("profilePhoto", formData.profilePhoto);
//         data.append("password", formData.password);

//         try {
//             setLoading(true);
//             console.log("Sending signup request:", formData);

//             const response = await axios.post("http://localhost:5000/api/signup", data, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             console.log("Signup successful:", response.data);
//             alert(response.data.message);
//             switchToLogin(); // Switch to login form on success
//         } catch (error) {
//             console.error("Signup failed:", error.response?.data);
//             alert(error.response?.data?.message || "Signup failed. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="form-container active">
//             <div className="progress-bar active">
//                 <div className="progress" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
//             </div>
//             <h2>Signup - Step {currentStep}</h2>
//             <form onSubmit={handleSubmit}>
//                 {currentStep === 1 && (
//                     <div className="form-step active">
//                         <label htmlFor="fullName">Full Name</label>
//                         <input type="text" id="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} required />

//                         <label htmlFor="email">Email</label>
//                         <input type="email" id="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />

//                         <label htmlFor="phoneNumber">Phone Number</label>
//                         <input type="tel" id="phoneNumber" placeholder="Enter your phone number" value={formData.phoneNumber} onChange={handleChange} required />

//                         <button type="button" className="next-btn" onClick={nextStep}>Next</button>
//                         <p className="switch">
//                             Already have an account?{" "}
//                             <button type="button" onClick={switchToLogin} className="link-button">Login</button>
//                         </p>
//                     </div>
//                 )}

//                 {currentStep === 2 && (
//                     <div className="form-step active">
//                         <label htmlFor="citizenshipNumber">Citizenship Number</label>
//                         <input type="text" id="citizenshipNumber" placeholder="Enter your citizenship number" value={formData.citizenshipNumber} onChange={handleChange} required />

//                         <label htmlFor="citizenshipPhoto">Upload Citizenship Photo</label>
//                         <input type="file" id="citizenshipPhoto" accept="image/*" onChange={handleFileChange} required />

//                         <button type="button" className="prev-btn" onClick={prevStep}>Previous</button>
//                         <button type="button" className="next-btn" onClick={nextStep}>Next</button>
//                     </div>
//                 )}

//                 {currentStep === 3 && (
//                     <div className="form-step active">
//                         <label htmlFor="profilePhoto">Upload Your Photo</label>
//                         <input type="file" id="profilePhoto" accept="image/*" onChange={handleFileChange} required />

//                         <label htmlFor="password">Create Password</label>
//                         <input type="password" id="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />

//                         <label htmlFor="confirmPassword">Confirm Password</label>
//                         <input type="password" id="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />

//                         <button type="button" className="prev-btn" onClick={prevStep}>Previous</button>
//                         <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
//                     </div>
//                 )}
//             </form>
//         </div>
//     );
// }

// export default SignupForm;

// import React, { useState } from "react";
// import axios from "axios";

// function SignupForm({ switchToLogin }) {
//     const [currentStep, setCurrentStep] = useState(1);
//     const [loading, setLoading] = useState(false);

//     // State to store form data
//     const [formData, setFormData] = useState({
//         fullName: "",
//         email: "",
//         phoneNumber: "",
//         citizenshipNumber: "",
//         citizenshipPhoto: null,
//         profilePhoto: null,
//         password: "",
//         confirmPassword: "",
//     });

//     // Handle text input change
//     const handleChange = (e) => {
//         const { id, value } = e.target;
//         setFormData((prev) => ({ ...prev, [id]: value }));
//     };

//     // Handle file input change
//     const handleFileChange = (e) => {
//         const { id, files } = e.target;
//         if (files.length > 0) {
//             setFormData((prev) => ({ ...prev, [id]: files[0] }));
//         }
//     };

//     // Navigate between steps
//     const nextStep = () => {
//         if (currentStep < 3) setCurrentStep(currentStep + 1);
//     };

//     const prevStep = () => {
//         if (currentStep > 1) setCurrentStep(currentStep - 1);
//     };

//     // Submit form data to the backend
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // ✅ Validate all fields
//         if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.citizenshipNumber) {
//             alert("All fields are required!");
//             return;
//         }

//         if (formData.password.length < 6) {
//             alert("Password must be at least 6 characters long!");
//             return;
//         }

//         if (formData.password !== formData.confirmPassword) {
//             alert("Passwords do not match!");
//             return;
//         }

//         if (!formData.citizenshipPhoto || !formData.profilePhoto) {
//             alert("Please upload both Citizenship Photo and Profile Photo.");
//             return;
//         }

//         // ✅ Prepare FormData for file upload
//         const data = new FormData();
//         data.append("fullName", formData.fullName);
//         data.append("email", formData.email);
//         data.append("phoneNumber", formData.phoneNumber);
//         data.append("citizenshipNumber", formData.citizenshipNumber);
//         data.append("password", formData.password);
//         data.append("citizenshipPhoto", formData.citizenshipPhoto);
//         data.append("profilePhoto", formData.profilePhoto);

//         try {
//             setLoading(true);
//             console.log("📤 Sending signup request...", data);

//             const response = await axios.post("http://localhost:5000/api/signup", data, {
//                 headers: { "Content-Type": "multipart/form-data" },
//             });

//             console.log("✅ Signup successful:", response.data);
//             alert(response.data.msg || "Signup successful!");
//             switchToLogin(); // Switch to login form on success
//         } catch (error) {
//             console.error("❌ Signup failed:", error.response?.data);
//             alert(error.response?.data?.msg || "Signup failed. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="form-container active">
//             <div className="progress-bar active">
//                 <div className="progress" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
//             </div>
//             <h2>Signup - Step {currentStep}</h2>
//             <form onSubmit={handleSubmit}>

//                 {/* STEP 1: Basic Details */}
//                 {currentStep === 1 && (
//                     <div className="form-step active">
//                         <label htmlFor="fullName">Full Name</label>
//                         <input type="text" id="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} required />

//                         <label htmlFor="email">Email</label>
//                         <input type="email" id="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />

//                         <label htmlFor="phoneNumber">Phone Number</label>
//                         <input type="tel" id="phoneNumber" placeholder="Enter your phone number" value={formData.phoneNumber} onChange={handleChange} required />

//                         <button type="button" className="next-btn" onClick={nextStep}>Next</button>
//                         <p className="switch">
//                             Already have an account?{" "}
//                             <button type="button" onClick={switchToLogin} className="link-button">Login</button>
//                         </p>
//                     </div>
//                 )}

//                 {/* STEP 2: Citizenship Information */}
//                 {currentStep === 2 && (
//                     <div className="form-step active">
//                         <label htmlFor="citizenshipNumber">Citizenship Number</label>
//                         <input type="text" id="citizenshipNumber" placeholder="Enter your citizenship number" value={formData.citizenshipNumber} onChange={handleChange} required />

//                         <label htmlFor="citizenshipPhoto">Upload Citizenship Photo</label>
//                         <input type="file" id="citizenshipPhoto" accept="image/*" onChange={handleFileChange} required />

//                         <button type="button" className="prev-btn" onClick={prevStep}>Previous</button>
//                         <button type="button" className="next-btn" onClick={nextStep}>Next</button>
//                     </div>
//                 )}

//                 {/* STEP 3: Profile Photo & Password */}
//                 {currentStep === 3 && (
//                     <div className="form-step active">
//                         <label htmlFor="profilePhoto">Upload Your Photo</label>
//                         <input type="file" id="profilePhoto" accept="image/*" onChange={handleFileChange} required />

//                         <label htmlFor="password">Create Password</label>
//                         <input type="password" id="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />

//                         <label htmlFor="confirmPassword">Confirm Password</label>
//                         <input type="password" id="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} required />

//                         <button type="button" className="prev-btn" onClick={prevStep}>Previous</button>
//                         <button type="submit" className="submit-btn" disabled={loading}>
//                             {loading ? "Submitting..." : "Submit"}
//                         </button>
//                     </div>
//                 )}
//             </form>
//         </div>
//     );
// }

// export default SignupForm;


import React, { useState } from "react";
import axios from "axios";

function SignupForm({ switchToLogin }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // State to store form data for manual signup
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        citizenshipNumber: "",
        citizenshipPhoto: null,
        profilePhoto: null,
        password: "",
        confirmPassword: "",
    });

    // Handle text input change
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const { id, files } = e.target;
        if (files.length > 0) {
            setFormData((prev) => ({ ...prev, [id]: files[0] }));
        }
    };

    // Navigate between steps
    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // Submit form data to the backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION for manual signup:
        // These fields must be provided for a manual signup.
        if (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.citizenshipNumber) {
            alert("All fields are required!");
            return;
        }

        if (formData.password.length < 6) {
            alert("Password must be at least 6 characters long!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!formData.citizenshipPhoto || !formData.profilePhoto) {
            alert("Please upload both Citizenship Photo and Profile Photo.");
            return;
        }

        // Prepare FormData for file upload
        const data = new FormData();
        data.append("fullName", formData.fullName);
        data.append("email", formData.email);
        data.append("phoneNumber", formData.phoneNumber);
        data.append("citizenshipNumber", formData.citizenshipNumber);
        data.append("password", formData.password);
        data.append("citizenshipPhoto", formData.citizenshipPhoto);
        data.append("profilePhoto", formData.profilePhoto);

        try {
            setLoading(true);
            console.log("📤 Sending signup request...", data);

            const response = await axios.post("http://localhost:8080/api/signup", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("✅ Signup successful:", response.data);
            alert(response.data.msg || "Signup successful!");
            switchToLogin(); // Switch to login form on success
        } catch (error) {
            console.error("❌ Signup failed:", error.response?.data);
            alert(error.response?.data?.msg || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container active">
            <div className={`progress-bar ${currentStep > 1 ? 'active' : ''}`}>
                <div
                    className="progress"
                    style={{ width: `${(currentStep - 1) * 50}%` }}
                ></div>
            </div>
            <h2>Signup - Step {currentStep}</h2>
            <form onSubmit={handleSubmit}>

                {/* STEP 1: Basic Details */}
                {currentStep === 1 && (
                    <div className="form-step active">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            placeholder="Enter your phone number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />

                        <button type="button" className="next-btn" onClick={nextStep}>
                            Next
                        </button>
                        <p className="switch">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={switchToLogin}
                                className="link-button"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                )}

                {/* STEP 2: Citizenship Information */}
                {currentStep === 2 && (
                    <div className="form-step active">
                        <label htmlFor="citizenshipNumber">Citizenship Number</label>
                        <input
                            type="text"
                            id="citizenshipNumber"
                            placeholder="Enter your citizenship number"
                            value={formData.citizenshipNumber}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="citizenshipPhoto">Upload Citizenship Photo</label>
                        <input
                            type="file"
                            id="citizenshipPhoto"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />

                        <button type="button" className="prev-btn" onClick={prevStep}>
                            Previous
                        </button>
                        <button type="button" className="next-btn" onClick={nextStep}>
                            Next
                        </button>
                    </div>
                )}

                {/* STEP 3: Profile Photo & Password */}
                {currentStep === 3 && (
                    <div className="form-step active">
                        <label htmlFor="profilePhoto">Upload Your Photo</label>
                        <input
                            type="file"
                            id="profilePhoto"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                        />

                        <label htmlFor="password">Create Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />

                        <button type="button" className="prev-btn" onClick={prevStep}>
                            Previous
                        </button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default SignupForm;
