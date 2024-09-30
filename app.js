import fs from 'fs';
import path from 'path';
import axios from 'axios';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import {uploadFile} from './fun.js';


const radios = {
    galeyIsrael: {
        streamUrl: 'https://cdn.cybercdn.live/Galei_Israel/Live/icecast.audio',
        segmentDuration: 60,
        outputDirectory: 'Radio_galey_israel_tmp',
        shId: '884338',
    },
    radioHaifa: {
        streamUrl: 'https://1075.livecdn.biz/radiohaifa',
        segmentDuration: 60,
        outputDirectory: 'Radio_Haifa_tmp',
        shId: '884340'
    },
    radioDarom: {
        streamUrl: 'https://cdn.cybercdn.live/Darom_97FM/Live/icecast.audio',
        segmentDuration: 60,
        outputDirectory: 'Radio_Darom_tmp',
        shId: '884342'
    },
};

Object.values(radios).forEach(radio => {
    if (!fs.existsSync(radio.outputDirectory)) {
        fs.mkdirSync(radio.outputDirectory, { recursive: true });
    }
});

function formatDate(date) {
    return date.toISOString().replace(/:/g, '').replace(/\..+/, '');
}

function streamRadio(radioConfig) {
    const { streamUrl, segmentDuration, outputDirectory, shId } = radioConfig;
    const startTime = new Date();
    let lastFileName = null;

    const ffmpeg = spawn(ffmpegPath, [
        '-i', 'pipe:0',
        '-f', 'segment',
        '-segment_time', `${segmentDuration}`,
        '-segment_format', 'mp3',
        '-loglevel', 'info',
        path.join(outputDirectory, `${formatDate(startTime)}-%03d.mp3`)
    ]);

    const startStreaming = () => {
        axios.get(streamUrl, { responseType: 'stream' })
            .then(response => {
                response.data.pipe(ffmpeg.stdin);
                watchDirectory(outputDirectory, shId, () => lastFileName);
            })
            .catch(err => {
                console.error('Failed to stream:', err);
                setTimeout(startStreaming, 5000); // נסה להתחבר מחדש לאחר 5 שניות
            });
    };

    startStreaming();

    ffmpeg.on('close', code => {
        console.log(`ffmpeg process exited with code ${code}`);
        setTimeout(startStreaming, 5000); // נסה להתחבר מחדש לאחר 5 שניות
    });

    ffmpeg.stderr.on('data', data => console.error(`ffmpeg error: ${data}`));
}

function watchDirectory(directory, shId) {
    let lastFileName = null; // שמור על המצב של שם הקובץ האחרון

    fs.watch(directory, { persistent: true }, (eventType, filename) => {
        if (eventType === 'rename' && filename) {
            const filePath = path.join(directory, filename);
            if (fs.existsSync(filePath)) {
                if (lastFileName) {
                    const lastFilePath = path.join(directory, lastFileName);
                    uploadFile(lastFilePath, shId)
                        .then(() => fs.unlinkSync(lastFilePath)) // מחק את הקובץ לאחר ההעלאה
                        .catch(err => console.error(`Failed to upload ${lastFilePath}:`, err));
                }
                lastFileName = filename;
            }
        }
    });
}

Object.values(radios).forEach(radioConfig => streamRadio(radioConfig));