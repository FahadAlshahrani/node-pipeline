const request = require('supertest');
const app = require('../../src/app');

describe('Unit Tests', () => {
    test('GET / returns 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
    });

    test('GET / returns correct message', async () => {
        const res = await request(app).get('/');
        expect(res.body.message).toBe('Hello from Jenkins Pipeline!');
    });
});