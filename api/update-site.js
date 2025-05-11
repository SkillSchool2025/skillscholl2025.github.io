const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Путь к директории с сайтами
const SITES_DIR = path.join(__dirname, '..');

// Получение текущей версии сайта
router.get('/version', async (req, res) => {
    try {
        const versionFile = path.join(SITES_DIR, 'version.json');
        const versionData = JSON.parse(await fs.readFile(versionFile, 'utf8'));
        res.json({ version: versionData.version });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении версии' });
    }
});

// Endpoint для обновления сайта
router.get('/update-site', async (req, res) => {
    try {
        const { version } = req.query;
        if (!version) {
            return res.status(400).json({ error: 'Не указана версия' });
        }

        // Путь к новой версии сайта
        const newSitePath = path.join(SITES_DIR, `site${version}`);
        
        // Проверяем существование новой версии
        try {
            await fs.access(newSitePath);
        } catch {
            return res.status(404).json({ error: 'Версия не найдена' });
        }

        // Читаем файлы новой версии
        const content = {
            html: await fs.readFile(path.join(newSitePath, 'index.html'), 'utf8'),
            css: await fs.readFile(path.join(newSitePath, 'css/style.css'), 'utf8'),
            js: await fs.readFile(path.join(newSitePath, 'js/main.js'), 'utf8')
        };

        // Отправляем команду обновления всем подключенным клиентам
        notifySubscribers({
            type: 'force_update',
            version: version,
            content: content
        });

        res.json({
            success: true,
            message: 'Обновление отправлено всем клиентам'
        });
    } catch (error) {
        console.error('Ошибка при обновлении:', error);
        res.status(500).json({ error: 'Ошибка при обновлении сайта' });
    }
});

// Endpoint для SSE (Server-Sent Events)
router.get('/updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Добавляем клиента в список подписчиков
    const clientId = Date.now();
    updateSubscribers.set(clientId, res);

    // Удаляем клиента при отключении
    req.on('close', () => {
        updateSubscribers.delete(clientId);
    });
});

// Хранилище подписчиков на обновления
const updateSubscribers = new Map();

// Функция для уведомления всех подписчиков о новом обновлении
function notifySubscribers(updateData) {
    updateSubscribers.forEach(client => {
        client.write(`data: ${JSON.stringify(updateData)}\n\n`);
    });
}

module.exports = {
    router,
    notifySubscribers
}; 