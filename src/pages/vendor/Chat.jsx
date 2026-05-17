import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// -------------------- Backend helpers --------------------
const API_BASE = import.meta.env.VITE_BASE_URL;

const fetchChatMessages = async (chatId) => {
  try {
    const response = await fetch(`${API_BASE}/vendor/chats/${chatId}/messages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch messages');
    const result = await response.json();
    return result?.data || result || [];
  } catch (err) {
    console.error('Error fetching chat messages:', err);
    return [];
  }
};

// OPTIONAL: if your backend supports sending text messages via JSON.
// You can keep using your simulated response too.
const sendTextMessage = async (chatId, text) => {
  try {
    const res = await fetch(`${API_BASE}/vendor/chats/${chatId}/messages`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ type: 'text', text }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to send');
    return await res.json(); // expect {data: {id, ...}}
  } catch (e) {
    console.warn('sendTextMessage fallback to local only:', e);
    return null;
  }
};

// Upload a single image, return a URL from server.
// Adjust endpoint/field names to match your backend.
const uploadImageAndGetUrl = async (chatId, file) => {
  const form = new FormData();
  form.append('file', file);
  form.append('type', 'image');

  const res = await fetch(`${API_BASE}/vendor/chats/${chatId}/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });

  if (!res.ok) throw new Error('Upload failed');
  const result = await res.json();
  // Expect something like {data: {url: 'https://...'}} — adjust if needed.
  const url = result?.data?.url || result?.url;
  if (!url) throw new Error('No URL returned from upload');
  return url;
};

