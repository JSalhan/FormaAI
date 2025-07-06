import request from 'supertest';
import app from '../src/app.js';

describe('API Health Check', () => {
    // This test doesn't need to connect to the DB, but Jest will keep the process
    // open because of the Mongoose connection in app.js.
    // In a larger app, you'd mock the DB connection for tests.
    
    it('should respond with a 200 OK status and welcome message for the root endpoint', async () => {
        const response = await request(app).get('/');
        
        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual('FormaAI Backend is running!');
    });
});
