const enviarMensajeTelegram = async (mensaje) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  // Log para que veas en la consola si los datos están llegando bien
  console.log(`Intentando enviar mensaje a Telegram (Chat ID: ${chatId})...`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        chat_id: chatId, 
        text: mensaje,
        parse_mode: 'HTML' // Permite usar negritas o estilos si quieres
      })
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Error de la API de Telegram:", data.description);
    } else {
      console.log("Mensaje enviado con éxito a Telegram");
    }

    return data;
  } catch (error) {
    console.error("Error de red al conectar con Telegram:", error);
  }
};

module.exports = { enviarMensajeTelegram };