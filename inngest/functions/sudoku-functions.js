const { inngest } = require("../client");
const { enviarMensajeTelegram } = require("../../utils/telegram"); // Asegúrate de tener este archivo del profe

const notificarVictoria = inngest.createFunction(
  { id: "notificar-victoria-sudoku" }, // ID único de la función
  { event: "sudoku/completado" },      // Debe coincidir con el nombre en tu server.js
  async ({ event, step }) => {
    
    // Extraemos los datos que enviaste desde el server.js
    const { usuario, tiempo, dificultad } = event.data;

    // PASO 1: Enviar mensaje personalizado a Telegram
    await step.run("enviar-a-telegram", async () => {
      const mensaje = `¡NUEVO RÉCORD EN SUDOKU! 🏆\n\n` +
                      `Jugador: ${usuario}\n` +
                      `Tiempo: ${tiempo}\n` +
                      `Dificultad: ${dificultad.toUpperCase()}\n\n`;
      
      return await enviarMensajeTelegram(mensaje);
    });

    //Un delay
    await step.sleep("esperar-mensaje-animo", "5s");
  }
);

module.exports = { notificarVictoria };