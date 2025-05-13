import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

function SummaryCard({ icon, title, value, subtitle, bgColor }) {
    return (
        <div className="rounded-lg bg-white p-6 shadow transition-shadow duration-300 hover:shadow-lg">
            <div className="mb-4 flex items-center">
                <div className={`rounded-full ${bgColor} p-3`}>{icon}</div>
                <h2 className="ml-4 text-lg font-semibold text-gray-700">{title}</h2>
            </div>
            <div>
                <p className="text-3xl font-bold">{value}</p>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );
}

export default function CharityDashboard() {
    const [users, setUsers] = useState([]);
    const [inNeedPeople, setInNeedPeople] = useState([]);
    const [events, setEvents] = useState([]);
    const [donationItems, setDonationItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [campaignDonations, setCampaignDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

    const fetchData = async (url) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error);
            throw error;
        }
    };

    const safeFetch = async (url) => {
        try {
            return await fetchData(url);
        } catch {
            return [];
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [usersData, inNeedData, eventsData, itemsData, categoriesData, campaignDonationsData] = await Promise.all([
                    safeFetch("http://localhost:3000/api/user/all"),
                    safeFetch("http://localhost:3000/api/inNeed/all"),
                    safeFetch("http://localhost:3000/api/event/getAllEvents"),
                    safeFetch("http://localhost:3000/api/donationItems/getAllItems"),
                    safeFetch("http://localhost:3000/api/category/getAll"),
                    safeFetch("http://localhost:3000/api/campaignDonation"),
                ]);

                setUsers(usersData);
                setInNeedPeople(inNeedData);
                setEvents(eventsData.data );
                setDonationItems(itemsData);
                setCategories(categoriesData);
                setCampaignDonations(campaignDonationsData);
            } catch (err) {
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const totalCampaignDonationAmount = useMemo(() => {
        return campaignDonations.reduce((sum, cd) => sum + (cd.totalRaised || 0), 0);
    }, [campaignDonations]);

    const itemsByCategory = useMemo(
        () =>
            categories.map((category) => ({
                name: category.name,
                value: donationItems.filter((item) => item.categoryId === category.id).length,
            })),
        [donationItems, categories],
    );

    const monthlyCampaignDonations = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => new Date(0, i).toLocaleString("default", { month: "short" }));
        const monthlyData = Array(12).fill(0);

        campaignDonations.forEach((d) => {
            const month = new Date(d.createdAt).getMonth();
            monthlyData[month] += d.amount || 0;
        });

        return months.map((name, i) => ({ name, amount: monthlyData[i] }));
    }, [campaignDonations]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 text-2xl font-bold">Loading Dashboard Data...</div>
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center text-red-600">
                    <div className="mb-4 text-2xl font-bold">Error</div>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Charity Dashboard</h1>
                <p className="text-gray-600">Overview of all charity activities and statistics</p>
            </header>

            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    icon={
                        <Users
                            className="text-blue-600"
                            size={24}
                        />
                    }
                    title="Total Users"
                    value={users.length}
                    bgColor="bg-blue-100"
                />
                <SummaryCard
                    icon={
                        <Calendar
                            className="text-purple-600"
                            size={24}
                        />
                    }
                    title="Events"
                    value={events.length}
                    subtitle={`Upcoming: ${events.filter((e) => e.status === "upcoming").length} | Completed: ${events.filter((e) => e.status === "completed").length}`}
                    bgColor="bg-purple-100"
                />
                <SummaryCard
                    icon={
                        <DollarSign
                            className="text-green-600"
                            size={24}
                        />
                    }
                    title="Campaign Donations"
                    value={`TND ${totalCampaignDonationAmount.toLocaleString()}`}
                    subtitle={`Avg: TND ${(totalCampaignDonationAmount / (campaignDonations.length || 1)).toFixed(2)}`}
                    bgColor="bg-green-100"
                />
                <SummaryCard
                    icon={
                        <TrendingUp
                            className="text-yellow-600"
                            size={24}
                        />
                    }
                    title="Donation Items"
                    value={donationItems.length}
                    subtitle="Across all categories"
                    bgColor="bg-yellow-100"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Donation Items by Category Pie Chart */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h3 className="mb-4 text-lg font-semibold text-gray-700">Donation Items by Category</h3>
                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >
                        <PieChart>
                            <Pie
                                data={itemsByCategory}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                            >
                                {itemsByCategory.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

              
            </div>
        </div>
    );
}
