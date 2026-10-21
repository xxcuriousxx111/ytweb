const express = require('express');
const cors = require('cors');
const ytdl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta básica para verificar si el servidor responde
app.get('/', (req, res) => {
    res.send('Servidor backend activo y listo.');
});

// Ruta principal para descargas
app.get('/download', async (req, res) => {
    const { url, format } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Debes proporcionar una URL válida de YouTube.' });
    }

    const randomId = Math.random().toString(36).substring(2, 9);
    const outputTemplate = path.join(__dirname, `${randomId}.%(ext)s`);

    try {
        if (format === 'mp3') {
            console.log(`[INFO] Procesando MP3 para: ${url}`);
            
            await ytdl(url, {
                extractAudio: true,
                audioFormat: 'mp3',
                output: outputTemplate,
            });

            const filePath = path.join(__dirname, `${randomId}.mp3`);

            if (!fs.existsSync(filePath)) {
                throw new Error('El archivo generado no se encuentra.');
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');

            res.download(filePath, 'audio.mp3', (err) => {
                if (err) console.error('Error al enviar el archivo:', err);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });

        } else {
            console.log(`[INFO] Procesando MP4 para: ${url}`);

            await ytdl(url, {
                format: 'best[ext=mp4]/best',
                output: outputTemplate,
            });

            const filePath = path.join(__dirname, `${randomId}.mp4`);

            if (!fs.existsSync(filePath)) {
                throw new Error('El archivo generado no se encuentra.');
            }

            res.setHeader('Content-Type', 'video/mp4');
            res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');

            res.download(filePath, 'video.mp4', (err) => {
                if (err) console.error('Error al enviar el archivo:', err);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }

    } catch (error) {
        console.error('[ERROR] Fallo en la conversión:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'No se pudo procesar el vídeo. Revisa el enlace o la disponibilidad.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});
