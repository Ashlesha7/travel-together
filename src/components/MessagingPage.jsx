// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";
// import Navigation from "./Navigation"; 
// import "./MessagingPage.css";
// import sendIcon from "../assets/Send.png";
// import ReviewForm from "./ReviewForm";



// // Connect to Socket.IO on your backend with the JWT token
// const socket = io("http://localhost:8080", {
//   auth: { token: localStorage.getItem("token") },
// });

// //  helper function to validate a 24-char ObjectId
// function isValidObjectId(id) {
//   return /^[0-9a-fA-F]{24}$/.test(id);
// }



// const MessagingPage = ({ user }) => {
  
//   const [conversations, setConversations] = useState([]);
//   const [activeConversationId, setActiveConversationId] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [unreadCount, setUnreadCount] = useState(0); // State for persistent unread count
//   const [reviews, setReviews] = useState([]);
//   //const [conversationMeta, setConversationMeta] = useState(null);
//   const [canReview, setCanReview] = useState(false);
//   const [showReview, setShowReview] = useState(false);
//   const [reviewDone, setReviewDone] = useState(false);

//   // . Identify the active conversation for display (e.g., header)
//   const activeConv = conversations.find(
//     (conv) => String(conv._id) === String(activeConversationId)
//   );


//   // Read "conversationId" from the URL 
//   const { conversationId: initialConversationId } = useParams();
//   const messagesEndRef = useRef(null);


//   // Log user object 
//   useEffect(() => {
//     console.log("Logged-in user:", user);
//   }, [user]);

//   // 1. Fetch or create conversation list
//   useEffect(() => {
//     if (!user) return;
//     const token = localStorage.getItem("token");

//     axios
//       .get("http://localhost:8080/api/conversations", {
//         headers: { Authorization: token },
//       })
//       .then((res) => {
//         const existingConversations = res.data;
//         setConversations(existingConversations);

//         // If a conversationId is provided in the URL, set that as active
//         if (initialConversationId) {
//           const foundConv = existingConversations.find(
//             (conv) => String(conv._id) === String(initialConversationId)
//           );
//           if (foundConv) {
//             setActiveConversationId(foundConv._id);
//           } else {
//             // If not found, just use the URL param
//             setActiveConversationId(initialConversationId);
//           }
//         }
//       })
//       .catch((err) => console.error("Error fetching conversations:", err));
//   }, [user, initialConversationId]);

//   // 2. Fetch messages for the active conversation
//   useEffect(() => {
//     if (!activeConversationId) return;
//     // **Check if activeConversationId is valid before calling the endpoint**
//     if (!isValidObjectId(activeConversationId)) {
//       console.error(`Invalid conversationId: ${activeConversationId}`);
//       return;
//     }
//     const token = localStorage.getItem("token");

//     axios
//       .get(`http://localhost:8080/api/messages/${activeConversationId}`, {
//         headers: { Authorization: token },
//       })
//       .then((res) => {
//         setMessages(res.data);
//       })
//       .catch((err) => console.error("Error fetching messages:", err));
//   }, [activeConversationId]);

//   // 3. Join the Socket.IO room for the active conversation
//   useEffect(() => {
//     if (activeConversationId) {
//       // Also check validity 
//       if (isValidObjectId(activeConversationId)) {
//         socket.emit("joinConversation", activeConversationId);
//         console.log("Joined conversation room:", activeConversationId);
//       }
//     }
//   }, [activeConversationId]);

//   // 3a. load reviews once trip is completed
//   useEffect(() => {
//     if (!activeConv) return;
//     setReviews([]);
//     // only fetch if tripStatus is "completed"
//     if (activeConv.tripStatus === "completed") {
//       const otherUserId = activeConv.userId;
//       const token = localStorage.getItem("token");
//       axios
//       .get(`http://localhost:8080/api/reviews/user/${otherUserId}`, {
//         headers: { Authorization: token },
//       })
//       .then(res => setReviews(res.data))
//       .catch(err => {
//         console.error("Error fetching reviews:", err);
//         setReviews([]);
//       });
//     }
//   }, [activeConv]);
    
//   useEffect(() => {
//     setCanReview(false);
//     setShowReview(false);
//     setReviewDone(false);
  
