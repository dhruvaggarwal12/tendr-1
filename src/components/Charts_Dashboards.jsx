// Need to create fetch function here



import { Doughnut, Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js/auto";

ChartJS.register(ArcElement, Tooltip, Legend);



// Used on Admin Dashboard

export const LineChart_UserVendorGrowth_AdminDashboard = () => {
    const data = {
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "New Users",
                data: [82, 96, 103, 117, 131, 159],
                fill: false,
                borderColor: "#FF6B6B", // Bright Coral Red
                backgroundColor: "#FF6B6B",
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: "New Vendors",
                data: [28, 41, 44, 59, 63, 78],
                fill: false,
                borderColor: "#00C9A7", // Bright Aqua Green
                backgroundColor: "#00C9A7",
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                },
            },
        },
    };

    return (
        <div className="w-full min-h-full cursor-pointer">
            <Line data={data} options={options} />
        </div>
    );
};



// Used on Admin Dashboard

export const LineChart_BookingsPerMonth_AdminDashboard = () => {
    const data = {
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "Bookings",
                data: [62, 67, 61, 68, 74, 89], // Adjusted monthly growth
                fill: false,
                borderColor: "#E91E63",
                backgroundColor: "#E91E63",
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: "top",
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 10,
                },
            },
        },
    };

    return (
        <div className="w-full min-h-full cursor-pointer">
            <Line data={data} options={options} />
        </div>
    );
};



// Used on Admin Booking

export const Doughnut_BookingCategory_AdminDashboard = () => {
    const data = {
        labels: ["Decorator", "Entertainment", "Catering", "Photographer"],
        datasets: [
            {
                data: [30, 40, 20, 10],
                backgroundColor: [
                    "#FF6384", // Bright Pink/Red
                    "#36A2EB", // Bright Blue
                    "#4BC0C0", // Aqua
                    "#FFCD56", // Bright Yellow
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
        <div className="w-full min-h-full cursor-pointer flex justify-center items-center">
            <Doughnut data={data} />
        </div>
    );
};



// Used on Admin Booking

export const Doughnut_BookingCity_AdminDashboard = () => {
    const data = {
        labels: ["Delhi", "Noida", "Greater Noida", "Ghaziabad"],
        datasets: [
            {
                data: [32, 40, 21, 15],
                backgroundColor: [
                    "#FF9F40", // Bright Orange
                    "#9966FF", // Bright Purple
                    "#00C49F", // Bright Teal
                    "#FF6B6B", // Coral Red
                    "#FFD700", // Bright Gold
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
      <div className="w-full min-h-full cursor-pointer flex justify-center items-center">
        <Doughnut data={data} />
      </div>
    );
};



// Used on Admin Vendor

export const Doughnut_VendorCity_AdminDashboard = () => {
    const data = {
        labels: ["Delhi", "Noida", "Greater Noida", "Ghaziabad"],
        datasets: [
            {
                data: [22, 26, 13, 11],
                backgroundColor: [
                    "#FFDE59", // Punchy Yellow
                    "#00F0FF", // Electric Cyan
                    "#A3FF00", // Lime Zest
                    "#FF6EC7", // Cotton Candy Pink
                    "#B200FF", // Electric Purple
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
        <div className="w-[300px] h-[300px] cursor-pointer">
            <Doughnut data={data} />
        </div>
    );
};



// Used on Admin User

export const Doughnut_UserCity_AdminDashboard = () => {
    const data = {
        labels: ["Delhi", "Noida", "Greater Noida", "Ghaziabad"],
        datasets: [
            {
                data: [223, 337, 148, 127],
                backgroundColor: [
                    "#FF6B6B", // Coral Red - Delhi
                    "#6C5CE7", // Indigo - Noida
                    "#00B894", // Mint Green - Greater Noida
                    "#0984E3", // Sky Blue - Ghaziabad
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
        <div className="w-[300px] h-[300px] cursor-pointer">
            <Doughnut data={data} />
        </div>
    );
};



// Used on Admin User

export const LineChart_UserNew_AdminDashboard = () => {
    const data = {
        labels: ["Feb", "Mar", "Apr", "May", "Jun", "Jul"],
        datasets: [
            {
                label: "New Users",
                data: [82, 96, 103, 117, 131, 159],
                fill: false,
                borderColor: "#00C49F",
                backgroundColor: "#00C49F",
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: "index",
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 20,
                },
            },
        },
    };

    return (
      <div className="w-full min-h-full cursor-pointer flex justify-center items-center">
        <Line data={data} options={options} />
      </div>
    );
};



// Used on User Preferences

export const Doughnut_BookingCategory_UserDashboard = () => {
    const data = {
        labels: ["Decorator", "Entertainment", "Catering", "Photographer"],
        datasets: [
            {
                data: [6, 7, 8, 9],
                backgroundColor: [
                    "#FF6384", // Bright Pink/Red
                    "#36A2EB", // Bright Blue
                    "#4BC0C0", // Aqua
                    "#FFCD56", // Bright Yellow
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
        <div className="w-[300px] h-[300px] cursor-pointer">
            <Doughnut data={data} />
        </div>
    );
};



// Used on Vendor Customer Info

export const Doughnut_EventsBooked_VendorDashboard = () => {
    const data = {
        labels: [
            "Get-together",
            "Birthday",
            "Office Party",
            "Concert",
            "Anniversary",
            "Pre Wedding",
            "Rituals",
            "Festival",
            "Others",
        ],
        datasets: [
            {
                data: [6, 7, 8, 9, 5, 3, 4, 1, 6],
                backgroundColor: [
                    "#FF6384", // Bright Pink
                    "#36A2EB", // Sky Blue
                    "#4BC0C0", // Aqua
                    "#FFCD56", // Yellow
                    "#9966FF", // Purple
                    "#FF9F40", // Orange
                    "#00C49F", // Teal Green
                    "#C71585", // Medium Violet Red
                    "#8DD1E1", // Light Blue
                ],
                borderWidth: 1,
                borderRadius: 6,
                spacing: 3
            },
        ],
    };

    return (
        <div className="w-[300px] h-[300px] cursor-pointer">
            <Doughnut data={data} />
        </div>
    );
};
