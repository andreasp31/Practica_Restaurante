const { Inngest } = require("inngest");

// Crear el cliente con el ID de tu app
const inngest = new Inngest({ id: "mi-app-sudoku" });

module.exports = { inngest };