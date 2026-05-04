import { buildApp } from '../src/index.js';
import { createTestInstitution, createTestUser, createTestSession } from '../tests/setup.js';
import supertest from 'supertest';

async function main() {
    const app = await buildApp();
    await app.ready();
    const request = supertest(app.server);

    const institution = await createTestInstitution();
    const user = await createTestUser(institution.id, 'school_admin');
    const session = await createTestSession(user.id);

    console.log("Cookie:", session.cookie);
    console.log("Inst ID:", institution.id);

    const response = await request
        .post('/api/approvals/workflows')
        .set('Cookie', session.cookie)
        .set('x-institution-id', institution.id)
        .send({
            name: 'Test TC Workflow',
            type: 'transfer_certificate',
            description: 'Test workflow',
            steps: [{ order: 1, name: 'Teacher', approverRole: 'teacher', isRequired: true }],
            isActive: true,
        });

    console.log("STATUS:", response.status);
    console.log("BODY:", response.body);
    process.exit(0);
}

main().catch(console.error);
