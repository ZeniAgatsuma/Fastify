const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('@fastify/static');
const fastifyCors = require('@fastify/cors');
const path = require('path');
const port = 3000;

let resources = []; // Масив для зберігання ресурсів
let currentId = 1; // Лічильник для ID

// Схема валідації ресурсів
const resourceSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer' }, // ID тепер ціле число
        name: { type: 'string' },
        description: { type: 'string' }
    },
    required: ['name', 'description'], // Вимоги до полів
};

// Маршрут для кореневої сторінки
fastify.get('/', async (request, reply) => {
    reply.send({ message: 'Welcome to the API! Visit /api/resources for resources.' });
});

// Отримати список всіх ресурсів
fastify.get('/api/resources', async (request, reply) => {
    return resources;
});

// Отримати ресурс за ідентифікатором
fastify.get('/api/resources/:id', async (request, reply) => {
    const resource = resources.find(res => res.id === parseInt(request.params.id)); // Конвертуємо ID в число
    if (resource) {
        return resource;
    } else {
        reply.status(404).send({ message: 'Resource not found' });
    }
});

// Створити новий ресурс
fastify.post('/api/resources', { schema: { body: resourceSchema } }, async (request, reply) => {
    const newResource = {
        id: currentId++, // Використовуємо лічильник ID і інкрементуємо його
        name: request.body.name,
        description: request.body.description
    };
    resources.push(newResource);
    reply.status(201).send(newResource);
});

// Оновити ресурс
fastify.put('/api/resources/:id', { schema: { body: resourceSchema } }, async (request, reply) => {
    const index = resources.findIndex(res => res.id === parseInt(request.params.id));
    if (index !== -1) {
        resources[index] = { ...resources[index], ...request.body }; // Оновлюємо ресурс
        return resources[index];
    } else {
        reply.status(404).send({ message: 'Resource not found' });
    }
});

// Видалити ресурс
fastify.delete('/api/resources/:id', async (request, reply) => {
    const index = resources.findIndex(res => res.id === parseInt(request.params.id));
    if (index !== -1) {
        const deletedResourceId = resources[index].id; // Зберігаємо ID видаленого ресурсу
        resources.splice(index, 1);
        reply.status(204).send({ message: `Запис з ID ${deletedResourceId} успішно видалено` }); // Відправляємо повідомлення
    } else {
        reply.status(404).send({ message: 'Resource not found' });
    }
});

// Реєстрація плагіна для статичних файлів
fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // Доступ до статичних файлів
});

// Реєстрація CORS
fastify.register(fastifyCors, {
    origin: '*', // Можна вказати конкретні домени за необхідності
});

// Запуск сервера
const start = async () => {
    try {
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`Server is running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