//     if (!activeConv || activeConv.tripStatus !== "completed") return;
  
//     // if the current user is *not* in the reviews array, allow them to review
//     const already = reviews.some(
//       r => String(r.reviewerId._id) === String(user.id)
//     );
//     setCanReview(!already);
//   }, [activeConv, reviews, user.id]);


//   // 4. Listen for new messages via Socket.IO
//   useEffect(() => {
//     socket.on("newMessage", (incomingMessage) => {
//       console.log(
//         `New message in conversation ${incomingMessage.conversationId} from sender ${incomingMessage.senderId}`
//       );
//       // Deduplicate by checking _id before adding
//       setMessages((prev) => {
//         if (prev.some((m) => String(m._id) === String(incomingMessage._id))) {
//           return prev;
//         }
//         return [...prev, incomingMessage];
//       });
//       // If the message is from another user, increment unread count
//       if (String(incomingMessage.senderId) !== String(user?.id)) {
//         setUnreadCount((prev) => prev + 1);
//       }
//     });

//     return () => {
//       socket.off("newMessage");
//     };
//   }, [user]);

//   // 4a. Periodically fetch unread count for the active conversation (every 10 seconds)
// // 4a. Periodically fetch unread count 
// useEffect(() => {
//   const token = localStorage.getItem("token");
//   const fetchUnreadCount = () => {
//     // If there's an active conversation, get unread count only for that conversation;
//     // otherwise, get the global unread count.
//     const endpoint = activeConversationId
//       ? `http://localhost:8080/api/messages/unreadCount/${activeConversationId}`
//       : "http://localhost:8080/api/messages/unreadCountGlobal";
//     axios
//       .get(endpoint, { headers: { Authorization: token } })
//       .then((res) => {
//         setUnreadCount(res.data.unreadCount);
//       })
//       .catch((err) => console.error("Error fetching unread count:", err));
//   };

//   fetchUnreadCount();
//   const intervalId = setInterval(fetchUnreadCount, 10000);
//   return () => clearInterval(intervalId);
// }, [activeConversationId]);



//   // 4b. When a conversation is opened, mark its messages as read and reset unread count
//   useEffect(() => {
//     if (activeConversationId) {
//       // Again, only call the endpoint if it's a valid ObjectId
//       if (!isValidObjectId(activeConversationId)) {
//         console.error(`Invalid conversationId for mark-read: ${activeConversationId}`);
//         return;
//       }
//       const token = localStorage.getItem("token");
//       axios
//         .post(
//           "http://localhost:8080/api/messages/mark-read",
//           { conversationId: activeConversationId },
//           { headers: { Authorization: token } }
//         )
//         .then(() => {
//           setUnreadCount(0);
//         })
//         .catch((err) =>
//           console.error("Error marking conversation messages as read:", err)
//         );
//     }
//   }, [activeConversationId]);

//   // 5. Auto-scroll to the bottom when messages update
//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // 6. Send a message using Socket.IO exclusively
//   const handleSendMessage = () => {
//     if (!newMessage.trim() || !activeConversationId) return;
//     const messageContent = newMessage.trim();
//     const outgoingMessage = {
//       senderId: user?.id,
//       text: messageContent,
//       timestamp: new Date().toISOString(),
//     };
//     socket.emit("sendMessage", {
//       conversationId: activeConversationId,
//       message: outgoingMessage,
//     });
//     setNewMessage("");
//   };

//   // // 7. Identify the active conversation for display (e.g., header)
//   // const activeConv = conversations.find(
//   //   (conv) => String(conv._id) === String(activeConversationId)
//   // );

//   // 8. Start a new conversation using a username
//   const handleNewConversation = () => {
//     const otherUsername = prompt("Enter the other user's username:");
//     if (!otherUsername) return;
//     const token = localStorage.getItem("token");

