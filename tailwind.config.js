/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // add this line
    "./node_modules/flowbite/**/*.js" // add this line

  ],
  theme: {
    extend: {
      zIndex: {
        '60': '60'
      }
    },
  },
  plugins: [
    require('flowbite/plugin') // add this line
  ],
}

