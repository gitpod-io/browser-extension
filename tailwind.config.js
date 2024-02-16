/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.tsx"],
    plugins: [require("@tailwindcss/forms")],
    important: true,
    theme: {
        extend: {
            colors: {
                "gitpod-black": "#161616",
                "gitpod-red": "#CE4A3E",
            },
        },
    },
};
