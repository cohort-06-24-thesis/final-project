import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/api/event/${id}`)
        .then(res => setEvent(res.data.data))
        .catch(err => console.error("Error fetching event:", err));
    }
  }, [id]);

  const toggleApproval = () => {
    if (event) {
      const updated = { ...event, isApproved: !event.isApproved };
      axios.put(`http://localhost:3000/api/event/${id}`, updated)
        .then(res => setEvent(res.data))
        .catch(err => console.error("Error updating approval status:", err));
    }
  };

  const toggleStatus = () => {
    if (event) {
      const updated = {
        ...event,
        status: event.status === "upcoming" ? "completed" : "upcoming",
      };
      axios.put(`http://localhost:3000/api/event/${id}`, updated)
        .then(res => setEvent(res.data))
        .catch(err => console.error("Error updating status:", err));
    }
  };

  const nextImage = () => {
    if (event?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % event.images.length);
    }
  };

  const prevImage = () => {
    if (event?.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-medium text-gray-600 animate-pulse">Loading event details...</div>
      </div>
    );
  }

  const formattedDate = event.date ? new Date(event.date).toLocaleDateString() : "N/A";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="mx-auto max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">
          {event.title || "Untitled Event"}
        </h1>

        {Array.isArray(event.images) && event.images.length > 0 ? (
          <div className="relative mb-6">
            <div className="overflow-hidden rounded-xl">
              <img
                src={event.images[currentImageIndex]}
                alt={event.title}
                className="w-full h-64 sm:h-80 object-cover transition-transform duration-300"
              />
            </div>
            {event.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {event.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-gray-800" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-64 sm:h-80 bg-gray-200 rounded-xl flex items-center justify-center mb-6">
            <span className="text-gray-500">No images available</span>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-gray-700">
            <span className="font-medium">Description:</span>{" "}
            {event.description || "No description provided."}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Location:</span>{" "}
            {event.location || "Unknown"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Date:</span> {formattedDate}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Participants:</span>{" "}
            {typeof event.participators === "number" ? event.participators : 0}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Approved:</span>
            <span
              className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                event.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {event.isApproved ? "Yes" : "No"}
            </span>
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                event.status === "completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {event.status}
            </span>
          </p>
        </div>

        <button
          onClick={toggleApproval}
          className={`mt-6 w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200 shadow-md hover:shadow-lg ${
            event.isApproved
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {event.isApproved ? "Mark as Not Approved" : "Mark as Approved"}
        </button>

        <div className="my-4"></div>

        <button
          onClick={toggleStatus}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200 shadow-md hover:shadow-lg ${
            event.status === "completed"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {event.status === "completed" ? "Mark as Upcoming" : "Mark as Completed"}
        </button>
      </div>
    </div>
  );
};

export default EventDetails;
