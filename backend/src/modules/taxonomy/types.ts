/**
 * The taxonomy contract served to the relying parties (PDLMS, DigiClassroom) and to
 * Vidyaverse's own admin UI. Mirrors the enums in prisma/taxonomy/schema.prisma —
 * keep in step.
 */

export const TAXONOMY_DOMAINS = ['school', 'college', 'competitive', 'entrance', 'misc'] as const;
export type TaxonomyDomain = (typeof TAXONOMY_DOMAINS)[number];

export const TAXONOMY_NODE_TYPES = [
    'board', 'state', 'medium', 'class', 'subject',
    'degree', 'regulatory_body', 'year_semester', 'paper',
    'sector', 'exam_competitive', 'subject_paper',
    'target_stage', 'exam_entrance',
    'tag',
] as const;
export type TaxonomyNodeType = (typeof TAXONOMY_NODE_TYPES)[number];

export const TAXONOMY_APPS = ['pdlms', 'digiclassroom'] as const;
export type TaxonomyApp = (typeof TAXONOMY_APPS)[number];

export interface TaxonomyNodeDTO {
    id: string;
    domain: TaxonomyDomain;
    nodeType: TaxonomyNodeType;
    name: string;
    slug: string;
    parentId: string | null;
    ancestorIds: string[];
    sortOrder: number;
    isActive: boolean;
    metadata: Record<string, unknown> | null;
    /** Present only on `GET /tree` responses, omitted on flat node reads. */
    children?: TaxonomyNodeDTO[];
}

export interface BookTaxonomyLinkDTO {
    nodeId: string;
    isPrimary: boolean;
    /** Denormalized for convenience so a caller doesn't need a second round-trip to
     *  render a picked path. */
    node: Pick<TaxonomyNodeDTO, 'id' | 'name' | 'slug' | 'nodeType' | 'domain' | 'ancestorIds'>;
}

export interface SetBookTaxonomyLinksInput {
    links: Array<{ nodeId: string; isPrimary?: boolean }>;
}