const VendorChat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  const {
    chatId,
    customerName,
    customerImage,
    eventType,
    eventDate,
    guestCount,
  } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Image sending states
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // {id, url, file}
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesData = await fetchChatMessages(chatId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };
    if (chatId) loadMessages();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --------------- Handle text send ---------------
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const message = {
      id: tempId,
      text: newMessage.trim(),
      sender: 'vendor',
      timestamp: new Date().toISOString(),
      type: 'text',
      _optimistic: true,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setIsTyping(true);

    // Try backend send (optional; keep your simulation if desired)
    try {
      const sent = await sendTextMessage(chatId, message.text);
      if (sent?.data?.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: sent.data.id, _optimistic: false } : m))
        );
      }
    } catch {
      /* ignore; we already added optimistically */
    }

    // Simulated customer response
    setTimeout(() => {
      const customerResponse = {
        id: `cust-${Date.now() + 1}`,
        text:
          "Thank you for the information! I'll discuss this with my family and get back to you soon.",
        sender: 'customer',
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      setMessages((prev) => [...prev, customerResponse]);
      setIsTyping(false);
    }, 2000);
  };

  // --------------- Image selection / preview ---------------
  const openFilePicker = () => fileInputRef.current?.click();

  const onFilesSelected = (filesList) => {
    const files = Array.from(filesList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      return { id: `prev-${file.name}-${file.size}-${Date.now()}`, url, file };
    });

    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleFileInputChange = (e) => {
    onFilesSelected(e.target.files);
    // Reset input so selecting the same file again still triggers change
    e.target.value = '';
  };

  const removePreview = (id) => {
    setImagePreviews((prev) => prev.filter((p) => p.id !== id));
    setImageFiles((prev) => prev.filter((f) => `prev-${f.name}-${f.size}-${/* not exact match */ ''}`));
    // Simpler: rebuild files from previews list after removal
    setImageFiles((_) => {
      const keep = imagePreviews.filter((p) => p.id !== id).map((p) => p.file);
      return keep;
    });
  };

  // Paste image from clipboard
  const handlePaste = useCallback((e) => {
    if (!e.clipboardData) return;
    const items = e.clipboardData.items;
    const imageBlobs = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.type.indexOf('image') !== -1) {
        const blob = it.getAsFile();
        if (blob) imageBlobs.push(blob);
      }
    }
    if (imageBlobs.length) {
      onFilesSelected(imageBlobs);
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  // --------------- Send images ---------------
  const handleSendImages = async () => {
    if (!imagePreviews.length || !chatId) return;

    setIsUploadingImages(true);

    // Add optimistic image messages with object URLs
    const optimistic = imagePreviews.map((p) => ({
      id: p.id,
      type: 'image',
      imageUrl: p.url, // local preview url
      sender: 'vendor',
      timestamp: new Date().toISOString(),
      _optimistic: true,
    }));

    setMessages((prev) => [...prev, ...optimistic]);
    setImagePreviews([]);
    setImageFiles([]);

    // Try uploading each and replacing the URL
    for (const msg of optimistic) {
      try {
        // Find the corresponding preview (we stored file on it)
        // We no longer have previews here, so stash the File on the optimistic msg by rebuilding:
        // alternative: push files/ids together before clearing
      } catch (e) {
        // noop
      }
    }

    // Better approach: keep a local copy of files before clearing
    // so we can map 1:1 with optimistic messages
    // (id === preview.id)
    // Implement below:

    // Recreate previews from optimistic ids — but we already cleared imagePreviews.
    // Instead: we saved them before clearing:
  };

  // Keep a shadow list while sending to map id -> file
  const pendingToSendRef = useRef([]);
  useEffect(() => {
    // Whenever we are about to send, we capture current previews
    if (isUploadingImages === false && imagePreviews.length) {
      pendingToSendRef.current = imagePreviews.map((p) => ({ id: p.id, file: p.file }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePreviews]);

  const actuallySendImages = async () => {
    const batch = pendingToSendRef.current;
    if (!batch || !batch.length) return;

    // optimistic add
    const optimistic = batch.map(({ id, file }) => ({
      id,
      type: 'image',
      imageUrl: URL.createObjectURL(file),
      sender: 'vendor',
      timestamp: new Date().toISOString(),
      _optimistic: true,
    }));
    setMessages((prev) => [...prev, ...optimistic]);

    // clear preview UI
    setImagePreviews([]);
    setImageFiles([]);
    setIsUploadingImages(true);

    // upload each and replace message URL
    for (const { id, file } of batch) {
      try {
        const realUrl = await uploadImageAndGetUrl(chatId, file);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, imageUrl: realUrl, _optimistic: false } : m))
        );
      } catch (err) {
        console.error('Image upload failed:', err);
        // Mark failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, _uploadError: true } : m
          )
        );
      }
    }

    setIsUploadingImages(false);
  };

  // Wire the button
  const onClickSendImages = () => {
    // Save current previews to the ref, then send
    pendingToSendRef.current = imagePreviews.map((p) => ({ id: p.id, file: p.file }));
    actuallySendImages();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-600">Loading chat...</div>
      </div>
    );
  }

  if (!chatId || !customerName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-600 mb-4">Chat not found</div>
          <button
            onClick={() => navigate('/vendor/chats')}
            className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/vendor/chats')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowBackIcon className="text-gray-600" />
            </button>

            <div className="flex items-center space-x-3">
              <img
                src={customerImage}
                alt={customerName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h2 className="font-semibold text-gray-800">{customerName}</h2>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span className="bg-green-500 w-2 h-2 rounded-full" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <PhoneIcon className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <EmailIcon className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertIcon className="text-gray-600" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Mark as resolved
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Archive chat
                  </div>
                  <div className="px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer">
                    Block customer
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <EventIcon className="text-orange-500" fontSize="small" />
              <span>{eventType}</span>
            </div>
            <div className="flex items-center space-x-1">
              <PeopleIcon className="text-orange-500" fontSize="small" />
              <span>{guestCount} guests</span>
            </div>
            <span>{eventDate}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isVendor = message.sender === 'vendor';
          const showDate =
            index === 0 ||
            formatDate(messages[index - 1]?.timestamp) !== formatDate(message.timestamp);

          const bubbleBase =
            'max-w-xs lg:max-w-md rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm';
          const vendorBubble = 'bg-orange-500 text-white';
          const customerBubble = 'bg-white text-gray-800 border border-gray-200';

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {formatDate(message.timestamp)}
                  </span>
                </div>
              )}

              <div className={`flex ${isVendor ? 'justify-end' : 'justify-start'}`}>
                <div className={`${bubbleBase} ${isVendor ? vendorBubble : customerBubble}`}>
                  {/* Text message */}
                  {message.type === 'text' && (
                    <>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className={`text-[10px] sm:text-xs ${isVendor ? 'text-orange-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message._optimistic && (
                          <span className={`text-[10px] sm:text-xs ${isVendor ? 'text-orange-100' : 'text-gray-400'}`}>
                            sending…
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Image message */}
                  {message.type === 'image' && (
                    <div className="flex flex-col">
                      <div className="overflow-hidden rounded-xl">
                        <img
                          src={message.imageUrl}
                          alt="attachment"
                          className="max-h-72 sm:max-h-96 object-cover rounded-xl"
                          onLoad={scrollToBottom}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <p className={`text-[10px] sm:text-xs ${isVendor ? 'text-orange-100' : 'text-gray-500'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message._optimistic && (
                          <span className={`text-[10px] sm:text-xs ${isVendor ? 'text-orange-100' : 'text-gray-400'}`}>
                            uploading…
                          </span>
                        )}
                        {message._uploadError && (
                          <span className="text-[10px] sm:text-xs text-red-200">
                            upload failed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <span className="text-xs text-gray-500 ml-2">Customer is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image preview tray */}
      {imagePreviews.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {imagePreviews.map((p) => (
              <div key={p.id} className="relative flex-none">
                <img
                  src={p.url}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                />
                <button
                  onClick={() => removePreview(p.id)}
                  className="absolute -top-2 -right-2 bg-black/70 text-white text-xs rounded-full w-5 h-5"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClickSendImages}
              disabled={isUploadingImages}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                isUploadingImages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isUploadingImages ? 'Uploading…' : `Send ${imagePreviews.length} photo${imagePreviews.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            capture="environment"
          />
          <button
            type="button"
            onClick={openFilePicker}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach photos"
          >
            <AttachFileIcon />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message…  (Tip: paste an image here)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full transition-colors ${
              newMessage.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default VendorChat;
