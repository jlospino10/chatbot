const express = require('express');
const bodyParser = require('body-parser');
const { WAConnection } = require('@adiwajshing/baileys');

const app = express();
app.use(bodyParser.json());

let mainConnection; // Conexión principal Baileys en el puerto 3000
let connections = {}; // Objeto para almacenar las conexiones Baileys por puerto

// Endpoint GET para abrir una nueva instancia Baileys en un puerto específico
app.get('/open/:port', async (req, res) => {
    const port = parseInt(req.params.port, 10);

    // Verificar si el puerto ya está abierto
    if (connections[port]) {
        return res.status(400).send({ error: `El puerto ${port} ya está abierto.` });
    }

    // Crear una nueva conexión Baileys en el puerto especificado
    const conn = new WAConnection();
    conn.connectOptions.timeoutMs = 30000; // Opciones de conexión
    await conn.connect();

    // Guardar la conexión en el objeto connections
    connections[port] = conn;

    console.log(`Instancia Baileys iniciada en el puerto ${port}`);
    res.send({ success: true, message: `Instancia Baileys iniciada en el puerto ${port}` });
});

// Endpoint POST para enviar un mensaje a través de una instancia Baileys en un puerto específico
app.post('/:port/send-message', async (req, res) => {
    const port = req.params.port;
    const { number, message } = req.body;

    if (!connections[port]) {
        return res.status(400).send({ error: `El puerto ${port} no está abierto.` });
    }

    try {
        // Enviar mensaje a través de la conexión Baileys en el puerto especificado
        await connections[port].sendMessage(number, message);
        res.send({ success: true, message: `Mensaje enviado correctamente desde el puerto ${port}.` });
    } catch (error) {
        console.error(`Error al enviar mensaje desde el puerto ${port}:`, error);
        res.status(500).send({ error: 'Error al enviar el mensaje.' });
    }
});

// Iniciar el servidor principal en el puerto 3000 (o el puerto definido en process.env.PORT)
const PORT = process.env.PORT || 3000;
mainConnection = new WAConnection();
mainConnection.connectOptions.timeoutMs = 30000; // Opciones de conexión para la conexión principal
mainConnection.connect()
    .then(() => {
        console.log(`Servidor principal Baileys corriendo en el puerto ${PORT}`);
    })
    .catch(err => {
        console.error('Error al iniciar servidor principal Baileys:', err);
    });

// Middleware para verificar la conexión principal antes de procesar solicitudes
app.use((req, res, next) => {
    if (mainConnection) {
        req.mainConnection = mainConnection; // Pasar la conexión principal a través del middleware
        next();
    } else {
        res.status(500).send({ error: 'Conexión principal no disponible.' });
    }
});

// Endpoint POST para enviar mensajes a través de la conexión principal Baileys (en el puerto 3000)
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).send({ error: 'Número y mensaje son requeridos.' });
    }

    try {
        // Enviar mensaje a través de la conexión principal Baileys (puerto 3000)
        await req.mainConnection.sendMessage(number, message);
        res.send({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error al enviar mensaje desde el servidor principal Baileys:', error);
        res.status(500).send({ error: 'Error al enviar el mensaje.' });
    }
});

// Puerto predeterminado si no se proporciona ningún puerto en la URL
app.listen(PORT, () => {
    console.log(`Servidor principal corriendo en el puerto ${PORT}`);
});