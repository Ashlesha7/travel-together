import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Navigation from "./Navigation"; // Your existing Nav component
import "./MessagingPage.css";

// Connect to Socket.IO on your backend with the JWT token in the auth payload
const socket = io("http://localhost:8080", {
  auth: { token: localStorage.getItem("token") },
});

const MessagingPage = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0); // State for persistent unread count

  // Read "conversationId" from the URL (e.g., /messages/:conversationId)
  const { conversationId: initialConversationId } = useParams();
  const messagesEndRef = useRef(null);

  // Log user object for debugging
  useEffect(() => {
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
          const foundConv = existingConversations.find(
            (conv) => String(conv._id) === String(initialConversationId)
          );
          if (foundConv) {
            setActiveConversationId(foundConv._id);
          } else {
            setActiveConversationId(initialConversationId);
          }
        }
      })
      .catch((err) => console.error("Error fetching conversations:", err));
  }, [user, initialConversationId]);

  // 2. Fetch messages for the active conversation
  useEffect(() => {
    if (!activeConversationId) return;
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/messages/${activeConversationId}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setMessages(res.data);
      })
      .catch((err) => console.error("Error fetching messages:", err));
  }, [activeConversationId]);

  // 3. Join the Socket.IO room for the active conversation
  useEffect(() => {
    if (activeConversationId) {
      socket.emit("joinConversation", activeConversationId);
      console.log("Joined conversation room:", activeConversationId);
    }
  }, [activeConversationId]);

  // 4. Listen for new messages via Socket.IO
  useEffect(() => {
    socket.on("newMessage", (incomingMessage) => {
      console.log(
        `New message in conversation ${incomingMessage.conversationId} from sender ${incomingMessage.senderId}`
      );
      // Deduplicate by checking _id before adding
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(incomingMessage._id))) {
          return prev;
        }
        return [...prev, incomingMessage];
      });
      // If the message is from another user, increment unread count
      if (String(incomingMessage.senderId) !== String(user?.id)) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [user]);

  // 4a. Periodically fetch unread count from the server (every 10 seconds)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUnreadCount = () => {
      axios
        .get("http://localhost:8080/api/notifications/unread", {
          headers: { Authorization: token },
        })
        .then((res) => {
          setUnreadCount(res.data.unreadCount);
        })
        .catch((err) => console.error("Error fetching unread count:", err));
    };

    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // 4b. When a conversation is opened, mark its messages as read and reset unread count
  useEffect(() => {
    if (activeConversationId) {
      const token = localStorage.getItem("token");
      axios
        .post(
          "http://localhost:8080/api/notifications/mark-read",
          { conversationId: activeConversationId },
          { headers: { Authorization: token } }
        )
        .then(() => {
          setUnreadCount(0);
        })
        .catch((err) =>
          console.error("Error marking conversation messages as read:", err)
        );
    }
  }, [activeConversationId]);

  // 5. Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 6. Send a message using Socket.IO exclusively
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return;
    const messageContent = newMessage.trim();
    const outgoingMessage = {
      senderId: user?.id,
      text: messageContent,
      timestamp: new Date().toISOString(),
    };
    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      message: outgoingMessage,
    });
    setNewMessage("");
  };

  // 7. Identify the active conversation for display (e.g., header)
  const activeConv = conversations.find(
    (conv) => String(conv._id) === String(activeConversationId)
  );

  // 8. Start a new conversation using a username
  const handleNewConversation = () => {
    const otherUsername = prompt("Enter the other user's username:");
    if (!otherUsername) return;
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/users?username=${otherUsername}`, {
        headers: { Authorization: token },
      })
      .then((userRes) => {
        const otherUser = userRes.data;
        if (!otherUser || !otherUser._id) {
          alert("User not found.");
          return;
        }
        axios
          .post(
            "http://localhost:8080/api/conversations/find-or-create",
            { otherUserId: otherUser._id },
            { headers: { Authorization: token } }
          )
          .then((convRes) => {
            const newConv = convRes.data;
            if (!conversations.find((c) => String(c._id) === String(newConv._id))) {
              setConversations((prev) => [...prev, newConv]);
            }
            setActiveConversationId(newConv._id);
          })
          .catch((err) => {
            console.error("Error creating conversation:", err);
            alert("Error creating conversation");
          });
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        alert("Error fetching user. Please check the username.");
      });
  };

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
          {conversations.length === 0 ? (
            <p>No conversations yet</p>
          ) : (
            conversations.map((conv) => {
              const convId = conv._id;
              const convName = conv.name || conv.fullName || "Unnamed";
              return (
                <div
                  key={convId}
                  className={`conversation-item ${
                    activeConversationId && String(activeConversationId) === String(convId)
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setActiveConversationId(convId)}
                >
                  <span className="conversation-name">{convName}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Chat Area */}
        <div className="chat-area">
          <div className="chat-header">
            {activeConv ? (
              <h3>{activeConv.name || activeConv.fullName}</h3>
            ) : (
              <h3>Select a Conversation</h3>
            )}
          </div>

          <div className="chat-messages">
            {activeConversationId ? (
              messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-bubble ${
                      String(msg.senderId) === String(user?.id) ? "sent" : "received"
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
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              disabled={!activeConversationId}
            />
            <button
              className="send-button"
              onClick={handleSendMessage}
              disabled={!activeConversationId}
            >
              <span role="img" aria-label="send"></span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagingPage;
