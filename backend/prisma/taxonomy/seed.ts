/**
 * Seeds a representative starting tree for all five taxonomy domains.
 *
 * Deliberately NOT exhaustive — e.g. full Subject-per-Class-per-Medium coverage for
 * every board would be several hundred nodes of pure data entry, which belongs to
 * catalog admins working through the taxonomy API over time, not hardcoded here. This
 * seed exists to prove every branch of the hierarchy is shaped correctly and to give
 * Phase 2+ something real to tag books against immediately.
 *
 * Idempotent: looks up existing (domain, slug, parentId) before creating, so re-running
 * after adding more entries here only inserts what's new.
 *
 *   tsx prisma/taxonomy/seed.ts
 */
import { taxonomyDb, isTaxonomyConfigured } from '../../src/modules/taxonomy/client.js';
import type { TaxonomyDomain, TaxonomyNodeType } from '../../src/modules/taxonomy/types.js';

interface SeedNode {
    domain: TaxonomyDomain;
    nodeType: TaxonomyNodeType;
    name: string;
    slug: string;
    metadata?: Record<string, unknown>;
    children?: SeedNode[];
}

async function upsert(node: SeedNode, parentId: string | null, ancestorIds: string[]): Promise<string> {
    const db = taxonomyDb();

    const existing = await db.taxonomyNode.findFirst({
        where: { domain: node.domain, slug: node.slug, parentId },
    });

    const id = existing
        ? existing.id
        : (
              await db.taxonomyNode.create({
                  data: {
                      domain: node.domain,
                      nodeType: node.nodeType,
                      name: node.name,
                      slug: node.slug,
                      parentId,
                      ancestorIds,
                      metadata: node.metadata,
                  },
              })
          ).id;

    if (!existing) {
        console.log(`  created ${node.domain}/${node.nodeType}/${node.slug}`);
    }

    if (node.children) {
        for (const child of node.children) {
            await upsert(child, id, [...ancestorIds, id]);
        }
    }
    return id;
}

const classNodes = (subjects?: string[]): SeedNode[] =>
    Array.from({ length: 12 }, (_, i) => i + 1).map((n) => ({
        domain: 'school' as const,
        nodeType: 'class' as const,
        name: `Class ${n}`,
        slug: `class-${n}`,
        metadata: { classNumber: n },
        // Representative subject seeding only for Class 10 and Class 12 — see file
        // header. Other classes get the Class node so the branch exists, ready for an
        // admin to fill in subjects via the API.
        children:
            subjects && (n === 10 || n === 12)
                ? subjects.map((s) => ({
                      domain: 'school' as const,
                      nodeType: 'subject' as const,
                      name: s,
                      slug: s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  }))
                : undefined,
    }));

const CORE_SUBJECTS = ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi'];

