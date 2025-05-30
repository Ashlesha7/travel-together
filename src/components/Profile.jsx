import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navigation from "./Navigation"; 
import "./Profile.css";                
import Footer from "./Footer";
import { useParams } from "react-router-dom";
import ProfilePublic from "./ProfilePublic";

export default function Profile() {
  // 1) All state variables for editing fields
  const { id } = useParams(); 
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser._id;
  const isOwner = !id || id === currentUserId;
  const [user, setUser] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [reviews, setReviews] = useState([]);   
  const [errors, setErrors] = useState({});


  // "About Me" states
  const [showAboutEdit, setShowAboutEdit] = useState(false);
  const [tempHomeBase, setTempHomeBase] = useState("");
  const [tempBirthYear, setTempBirthYear] = useState("");
  const [tempGender, setTempGender] = useState("");

  // "My Bio" states
  const [showBioEdit, setShowBioEdit] = useState(false);
  const [tempBio, setTempBio] = useState("");

  // Citizenship Number
  const [showCNumberEdit, setShowCNumberEdit] = useState(false);
  const [tempCitizenshipNumber, setTempCitizenshipNumber] = useState("");

  // Citizenship Photo
  const [showCPhotoEdit, setShowCPhotoEdit] = useState(false);
  const [tempCPhotoFile, setTempCPhotoFile] = useState(null);

  // Phone Number
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [tempPhone, setTempPhone] = useState("");

  // Email
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // Settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Format joined date
  const formatJoinedDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long" };
    return date.toLocaleDateString(undefined, options);
  };

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      let response = await axios.get("http://localhost:8080/api/user-profile", {
        headers: { Authorization: token },
      });

      if (response.data.requiresRefresh) {
        const refreshResponse = await axios.post(
          "http://localhost:8080/api/refresh-token",
          { refreshToken: localStorage.getItem("refreshToken") }
        );
        localStorage.setItem("token", refreshResponse.data.token);
        response = await axios.get("http://localhost:8080/api/user-profile", {
          headers: { Authorization: refreshResponse.data.token },
        });
      }

      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching user:", error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) return;  
    setReviews([]);                             
    const token = localStorage.getItem("token");
    if (!token) return;
  
    const profileId = id || user._id;  //owner
    if (!profileId) return;           
    axios
      .get(`http://localhost:8080/api/reviews/user/${profileId}`, {
        headers: { Authorization: token },
      })
      .then((res) => setReviews(res.data))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [user, id]);
  

  // Cover photo upload
  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("coverPhoto", coverFile);

      await axios.patch(
        "http://localhost:8080/api/user-profile/cover",
        formData,
        { headers: { Authorization: token } }
      );
      await fetchUser();
      setCoverFile(null);
      alert("Cover photo updated!");
    } catch (error) {
      console.error("Error uploading cover photo:", error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.body.classList.remove("dark-theme");
    setUser(null);
    window.location.href = "/";
  };

  // 5) About Me
  const handleAboutEdit = () => {
    setTempHomeBase(user?.homeBase || "");
    setTempBirthYear(user?.birthYear || "");
    setTempGender(user?.gender || "");
    setShowAboutEdit(true);
  };
  

  const saveAboutMe = async () => {
    // 1) validate format
  const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!dobRegex.test(tempBirthYear)) {
    setErrors(err => ({ ...err, birthYear: "Please use DD/MM/YYYY" }));
    return;
  }

  // 2) compute age
  const [d, m, y] = tempBirthYear.split("/").map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  if (age < 18) {
    setErrors(err => ({ ...err, birthYear: "You must be at least 18" }));
    return;
  }

  // 3) clear any previous error
  setErrors(err => ({ ...err, birthYear: "" }));
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const form = new FormData();
      form.append("homeBase", tempHomeBase);
      form.append("birthYear", tempBirthYear);
      form.append("gender", tempGender);

      const res = await axios.put(
        "http://localhost:8080/api/user-profile",
        form,
        { headers: { Authorization: token } }
      );

      // Persist updated user in localStorage
      localStorage.setItem("user", JSON.stringify(res.data.user));
      await fetchUser();
      setShowAboutEdit(false);
    } catch (error) {
      console.error("Error saving About Me:", error);
    }
  };

  // 6) My Bio
  const handleBioEdit = () => {
    setTempBio(user?.bio || "");
    setShowBioEdit(true);
  };

  const saveBio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const form = new FormData();
      form.append("bio", tempBio);

      await axios.put("http://localhost:8080/api/user-profile", form, {
        headers: { Authorization: token },
      });
      await fetchUser();
      setShowBioEdit(false);
    } catch (error) {
      console.error("Error saving Bio:", error);
    }
  };
  

  // 7) Citizenship Number
  const handleCNumberEdit = () => {
    setTempCitizenshipNumber(user?.citizenshipNumber || "");
    setShowCNumberEdit(true);
  };

  const saveCNumber = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const form = new FormData();
      form.append("citizenshipNumber", tempCitizenshipNumber);

      await axios.put("http://localhost:8080/api/user-profile", form, {
        headers: { Authorization: token },
      });
      await fetchUser();
      setShowCNumberEdit(false);
    } catch (error) {
      console.error("Error saving Citizenship Number:", error);
    }
  };

  // 8) Citizenship Photo
  const handleCPhotoEdit = () => {
    setTempCPhotoFile(null);
    setShowCPhotoEdit(true);
  };

  const handleCPhotoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTempCPhotoFile(e.target.files[0]);
    }
  };

  const saveCPhoto = async () => {
    if (!tempCPhotoFile) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const formData = new FormData();
      formData.append("citizenshipPhoto", tempCPhotoFile);

      await axios.put(
        "http://localhost:8080/api/user-profile",
        formData,
        { headers: { Authorization: token } }
      );
      await fetchUser();
      setShowCPhotoEdit(false);
    } catch (error) {
      console.error("Error saving Citizenship Photo:", error);
    }
  };

  // 9) Phone Number
  const handlePhoneEdit = () => {
    setTempPhone(user?.phoneNumber || "");
    setShowPhoneEdit(true);
  };

  const savePhone = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const form = new FormData();
      form.append("phoneNumber", tempPhone);

      await axios.put("http://localhost:8080/api/user-profile", form, {
        headers: { Authorization: token },
      });
      await fetchUser();
      setShowPhoneEdit(false);
    } catch (error) {
      console.error("Error saving Phone Number:", error);
    }
  };

  // 10) Email
  const handleEmailEdit = () => {
    setTempEmail(user?.email || "");
    setShowEmailEdit(true);
  };

  const saveEmail = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const form = new FormData();
      form.append("email", tempEmail);

      await axios.put("http://localhost:8080/api/user-profile", form, {
        headers: { Authorization: token },
      });
      await fetchUser();
      setShowEmailEdit(false);
    } catch (error) {
      console.error("Error saving Email:", error);
    }
  };

  // 11) Rendering the Profile component
  return (
    <div className="profile-page">
      <Navigation user={user} />
      {isOwner ? (
        <>
      {/* fullwidth cover */}
      <section className="fullwidth-cover">
        {user?.coverPhoto ? (
          <img
            src={`http://localhost:8080/${user.coverPhoto}`}
            alt="Cover"
            className="cover-image"
          />
        ) : (
          <div className="cover-placeholder">No Cover Photo</div>
        )}

        <div className="cover-upload-controls">
          <label htmlFor="coverFile" className="cover-upload-label">
            Choose Cover
          </label>
          <input
            id="coverFile"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            style={{ display: "none" }}
          />
          <button onClick={handleCoverUpload} disabled={!coverFile}>
            Upload
          </button>
        </div>
      </section>

      {/* Settings */}
      <div className="settings-container">
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          Settings
        </button>
      </div>
      {showSettings && (
        <div className="settings-modal">
          <div className="settings-modal-content">
             <button
              className="modal-close-x"
              onClick={() => setShowSettings(false)}
              aria-label="Close settings"
            >
              x
            </button>
            <h2>Settings</h2>
            <div className="settings-list">
              <div className="settings-item">
                <span>Theme</span>
                <div className="theme-buttons">
                  <button
                  onClick={() => {
                    localStorage.setItem("theme", "light");
                    document.body.classList.remove("dark-theme");
                     }}
                     disabled={!document.body.classList.contains("dark-theme")} // Disable if already light
                  >
                    Light 
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem("theme", "dark");
                      document.body.classList.add("dark-theme");
                    }}
                    disabled={document.body.classList.contains("dark-theme")} // Disable if already dark
                  >
                    Dark 
                  </button>
                </div>
              </div>
              <div className="settings-item">
                <span>Logout</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incomplete banner */}
      {user &&
      user.isGoogleUser && 
        (!user.phoneNumber ||
          !user.citizenshipNumber ||
          !user.citizenshipPhoto ||
          !user.birthYear) && (
          <div className="incomplete-profile-banner">
            Your profile is incomplete. Please update your phone number, Birth Year,
            citizenship number, and upload your citizenship photo to gain full
            access to all features.
          </div>
        )}

      {/* Main Content */}  
      <div className="profile-main">
        <div className="profile-header">
          <div className="profile-picture-wrapper">
            {user?.profilePhoto ? (
              <img
                src={
                  user.profilePhoto.startsWith("http")
                    ? user.profilePhoto
                    : `http://localhost:8080/${user.profilePhoto}`
                }
                alt="User Profile"
                className="profile-picture-circle"
              />
            ) : (
              <div className="profile-picture-placeholder">
                No Profile Photo
              </div>
            )}
            <span className="profile-label">Profile</span>
          </div>
          <h1 className="profile-username">
            {user?.fullName || "User Name"}
          </h1>
        </div>

        <div className="info-container">
          {/* About Me */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>About Me</h2>
              <button className="edit-btn" onClick={handleAboutEdit}>
                {user?.homeBase || user?.birthYear || user?.gender
                  ? "Edit"
                  : "Add"}
              </button>
            </div>
            <div className="section-content">
              <p>Home base: {user?.homeBase || "Not specified"}</p>
              <p>
                Joined in:{" "}
                {user?.createdAt
                  ? formatJoinedDate(user.createdAt)
                  : "N/A"}
              </p>
              <p>Birth Year: {user?.birthYear || "Not specified"}</p>
              {user?.birthYear && (() => {
                const [d,m,y] = user.birthYear.split("/").map(Number);
                const b = new Date(y,m-1,d), t = new Date();
                let age = t.getFullYear() - b.getFullYear();
                if (t.getMonth()<b.getMonth()|| (t.getMonth()===b.getMonth()&&t.getDate()<b.getDate())) age--;
                return <p>Age: {age}</p>;
              })()}
              <p>Gender: {user?.gender || "Not specified"}</p>
            </div>
          </div>

          <hr />

          {/* My Bio */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>My Bio</h2>
              <button className="edit-btn" onClick={handleBioEdit}>
                {user?.bio ? "Edit" : "Add"}
              </button>
            </div>
            <div className="section-content">
              <p>{user?.bio || "No bio yet."}</p>
            </div>
          </div>

          <hr />

          {/* Citizenship Number */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Citizenship Number</h2>
              <button className="edit-btn" onClick={handleCNumberEdit}>
                {user?.citizenshipNumber ? "Edit" : "Add"}
              </button>
            </div>
            <div className="section-content">
              <p>{user?.citizenshipNumber || "Not specified"}</p>
            </div>
          </div>

          <hr />

          {/* Citizenship Photo */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Citizenship Photo</h2>
              <button className="edit-btn" onClick={handleCPhotoEdit}>
                {user?.citizenshipPhoto ? "Edit" : "Add"}
              </button>
            </div>
            <div className="section-content">
              {user?.citizenshipPhoto ? (
                <img
                  src={`http://localhost:8080/${user.citizenshipPhoto}`}
                  alt="Citizenship"
                  className="citizenship-photo"
                />
              ) : (
                <p>Not specified</p>
              )}
            </div>
          </div>

          <hr />

          {/* Phone Number */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Phone Number</h2>
              <button className="edit-btn" onClick={handlePhoneEdit}>
                {user?.phoneNumber ? "Edit" : "Add"}
              </button>
            </div>
            <div className="section-content">
              <p>{user?.phoneNumber || "Not specified"}</p>
            </div>
          </div>

          <hr />

          {/* Email */}
          <div className="profile-info-section">
            <div className="section-header">
              <h2>Email</h2>
              <button className="edit-btn" onClick={handleEmailEdit}>
                {user?.email ? "Edit" : "Add"}
              </button>
            </div>
            <div className="section-content">
              <p>{user?.email || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {showAboutEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit About Me</h3>
            <label>Home Base:</label>
            <input
              type="text"
              value={tempHomeBase}
              onChange={(e) => setTempHomeBase(e.target.value)}
            />
            <label>Birth Date (DD/MM/YYYY):</label>
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={tempBirthYear}
              onChange={(e) => setTempBirthYear(e.target.value)}
              //pattern="\d{2}/\d{2}/\d{4}"
              //inputMode="numeric"
              required
              />
              {errors.birthYear && <span className="error-text">{errors.birthYear}</span>}
            
            <label>Gender:</label>
            <select
              value={tempGender}
              onChange={(e) => setTempGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            <div className="modal-buttons">
              <button onClick={() => setShowAboutEdit(false)}>Cancel</button>
              <button onClick={saveAboutMe}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showBioEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Bio</h3>
            <textarea
              rows="4"
              value={tempBio}
              onChange={(e) => setTempBio(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowBioEdit(false)}>Cancel</button>
              <button onClick={saveBio}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showCNumberEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Citizenship Number</h3>
            <input
              type="text"
              value={tempCitizenshipNumber}
              onChange={(e) => setTempCitizenshipNumber(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowCNumberEdit(false)}>Cancel</button>
              <button onClick={saveCNumber}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showCPhotoEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Citizenship Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleCPhotoFileChange}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowCPhotoEdit(false)}>Cancel</button>
              <button onClick={saveCPhoto}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showPhoneEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Phone Number</h3>
            <input
              type="text"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowPhoneEdit(false)}>Cancel</button>
              <button onClick={savePhone}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showEmailEdit && (
        <div className="edit-modal">
          <div className="modal-content">
            <h3>Edit Email</h3>
            <input
              type="email"
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowEmailEdit(false)}>Cancel</button>
              <button onClick={saveEmail}>Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="info-container reviews-container">
        <hr />
        <div className="profile-info-section">
           <h2>Reviews</h2>
           {reviews.length === 0 ? (
              <p>No reviews yet.</p>  
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-item">
                  <div className="stars">
                    {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  <small className="review-meta">
                    by {r.reviewerId?.fullName || "Anonymous"} on{" "}
                    {new Date(r.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
        </div>
        </div>
      </>
      ) : (
        <ProfilePublic userId={id} />
      )}
      <Footer />
    </div> 
  );
}