//     axios
//       .get(`http://localhost:8080/api/users?username=${otherUsername}`, {
//         headers: { Authorization: token },
//       })
//       .then((userRes) => {
//         const otherUser = userRes.data;
//         if (!otherUser || !otherUser._id) {
//           alert("User not found.");
//           return;
//         }
//         axios
//           .post(
//             "http://localhost:8080/api/conversations/find-or-create",
//             { otherUserId: otherUser._id },
//             { headers: { Authorization: token } }
//           )
//           .then((convRes) => {
//             const newConv = convRes.data;
//             // If this conversation isn't in our list, add it
//             if (!conversations.find((c) => String(c._id) === String(newConv._id))) {
//               setConversations((prev) => [...prev, newConv]);
//             }
//             setActiveConversationId(newConv._id);
//           })
//           .catch((err) => {
//             console.error("Error creating conversation:", err);
//             alert("Error creating conversation");
//           });
//       })
//       .catch((err) => {
//         console.error("Error fetching user:", err);
//         alert("Error fetching user. Please check the username.");
//       });
//   };

//   return (
//     <>
//       {/* Pass unreadCount to Navigation for persistent badge display */}
//       <Navigation user={user} newMessageCount={unreadCount} />
//       <div className="messaging-container">
//         {/* Left Sidebar: Conversation List */}
//         <div className="left-sidebar">
//   <h2 className="sidebar-title">Your Messages</h2>
//   <button className="new-conversation-btn" onClick={handleNewConversation}>
//     + New Conversation
//   </button>
//   {conversations.length === 0 ? (
//     <p>No conversations yet</p>
//   ) : (
//     conversations.map((conv) => {
//       const convId = conv._id;
//       const convName = conv.name || conv.fullName || "Unnamed";
//       return (
//         <div
//           key={convId}
//           className={`conversation-item ${
//             activeConversationId && String(activeConversationId) === String(convId)
//               ? "active"
//               : ""
//           }`}
//           onClick={() => setActiveConversationId(convId)}
//         >
//           <span className="conversation-name">
//             {convName}
//             {conv.unreadCount > 0 && (
//               <span className="new-message-indicator">
//                 {" "}New 
//                 {/* from <strong>{conv.lastUnreadSenderName}</strong> */}
//               </span>
//             )}
//           </span>
//         </div>
//       );
//     })
//   )}
// </div>


//         {/*  Chat Area */}
//         <div className="chat-area">
//           <div className="chat-header">
//             {activeConv ? (
//               <h3>{activeConv.name || activeConv.fullName}</h3>
//             ) : (
//               <h3>Select a Conversation</h3>
//             )}
//           </div>

//           {/*  reviews  */}
//           {activeConv?.tripStatus === "completed" && (
//           <>
//              {/* 1) Reviews (if any) */}
//              {reviews.length > 0 && (
//               <section className="reviews-section">
//                 <h4>Reviews for {activeConv.name}</h4>
//                 {reviews.map(r => (
//                   <div key={r._id} className="review-card">
//                     <img src={r.reviewerId.profilePhoto} alt={r.reviewerId.fullName} />
//                     <div>
//                     <strong>{r.reviewerId.fullName}</strong>
//                     <span>{r.rating} ★</span>
//                     {r.comment && <p>{r.comment}</p>}
//                     </div>
//                   </div>
//                 ))}
//               </section>
//             )}

//             {/* — Accordion header */}
//             {canReview && !reviewDone && (
//               <div className="review-accordion-header" onClick={() => setShowReview(s => !s)}>
//                 {showReview ? "▼ Hide Review Form" : "▶ Leave a Review"}
//               </div>
//             )}
//            {/*  leave-a-review form */}
//            {showReview && !reviewDone && (
//            <div className="review-accordion-panel">
//            <ReviewForm
//            tripId={activeConv.tripId}
//            revieweeId={activeConv.userId}
//            reviewerId={user.id}
//            onSubmitted={() => {
//             setReviewDone(true);
//             setShowReview(false);
//             // re‑load reviews after submit:
//             axios
//             .get(`/api/reviews/user/${activeConv.userId}`, {
//               headers: { Authorization: localStorage.getItem("token") },
//             })
//             .then(res => setReviews(res.data))
//             .catch(() => {});
//           }}
//             />
//            </div>
//             )}
//           </>
//           )}

