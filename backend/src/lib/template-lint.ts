// @ts-nocheck
/**
 * Static template linter: parses a Handlebars template and flags unknown helpers
 * and unknown variable roots (typos) against an allow-list, so a broken template
 * is caught at SAVE time instead of crashing a bulk run.
 */
import Handlebars from 'handlebars';

const KNOWN_HELPERS = new Set([
    // Handlebars built-ins
    'if', 'unless', 'each', 'with', 'lookup', 'log', 'blockHelperMissing', 'helperMissing',
    // App helpers (see template-engine.ts registerHandlebarsHelpers)
    'formatDate', 'age', 'uppercase', 'lowercase', 'upper', 'lower', 'titlecase',
    'eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'and', 'or', 'default', 'index', 'inc', 'add',
    'join', 'truncate', 'academicYear', 'currentYear', 'qrcode', 'barcode', 'safe', 'photo',
]);

const SKIP_ROOTS = new Set(['this', 'else', 'undefined', 'null', 'true', 'false']);

export interface LintResult {
    ok: boolean;
    parseError?: string;
    unknownHelpers: string[];
    unknownVariableRoots: string[];
}

/**
 * @param content      raw Handlebars template
 * @param allowedRoots set of valid top-level variable names (incl. loop-item keys)
 */
export function lintTemplate(content: string, allowedRoots: Set<string>): LintResult {
    let ast;
    try {
        ast = Handlebars.parse(content);
    } catch (e: any) {
        return { ok: false, parseError: e.message, unknownHelpers: [], unknownVariableRoots: [] };
    }

    const unknownHelpers = new Set<string>();
    const unknownRoots = new Set<string>();

    const checkVar = (path: any) => {
        if (!path || path.type !== 'PathExpression' || path.data) return; // @index/@root etc. skipped
        const root = path.parts && path.parts[0];
        if (!root || SKIP_ROOTS.has(root)) return;
        if (!allowedRoots.has(root)) unknownRoots.add(root);
    };

    class V extends (Handlebars as any).Visitor {
        BlockStatement(b: any) {
            const h = b.path?.original;
            if (h && !KNOWN_HELPERS.has(h)) unknownHelpers.add(h);
            this.acceptArray(b.params);
            if (b.hash) this.accept(b.hash);
            if (b.program) this.accept(b.program);
            if (b.inverse) this.accept(b.inverse);
        }
        MustacheStatement(m: any) {
            const isHelper = (m.params && m.params.length) || (m.hash && m.hash.pairs && m.hash.pairs.length);
            if (isHelper) {
                const h = m.path?.original;
                if (h && !KNOWN_HELPERS.has(h)) unknownHelpers.add(h);
                this.acceptArray(m.params);
                if (m.hash) this.accept(m.hash);
            } else {
                checkVar(m.path);
            }
        }
        SubExpression(s: any) {
            const h = s.path?.original;
            if (h && !KNOWN_HELPERS.has(h)) unknownHelpers.add(h);
            this.acceptArray(s.params);
        }
        PathExpression(p: any) { checkVar(p); }
    }
    new V().accept(ast);

    return {
        ok: unknownHelpers.size === 0 && unknownRoots.size === 0,
        unknownHelpers: [...unknownHelpers],
        unknownVariableRoots: [...unknownRoots],
    };
}

/** Build the allow-list of variable roots from sample data + branding keys. */
export function allowedRootsFromSample(sample: Record<string, any>, brandingKeys: string[]): Set<string> {
    const roots = new Set<string>([...brandingKeys, 'qrCode', 'studentPhoto', 'photoUrl']);
    for (const [k, v] of Object.entries(sample)) {
        roots.add(k);
        if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
            for (const ik of Object.keys(v[0])) roots.add(ik); // loop-item fields
        }
    }
    return roots;
}
