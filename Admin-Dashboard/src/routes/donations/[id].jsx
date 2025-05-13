import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DonationItemDetails = () => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (id) {
            axios.get(`http://localhost:3000/api/donationItems/${id}`)
                .then(res => setItem(res.data))
                .catch(err => console.log("Error fetching item:", err));
        }
    }, [id]);

    const toggleApproval = () => {
        if (item) {
            const updatedItem = { ...item, isApproved: !item.isApproved };
            axios.put(`http://localhost:3000/api/donationItems/${id}`, updatedItem)
                .then(res => setItem(res.data))
                .catch(err => console.log("Error updating approval status:", err));
        }
    };

    const nextImage = () => {
        if (item?.image?.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % item.image.length);
        }
    };

    const prevImage = () => {
        if (item?.image?.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + item.image.length) % item.image.length);
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
                
                {item.image?.length > 0 ? (
                    <div className="relative mb-6">
                        <div className="overflow-hidden rounded-xl">
                            <img 
                                src={item.image[currentImageIndex]} 
                                alt={item.title} 
                                className="w-full h-64 sm:h-80 object-cover transition-transform duration-300"
                            />
                        </div>
                        {item.image.length > 1 && (
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
                                    {item.image.map((_, index) => (
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
                        <span className="text-gray-500">No image available</span>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-gray-700">
                        <span className="font-medium">Description:</span> {item.description}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Location:</span> {item.location}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Status:</span> {item.status}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Approved:</span> 
                        <span className={`ml-2 inline-block px-2 py-1 rounded-full text-sm ${
                            item.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                            {item.isApproved ? "Yes" : "No"}
                        </span>
                    </p>
                </div>

                <button 
                    onClick={toggleApproval}
                    className={`mt-6 w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white transition-colors duration-200 shadow-md hover:shadow-lg ${
                        item.isApproved 
                            ? "bg-red-600 hover:bg-red-700" 
                            : "bg-green-600 hover:bg-green-700"
                    }`}
                >
                    {item.isApproved ? "Mark as Not Approved" : "Mark as Approved"}
                </button>
            </div>
        </div>
    );
};

export default DonationItemDetails;