//           <div className="chat-messages">
//             {activeConversationId ? (
//               messages.length > 0 ? (
//                 messages.map((msg, index) => (
//                   <div
//                     key={index}
//                     className={`message-bubble ${
//                       String(msg.senderId) === String(user?.id) ? "sent" : "received"
//                     }`}
//                   >
//                     <p className="message-text">{msg.text}</p>
//                     <span className="message-time">
//                       {new Date(msg.timestamp).toLocaleTimeString([], {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                       })}
//                     </span>
//                   </div>
//                 ))
//               ) : (
//                 <p className="no-messages">No messages yet. Start the conversation!</p>
//               )
//             ) : (
//               <p className="no-conversation-selected">
//                 💬 Select a conversation from the left sidebar
//               </p>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="chat-input-section">
//             <input
//               type="text"
//               className="chat-input"
//               placeholder="Send Message...."
//               value={newMessage}
//               onChange={(e) => setNewMessage(e.target.value)}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleSendMessage();
//               }}
//               disabled={!activeConversationId}
//             />
//             <button
//               className="send-button"
//               onClick={handleSendMessage}
//               disabled={!activeConversationId}
//             >
//               <img src={sendIcon} className="send-icon" alt="Send" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default MessagingPage;

import React, { useState, useEffect, useRef } from "react"; 
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";     // ← added useNavigate
import io from "socket.io-client";
import Navigation from "./Navigation"; 
import "./MessagingPage.css";
import sendIcon from "../assets/Send.png";
import ReviewForm from "./ReviewForm";

// Connect to Socket.IO on your backend with the JWT token
const socket = io("http://localhost:8080", {
  auth: { token: localStorage.getItem("token") },
});

//  helper function to validate a 24-char ObjectId
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

const MessagingPage = ({ user }) => {
  const navigate = useNavigate();                          // ← added navigate()

  // 1) hooks are now always called, in the same order:
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0); // State for persistent unread count
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [tripDetail, setTripDetail] = useState(null);

  const userId = user?.id;                             // ← safe‐guarded id
  const { conversationId: initialConversationId } = useParams();
  const messagesEndRef = useRef(null);

  // . Identify the active conversation for display (e.g., header)
  //    — moved above all effects so no-use-before-define
  const activeConv = conversations.find(
    (conv) => String(conv._id) === String(activeConversationId)
  );

  // Log user object 
  useEffect(() => {
    if (!user) return;
    console.log("Logged-in user:", user);
  }, [user]);

  // 1. Fetch or create conversation list
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/conversations", {
        headers: { Authorization: token },
      })
      .then((res) => {
        const existingConversations = res.data;
        setConversations(existingConversations);
        // If a conversationId is provided in the URL, set that as active
        if (initialConversationId) {
          const found = existingConversations.find(
            (c) => String(c._id) === String(initialConversationId)
          );
          setActiveConversationId(found ? found._id : initialConversationId);
        }
      })
      .catch((err) => console.error("Error fetching conversations:", err));
  }, [user, initialConversationId]);

  // 2. Fetch messages for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;
    if (!isValidObjectId(activeConversationId)) {
      console.error(`Invalid conversationId: ${activeConversationId}`);
      return;
    }
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8080/api/messages/${activeConversationId}`, {
        headers: { Authorization: token },
      })
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [activeConversationId]);

  // 3. Join the Socket.IO room for the active conversation
  useEffect(() => {
    if (activeConversationId && isValidObjectId(activeConversationId)) {
      socket.emit("joinConversation", activeConversationId);
      console.log("Joined conversation room:", activeConversationId);    
    }
  }, [activeConversationId]);

  useEffect(() => {
  if (!activeConv) return;
  if (activeConv.tripStatus === "completed" && canReview) {
    setShowReview(true);
  }
}, [activeConv, canReview]);

  useEffect(() => {
  if (!activeConv) return;
  const handler = ({ tripId }) => {
    // only react if it’s the same trip
    if (String(activeConv.tripId) === tripId) {
      setCanReview(true);
      setShowReview(true);
    }
  };
  socket.on("tripCompleted", handler);
  return () => {
    socket.off("tripCompleted", handler);
  };
}, [activeConv]);

  // 3a. load reviews once trip is completed
  useEffect(() => {
    if (!activeConv) return;
    setReviews([]);
    if (activeConv.tripStatus === "completed") {
      const token = localStorage.getItem("token");
      axios
        // ← fetch reviews for this specific trip, not for the user
        .get(`http://localhost:8080/api/reviews/trip/${activeConv.tripId}`, {
          headers: { Authorization: token },
        })
        .then((res) => setReviews(res.data))
        .catch((err) => {
          console.error("Error fetching reviews:", err);
          setReviews([]);
        });
    }
  }, [activeConv]);

  // decide if we can leave a review
  useEffect(() => {
  // if nothing to work with yet, or not completed, we cannot review
  if (
    !activeConv ||
    activeConv.tripStatus !== "completed" ||
    !userId ||
    !tripDetail
  ) {
    setCanReview(false);
    setShowReview(false);
    return;
  }

  // 1) don't let the trip's creator review their own trip
  if (String(tripDetail.user._id) === String(userId)) {
    setCanReview(false);
    setShowReview(false);
    return;
  }

  // 2) don't let anyone who already left a review do it again
  const already = reviews.some(
    r => String(r.reviewerId._id) === String(userId)
  );
  setCanReview(!already);
  setShowReview(false);     // reset the accordion state if you're toggling back in/out
}, [activeConv, reviews, userId, tripDetail]);

  // 3b. load the trip details so we know its name/destination
