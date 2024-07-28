 
        const express = require('express');
        const path = require('path');
        const fs = require('fs');
        const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
        const BaileysProvider = require('@bot-whatsapp/provider/baileys');
        const MockAdapter = require('@bot-whatsapp/database/mock');
        
        const app = express();
        
        const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario']);
        
        const flowDocs = addKeyword(['doc', 'documentacion', 'documentación']).addAnswer(
            [
                '📄 Aquí encontras las documentación recuerda que puedes mejorarla',
                'https://bot-whatsapp.netlify.app/',
                '\n*2* Para siguiente paso.',
            ],
            null,
            null,
            [flowSecundario]
        );
        
        const flowTuto = addKeyword(['telenchana_ii', 'telenchana_uu']).addAnswer(
            [
                '🙌 Aquí encontras un ejemplo rapido',
                'https://bot-whatsapp.netlify.app/docs/example/',
                '\n*2* Para siguiente paso.',
            ],
            null,
            null,
            [flowSecundario]
        );
        
        const flowGracias = addKeyword(['gg_kk_oo', 'oo_kk_ll']).addAnswer(
            [
                '🚀 Puedes aportar tu granito de arena a este proyecto',
                '[*opencollective*] https://opencollective.com/bot-whatsapp',
                '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
                '[*patreon*] https://www.patreon.com/leifermendez',
                '\n*2* Para siguiente paso.',
            ],
            null,
            null,
            [flowSecundario]
        );
        
        const flowDiscord = addKeyword(['discord']).addAnswer(
            ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
            null,
            null,
            [flowSecundario]
        );
        
        const flowPrincipal = addKeyword(['ff_ee', 'yy_rr', 'hh_ll'])
            .addAnswer('🙌 Hola bienvenido a este *Chatbot*')
            .addAnswer(
                [
                    'Hola estamos creando un chat bot con node.js',
                    '👉  Soy Alex Telenchana',
                    '👉  Estudiante de la Universidad Central del Ecuador',
                    '👉 Me gusta mucho Medicina ',
                ],
                null,
                null,
                [flowDocs, flowGracias, flowTuto, flowDiscord]
            );
        
        const main = async () => {
            const adapterDB = new MockAdapter();
            const adapterFlow = createFlow([flowPrincipal]);
            const adapterProvider = createProvider(BaileysProvider);
        
            const bot = createBot({
                flow: adapterFlow,
                provider: adapterProvider,
                database: adapterDB,
            });
        
           
            // Configurar el servidor Express
            app.use(express.json());
        
            // Ruta para servir el QR code
            app.get('/qr', (req, res) => {
                const qrPath = path.join(__dirname, 'bot.qr.png');
                if (fs.existsSync(qrPath)) {
                    res.sendFile(qrPath);
                } else {
                    res.status(404).json({ error: 'QR code no encontrado' });
                }
            });
        
            // Ruta para manejar solicitudes POST para enviar mensajes
            app.post('/send-message', async (req, res) => { 

        if (req.method === 'POST' && req.url === '/send-message') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const { number, message } = JSON.parse(body);
                    const formattedNumber = `${number}@s.whatsapp.net`;
            
                 // Extraer todas las URLs de imágenes del mensaje
const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|pdf|xml|mp4))/ig;
const urlMatches = message.match(urlRegex);
const textWithoutUrls = message.replace(urlRegex, '').trim();

// Enviar texto primero si hay texto aparte de las URLs
if (textWithoutUrls) {
    await adapterProvider.sendText(formattedNumber, textWithoutUrls);
}

// Luego, si hay URLs de imagen, enviar cada imagen
if (urlMatches && urlMatches.length > 0) {
    for (const imageUrl of urlMatches) {
        await adapterProvider.sendMedia(formattedNumber, imageUrl); // Asegúrate de que este método es correcto según tu proveedor
    }
}

            
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Mensaje y/o imagen enviados' }));
                } catch (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            });
            
        }  

            });
        
            // Iniciar el servidor Express
            app.listen(3001, () => {
                console.log('Servidor HTTP corriendo en el puerto 3001');
            });
        };
        
        main();
         

/**
 * Method Parameters

sendMessage(numberIn, message, options): Sends a message to a given phone number. The message can include additional options like buttons or media.
sendMedia(number, mediaUrl, text): Sends media to a given phone number. The media is specified by a URL, and additional text can be sent along with the media.
sendImage(number, filePath, text): Sends an image to a given phone number. The image is specified by a file path, and additional text can be sent along with the image.
sendVideo(number, filePath, text): Sends a video to a given phone number. The video is specified by a file path, and additional text can be sent along with the video.
sendAudio(number, audioUrl): Sends audio to a given phone number. The audio is specified by a URL.
sendText(number, message): Sends a text message to a given phone number.
sendFile(number, filePath): Sends a file to a given phone number. The file is specified by a file path.
sendButtons(number, text, buttons): Sends buttons to a given phone number. The buttons are displayed along with a given text.
sendPoll(number, text, poll): Sends a poll to a given phone number. The poll options are displayed along with a given text.
sendLocation(remoteJid, latitude, longitude, messages): Sends a location to a given chat ID. The location is specified by latitude and longitude, and additional messages can be sent along with the location.
sendContact(remoteJid, contactNumber, displayName, messages): Sends a contact to a given chat ID. The contact is specified by a phone number and a display name, and additional messages can be sent along with the contact.
sendPresenceUpdate(remoteJid, WAPresence): Sends a presence update (e.g., "recording") to a given chat ID.
sendSticker(remoteJid, url, stickerOptions, messages): Sends a sticker to a given chat ID. The sticker is specified by a URL, and additional messages can be sent along with the sticker.

 */