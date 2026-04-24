const request = require('supertest');
const app = require('../../src/app');

describe('Integration Tests', () => {
    test('GET /health returns healthy status', async () => {
        const res = await request(app).get('/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('healthy');
    });

    test('Full request cycle works end to end', async () => {
        const root = await request(app).get('/');
        const health = await request(app).get('/health');
        expect(root.statusCode).toBe(200);
        expect(health.statusCode).toBe(200);
    });
});