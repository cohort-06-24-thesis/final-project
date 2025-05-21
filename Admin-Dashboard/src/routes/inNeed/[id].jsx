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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-lg font-medium text-gray-600 animate-pulse">Loading item details...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 space-y-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{item.title}</h1>
                
                {item.images?.length > 0 ? (
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                        <div className="aspect-w-16 aspect-h-9">
                            <img 
                                src={item.images[currentImageIndex]} 
                                alt={item.title} 
                                className="w-full h-[400px] object-cover transition-all duration-500 hover:scale-105"
                            />
                        </div>
                        {item.images.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    <ChevronRight className="w-6 h-6 text-gray-700" />
                                </button>
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                                    {item.images.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                                index === currentImageIndex 
                                                    ? "bg-white scale-125" 
                                                    : "bg-white/50 hover:bg-white/75"
                                            }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                        <span className="text-gray-500 text-lg">No images available</span>
                    </div>
                )}

                <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
                    <div className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                            <span className="font-semibold text-gray-900">Description:</span> {item.description}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold text-gray-900">Location:</span> {item.location}
                        </p>
                        {item.latitude && item.longitude && (
                            <p className="text-gray-700">
                                <span className="font-semibold text-gray-900">Coordinates:</span> {item.latitude}, {item.longitude}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-900">Status:</span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                item.isApproved 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-red-100 text-red-700"
                            }`}>
                                {item.isApproved ? "Approved" : "Not Approved"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-900">Fulfillment:</span>
                            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                item.isDone 
                                    ? "bg-blue-100 text-blue-700" 
                                    : "bg-yellow-100 text-yellow-700"
                            }`}>
                                {item.isDone ? "Fulfilled" : "Not Fulfilled"}
                            </span>
                        </div>
                    </div>

                    {item.isDone && item.doneReason && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                            <p className="text-gray-700">
                                <span className="font-semibold text-gray-900">Fulfilled Reason:</span> {item.doneReason}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button 
                        onClick={toggleApproval}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            item.isApproved 
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
                                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        }`}
                    >
                        {item.isApproved ? "Mark as Not Approved" : "Mark as Approved"}
                    </button>

                    <button 
                        onClick={toggleFulfilled}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            item.isDone 
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
                                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        }`}
                    >
                        {item.isDone ? "Mark as Not Fulfilled" : "Mark as Fulfilled"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InNeedItemDetails;
