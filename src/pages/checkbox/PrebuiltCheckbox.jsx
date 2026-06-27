import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const BASE_URL = "https://tendr-backend-dhruv.onrender.com";

// Hardcoded default tasks for different events
const defaultTasks = {
  wedding: [
    { id: "1", title: "Book venue", description: "Confirm and pay deposit", checked: false },
    { id: "2", title: "Hire photographer", description: "Finalize package", checked: false },
    { id: "3", title: "Send invitations", description: "Mail or digital", checked: false },
  ],
  birthday: [
    { id: "4", title: "Choose theme", description: "Pick decorations/colors", checked: false },
    { id: "5", title: "Order cake", description: "Chocolate or vanilla?", checked: false },
    { id: "6", title: "Plan games", description: "Activities for guests", checked: false },
  ],
  corporate: [
    { id: "7", title: "Book conference hall", description: "Check capacity", checked: false },
    { id: "8", title: "Arrange catering", description: "Lunch + coffee breaks", checked: false },
    { id: "9", title: "Send agenda", description: "Distribute via email", checked: false },
  ],
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default function CheckBox() {
  const [events, setEvents] = useState([]);
  const [checklistId, setChecklistId] = useState(null);
  const [preview, setPreview] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch checklists from backend on mount
  useEffect(() => {
    setLoading(true);
    axios.get(`${BASE_URL}/api/checklists`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        // Use first checklist for now
        if (res.data && res.data.length > 0) {
          setEvents(res.data[0].items || []);
          setChecklistId(res.data[0]._id);
        }
      })
      .catch(err => console.error("Fetch checklists error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectEvent = async (e) => {
    const value = e.target.value;
    setSelectedEvent(value);
    if (value && defaultTasks[value]) {
      setEvents(defaultTasks[value]); // load defaults
      // Update backend
      if (checklistId) {
        try {
          await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
            { items: defaultTasks[value] },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        } catch (err) {
          console.error("Set default checklist error:", err);
        }
      }
    } else {
      setEvents([]);
    }
  };

  const addEvent = async () => {
    const newEvent = {
      id: Date.now().toString(),
      title: "",
      description: "",
      checked: false,
    };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    // Update backend
    if (checklistId) {
      try {
        await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
          { items: updatedEvents },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Add event error:", err);
      }
    }
  };

  const updateEvent = async (id, field, value) => {
    const updatedEvents = events.map(e => (e.id === id ? { ...e, [field]: value } : e));
    setEvents(updatedEvents);
    // Update backend
    if (checklistId) {
      try {
        await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
          { items: updatedEvents },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Update event error:", err);
      }
    }
  };

  const toggleCheckbox = async (id) => {
    const updatedEvents = events.map(e => (e.id === id ? { ...e, checked: !e.checked } : e));
    setEvents(updatedEvents);
    // Update backend
    if (checklistId) {
      try {
        await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
          { items: updatedEvents },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Toggle checkbox error:", err);
      }
    }
  };

  const deleteEvent = async (id) => {
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    // Update backend
    if (checklistId) {
      try {
        await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
          { items: updatedEvents },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Delete event error:", err);
      }
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = reorder(events, result.source.index, result.destination.index);
    setEvents(reordered);
    // Update backend
    if (checklistId) {
      try {
        await axios.put(`${BASE_URL}/api/checklists/${checklistId}`,
          { items: reordered },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
      } catch (err) {
        console.error("Reorder error:", err);
      }
    }
  };

  const exportTimeline = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "timeline.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTimeline = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          alert("Invalid file format!");
        }
      } catch {
        alert("Error reading file!");
      }
    };
    reader.readAsText(file);
  };

  const clearTimeline = () => {
    if (window.confirm("Clear all events?")) {
      setEvents([]);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full p-4 sm:p-8 md:p-12">
      <BasicSpeedDial />
      <HamburgerNav title="Event Checklist" />

      {/* Event selector */}
      <div className="mb-6 max-w-4xl mx-auto">
        <label className="block mb-2 font-medium text-gray-700 text-xl sm:text-2xl">
          Choose Event:
        </label>
        <select
          value={selectedEvent}
          onChange={handleSelectEvent}
          className="border rounded px-4 py-2 w-full max-w-xs"
        >
          <option value="">-- Select Event --</option>
          <option value="wedding">Wedding</option>
          <option value="birthday">Birthday</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>

      {/* Header + Actions */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 max-w-6xl mx-auto mb-6 mt-10">
        <div className="text-3xl sm:text-4xl font-bold">Checklist Builder</div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={addEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            + Add Event
          </button>

          <button
            onClick={exportTimeline}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Export
          </button>

          <label className="px-4 py-2 bg-yellow-500 text-white rounded cursor-pointer">
            Import
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={importTimeline}
            />
          </label>

          <button
            onClick={clearTimeline}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Clear
          </button>

          <button
            className={`px-4 py-2 rounded ${
              preview ? "bg-purple-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setPreview(!preview)}
          >
            {preview ? "Exit Preview" : "Preview Mode"}
          </button>
        </div>
      </div>

      {/* PREVIEW MODE */}
      {preview ? (
        <div className="space-y-4 max-w-6xl mx-auto">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={`border p-4 rounded-lg shadow bg-white flex items-start gap-3 ${
                event.checked ? "opacity-60 line-through" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={event.checked}
                onChange={() => toggleCheckbox(event.id)}
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {index + 1}. {event.title || "Untitled"}
                </h2>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // EDIT MODE
        <div className="max-w-6xl mx-auto">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {events.map((event, index) => (
                    <Draggable
                      key={event.id}
                      draggableId={event.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border p-4 rounded-lg bg-gray-50"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style, maxWidth: "100vw", boxSizing: "border-box" }}
                        >
                          <input
                            type="checkbox"
                            checked={event.checked}
                            onChange={() => toggleCheckbox(event.id)}
                          />

                          <div className="flex-1 w-full">
                            <input
                              type="text"
                              placeholder="Event title"
                              value={event.title}
                              onChange={(e) =>
                                updateEvent(event.id, "title", e.target.value)
                              }
                              className="w-full border p-2 rounded mb-2"
                            />

                            <textarea
                              placeholder="Event description"
                              value={event.description}
                              onChange={(e) =>
                                updateEvent(
                                  event.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full border p-2 rounded"
                            />
                          </div>

                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="px-3 py-1 bg-red-400 text-white rounded self-end sm:self-center"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  );
}