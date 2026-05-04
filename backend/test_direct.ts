import { getTenantPrisma } from './src/lib/prisma-tenant.js';
import { createTemplateService } from './src/modules/templates/template.service.js';

async function test() {
    try {
        const tx = getTenantPrisma('cm7s5d4k00010v8x2b1wz6c4r');
        const service = createTemplateService(tx);
        await service.create('cm7s5d4k00010v8x2b1wz6c4r', { 
            name: 'Test', 
            serviceType: 'id_card',
            templateType: 'html',
            content: { html: "<div></div>", css: "" },
            targetAudience: 'ALL'
        });
        console.log('SUCCESS');
    } catch(e) {
        console.error(e);
    }
}

test();