useEffect(() => {
  if (!activeConv?.tripId) return;
  const token = localStorage.getItem("token");
  axios
    .get(`http://localhost:8080/api/trip-plans/${activeConv.tripId}`, {
      headers: { Authorization: token },
    })
    .then(res => setTripDetail(res.data))
    .catch(err => console.error("Error fetching trip detail:", err));
}, [activeConv]);


  // 4. Listen for new messages via Socket.IO
  useEffect(() => {
    if (!userId) return;
    socket.on("newMessage", (m) => {
      setMessages((prev) =>
        prev.some((x) => String(x._id) === String(m._id)) ? prev : [...prev, m]
      );
      if (String(m.senderId) !== String(userId)) {
        setUnreadCount((u) => u + 1);
      }
    });
    return () => socket.off("newMessage");
  }, [userId]);

  // 4a. Periodically fetch unread count
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchCount = () => {
      const ep = activeConversationId
        ? `/api/messages/unreadCount/${activeConversationId}`
        : "/api/messages/unreadCountGlobal";
      axios
        .get(`http://localhost:8080${ep}`, {
          headers: { Authorization: token },
        })
        .then((r) => setUnreadCount(r.data.unreadCount))
        .catch(() => {});
    };
    fetchCount();
    const id = setInterval(fetchCount, 10000);
    return () => clearInterval(id);
  }, [activeConversationId]);

  // 4b. mark-read on open
  useEffect(() => {
    if (activeConversationId && isValidObjectId(activeConversationId)) {
      const token = localStorage.getItem("token");
      axios
        .post(
          "http://localhost:8080/api/messages/mark-read",
          { conversationId: activeConversationId },
          { headers: { Authorization: token } }
        )
        .then(() => setUnreadCount(0))
        .catch(() => {});
    }
  }, [activeConversationId]);

  // 5. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2) only _after_ hooks, bail out if no user
  if (!user) return null;

  // 6. Send
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return;
    const msg = {
      senderId: userId,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit("sendMessage", { conversationId: activeConversationId, message: msg });
    setNewMessage("");
  };

  // 8. New conversation
  const handleNewConversation = () => {
    const otherUsername = prompt("Enter the other user's username:");
    if (!otherUsername) return;
    const token = localStorage.getItem("token");
    axios
    // Look up the other user by username
      .get(`http://localhost:8080/api/users?username=${otherUsername}`, {
        headers: { Authorization: token },
      })
      .then((uRes) => {
        const other = uRes.data;
          if (!other?._id) {
            alert("User not found.");
            throw new Error("No user");
          }
          // Check if the user is connected before messaging
          return axios
            .get(
              `http://localhost:8080/api/notifications/connection-status?otherUserId=${other._id}`,
              { headers: { Authorization: token } }
            )
            .then((statusRes) => {
              if (!statusRes.data.connectionExists) {
                alert("You must connect first before sending messages.");
                throw new Error("Not connected");
              }
              return other;
            });
      })
      // Find or create the conversation
      .then((other) => 
         axios.post(
          "http://localhost:8080/api/conversations/find-or-create",
          { otherUserId: other._id },
          { headers: { Authorization: token } }
        )
      )
      .then((cRes) => {
        const newConv = cRes.data;
        setConversations((prev) =>
          prev.some((c) => String(c._id) === String(newConv._id))
            ? prev
            : [...prev, newConv]
        );
        setActiveConversationId(newConv._id);
      })
      .catch((e) => {
        if (e.message === "No user" || e.message === "Not connected") {
          return;
        }
        console.error("Error creating conversation:", e);
        alert("Could not start a conversation. Try again.");
      });
  };

  // — dedupe sidebar by userId
  const uniqueConversations = conversations.filter(
    (c, i, a) => a.findIndex(x => String(x.userId) === String(c.userId)) === i
  );

  return (
    <>
      {/* Pass unreadCount to Navigation for persistent badge display */}
      <Navigation user={user} newMessageCount={unreadCount} />

      <div className="messaging-container">
        {/* Left Sidebar: Conversation List */}
        <div className="left-sidebar">
          <h2 className="sidebar-title">Your Messages</h2>
          <button className="new-conversation-btn" onClick={handleNewConversation}>
            + New Conversation
          </button>
          {uniqueConversations.length === 0 ? (
            <p>No conversations yet</p>
          ) : (
            uniqueConversations.map((conv) => {
              const isActive = String(activeConversationId) === String(conv._id);
              return (
                <div
                  key={conv._id}
                  className={`conversation-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveConversationId(conv._id)}
                >
                  <span className="conversation-name">
                    {conv.name || "Unnamed"}
                    {conv.unreadCount > 0 && (
                      <span className="new-message-indicator">New</span>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            {activeConv ? (
              <div className="chat-header-row">
                <span className="chat-header-name">{activeConv.name}</span>
                {activeConv.tripStatus === "completed" && canReview && (  
                  <a
                    href="#!"
                    className="leave-review-inline"
                    onClick={() => setShowReview(true)}
                  >
                    Leave a review
                  </a>
                )}
              </div>
            ) : (
              <h3>Select a Conversation</h3>
            )}
          </div>
        
          {/* Modal popup for review form */}
          {showReview && (
            <div className="review-modal-backdrop" onClick={() => setShowReview(false)}>
              <div className="review-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal" onClick={() => setShowReview(false)}>
                  ×
                </button>
                {/* Trip name header */}
                {tripDetail && (
                  <h3 className="review-form-trip">
                    Reviewing your trip to <em>
                       {typeof tripDetail.destination === "string"
                        ? tripDetail.destination
                        : JSON.stringify(tripDetail.destination)}
                    </em>
                  </h3>
                )}
                <ReviewForm
                  tripId={activeConv.tripId}
                  revieweeId={activeConv.userId}
                  reviewerId={userId}
                   tripName={
                    typeof tripDetail?.tripName === "string"
                    ? tripDetail.tripName
                    : JSON.stringify(tripDetail?.tripName) || (typeof tripDetail?.destination === "string" ? tripDetail.destination : "")
                  }
                  onSubmitted={() => {
                    setShowReview(false);
                    // reload just this trip's reviews
                    axios
                      .get(`http://localhost:8080/api/reviews/trip/${activeConv.tripId}`, {
                        headers: { Authorization: localStorage.getItem("token") },
                      })
                      .then((res) => setReviews(res.data))
                      .catch(() => {});
                  }}
                />
                {/* ← added “View Profile” button next to submit */}
                <div className="review-modal-footer">
                  <a
                    href="#!"
                    className="view-profile-link"
                    onClick={() => navigate(`/profile/${activeConv.userId}`)}
                  >
                    View Profile
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="chat-messages">
            {activeConversationId ? (
              messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`message-bubble ${
                      String(msg.senderId) === String(userId) ? "sent" : "received"
                    }`}
                  >
                    <p className="message-text">{msg.text}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="no-messages">No messages yet. Start the conversation!</p>
              )
            ) : (
              <p className="no-conversation-selected">
                💬 Select a conversation from the left sidebar
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-section">
            <input
              type="text"
              className="chat-input"
              placeholder="Send Message...."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={!activeConversationId}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!activeConversationId}
            >
              <img src={sendIcon} className="send-icon" alt="Send" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagingPage;
