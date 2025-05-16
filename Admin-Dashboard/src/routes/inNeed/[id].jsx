import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const InNeedItemDetails = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:3000/api/inNeed/${id}`)
                .then(res => setItem(res.data))
                .catch(err => console.error("Error fetching item:", err));
        }
    }, [id]);

const toggleApproval = () => {
  if (item) {
    const updatedItem = { ...item, isApproved: !item.isApproved };
    axios.put(`http://localhost:3000/api/inNeed/${id}`, updatedItem)
      .then(res => {
        setItem(res.data);

        // Send notification if the item is now approved
        if (updatedItem.isApproved) {
          axios.post('http://localhost:3000/api/notification/Addnotification', {
            message: `Your request "${item.title}" has been approved.`,
            UserId: item.UserId,
            isRead: false,
            itemId: item.id,
            itemType: 'InNeed',
          })
          .then(() => {
            console.log('Notification sent successfully');
          })
          .catch(err => {
            console.error('Error sending notification:', err);
          });
        }
      })
      .catch(err => console.error("Error updating approval status:", err));
  }
};

    const toggleFulfilled = () => {
        if (item) {
            const updatedItem = { ...item, isDone: !item.isDone };
            axios.put(`http://localhost:3000/api/inNeed/${id}`, updatedItem)
                .then(res => setItem(res.data))
                .catch(err => console.error("Error updating fulfillment status:", err));
        }
    };

    const nextImage = () => {
        if (item?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
        }
    };

    const prevImage = () => {
        if (item?.images?.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
        }
    };

    if (!item) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-lg font-medium text-gray-600 animate-pulse">Loading item details...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
            <div className="mx-auto max-w-3xl w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6">{item.title}</h1>
                
                {item.images?.length > 0 ? (
                    <div className="relative mb-6">
                        <div className="overflow-hidden rounded-xl">
                            <img 
                                src={item.images[currentImageIndex]} 
                                alt={item.title} 
                                className="w-full h-64 sm:h-80 object-cover transition-transform duration-300"
                            />
                        </div>
                        {item.images.length > 1 && (
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
                                    {item.images.map((_, index) => (
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
                        <span className="font-medium">Description:</span> {item.description}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Location:</span> {item.location}
                    </p>
                    {item.latitude && item.longitude && (
                        <p className="text-gray-600">
                            <span className="font-medium">Coordinates:</span> {item.latitude}, {item.longitude}
                        </p>
                    )}
                    <p className="text-gray-600">
                        <span className="font-medium">Approved:</span> 
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                            item.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {item.isApproved ? "Yes" : "No"}
                        </span>
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Fulfilled:</span> 
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                            item.isDone ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                            {item.isDone ? "Yes" : "No"}
                        </span>
                    </p>
                    {item.isDone && item.doneReason && (
                        <p className="text-gray-600">
                            <span className="font-medium">Fulfilled Reason:</span> {item.doneReason}
                        </p>
                    )}
                </div>

               <button 
    onClick={toggleApproval}
    className={`mt-6 w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200 shadow-md hover:shadow-lg ${item.isApproved ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
>
    {item.isApproved ? "Mark as Not Approved" : "Mark as Approved"}
</button>

{/* Add some space between the two buttons */}
<div className="my-4"></div>

<button 
    onClick={toggleFulfilled}
    className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200 shadow-md hover:shadow-lg ${item.isDone ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
>
    {item.isDone ? "Mark as Not Fulfilled" : "Mark as Fulfilled"}
</button>

            </div>
        </div>
    );
};

export default InNeedItemDetails;