const TREE: SeedNode[] = [
    // ── School Education ────────────────────────────────────────────────
    {
        domain: 'school',
        nodeType: 'board',
        name: 'CBSE',
        slug: 'cbse',
        children: [
            { domain: 'school', nodeType: 'medium', name: 'English', slug: 'english', children: classNodes(CORE_SUBJECTS) },
            { domain: 'school', nodeType: 'medium', name: 'Hindi', slug: 'hindi', children: classNodes(CORE_SUBJECTS) },
        ],
    },
    {
        domain: 'school',
        nodeType: 'board',
        name: 'ICSE',
        slug: 'icse',
        children: [
            { domain: 'school', nodeType: 'medium', name: 'English', slug: 'english', children: classNodes(CORE_SUBJECTS) },
        ],
    },
    {
        domain: 'school',
        nodeType: 'board',
        name: 'State Board',
        slug: 'state-board',
        metadata: { requiresState: true },
        children: [
            {
                domain: 'school', nodeType: 'state', name: 'Maharashtra', slug: 'maharashtra',
                children: [
                    { domain: 'school', nodeType: 'medium', name: 'English', slug: 'english', children: classNodes() },
                    { domain: 'school', nodeType: 'medium', name: 'Hindi', slug: 'hindi', children: classNodes() },
                    { domain: 'school', nodeType: 'medium', name: 'Marathi', slug: 'marathi', children: classNodes() },
                ],
            },
            {
                domain: 'school', nodeType: 'state', name: 'Uttar Pradesh', slug: 'uttar-pradesh',
                children: [
                    { domain: 'school', nodeType: 'medium', name: 'English', slug: 'english', children: classNodes() },
                    { domain: 'school', nodeType: 'medium', name: 'Hindi', slug: 'hindi', children: classNodes() },
                ],
            },
            {
                domain: 'school', nodeType: 'state', name: 'Bihar', slug: 'bihar',
                children: [
                    { domain: 'school', nodeType: 'medium', name: 'English', slug: 'english', children: classNodes() },
                    { domain: 'school', nodeType: 'medium', name: 'Hindi', slug: 'hindi', children: classNodes() },
                ],
            },
        ],
    },

    // ── College Education ───────────────────────────────────────────────
    // Modeled from what's actually shipping today (VAMC — final-year BAMS only),
    // per the plan's investigation, not the whole 5.5-year degree.
    {
        domain: 'college',
        nodeType: 'degree',
        name: 'BAMS',
        slug: 'bams',
        children: [
            {
                domain: 'college', nodeType: 'regulatory_body', name: 'NCISM', slug: 'ncism',
                children: [
                    {
                        domain: 'college', nodeType: 'year_semester', name: 'Final Year', slug: 'final-year',
                        children: [
                            'Kayachikitsa', 'Shalya Tantra', 'Kaumarabhritya', 'Dravyaguna',
                            'Rachana Sharir', 'Kriya Sharir', 'Swasthavritta', 'Prasuti Tantra', 'Agadatantra',
                        ].map((s) => ({
                            domain: 'college' as const, nodeType: 'subject' as const, name: s,
                            slug: s.toLowerCase().replace(/\s+/g, '-'),
                        })),
                    },
                ],
            },
        ],
    },

    // ── Competitive Exam Prep ───────────────────────────────────────────
    {
        domain: 'competitive', nodeType: 'sector', name: 'Civil Services', slug: 'civil-services',
        children: [{
            domain: 'competitive', nodeType: 'exam_competitive', name: 'UPSC CSE', slug: 'upsc-cse',
            children: [{ domain: 'competitive', nodeType: 'subject_paper', name: 'General Studies I', slug: 'general-studies-1' }],
        }],
    },
    {
        domain: 'competitive', nodeType: 'sector', name: 'Banking & Insurance', slug: 'banking-insurance',
        children: [{ domain: 'competitive', nodeType: 'exam_competitive', name: 'IBPS PO', slug: 'ibps-po' }],
    },
    {
        domain: 'competitive', nodeType: 'sector', name: 'SSC & Railways', slug: 'ssc-railways',
        children: [{ domain: 'competitive', nodeType: 'exam_competitive', name: 'SSC CGL', slug: 'ssc-cgl' }],
    },
    {
        domain: 'competitive', nodeType: 'sector', name: 'Defence', slug: 'defence',
        children: [{ domain: 'competitive', nodeType: 'exam_competitive', name: 'NDA', slug: 'nda' }],
    },
    {
        domain: 'competitive', nodeType: 'sector', name: 'Teaching/CTET', slug: 'teaching-ctet',
        children: [{ domain: 'competitive', nodeType: 'exam_competitive', name: 'CTET', slug: 'ctet' }],
    },
    {
        domain: 'competitive', nodeType: 'sector', name: 'State PSC', slug: 'state-psc',
        children: [{ domain: 'competitive', nodeType: 'exam_competitive', name: 'State PSC (Generic)', slug: 'state-psc-generic' }],
    },

    // ── Entrance Exam Prep ───────────────────────────────────────────────
    {
        domain: 'entrance', nodeType: 'target_stage', name: 'UG', slug: 'ug',
        children: [
            {
                domain: 'entrance', nodeType: 'exam_entrance', name: 'JEE Main', slug: 'jee-main',
                children: ['Physics', 'Chemistry', 'Mathematics'].map((s) => ({
                    domain: 'entrance' as const, nodeType: 'subject' as const, name: s, slug: s.toLowerCase(),
                })),
            },
            { domain: 'entrance', nodeType: 'exam_entrance', name: 'NEET', slug: 'neet' },
            { domain: 'entrance', nodeType: 'exam_entrance', name: 'CUET', slug: 'cuet' },
        ],
    },
    {
        domain: 'entrance', nodeType: 'target_stage', name: 'PG', slug: 'pg',
        children: [
            { domain: 'entrance', nodeType: 'exam_entrance', name: 'CAT', slug: 'cat' },
            { domain: 'entrance', nodeType: 'exam_entrance', name: 'GATE', slug: 'gate' },
        ],
    },
    {
        domain: 'entrance', nodeType: 'target_stage', name: 'School-leaving/Scholarship', slug: 'school-leaving-scholarship',
        children: [{ domain: 'entrance', nodeType: 'exam_entrance', name: 'NTSE', slug: 'ntse' }],
    },

    // ── Misc ─────────────────────────────────────────────────────────────
    // Intentionally empty — flat, tag-only, no fixed hierarchy. Tags are created ad
    // hoc as `tag` nodes with domain='misc' and parentId=null when first needed.
];

async function main() {
    if (!isTaxonomyConfigured()) {
        console.error('TAXONOMY_DATABASE_URL is not set — nothing to seed.');
        process.exit(1);
    }
    console.log('Seeding taxonomy tree...');
    for (const root of TREE) {
        await upsert(root, null, []);
    }
    console.log('Done.');
    await taxonomyDb().$disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
