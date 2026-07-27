/**
 * Builds the WhatsApp Cloud API `components` array from a template's placeholder
 * spec + the runtime variables. Ported from Urmi's messaging/template-mapper.
 *
 * `placeholders` shape: { header?: string[], body?: string[], button?: string[] }
 * where each array lists the variable keys that fill that component, in order.
 */
export class TemplateVariableMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateVariableMissingError';
  }
}

type PlaceholderSpec = Record<string, string[]> | null | undefined;

export function buildComponents(
  template: { placeholders?: PlaceholderSpec },
  variables: Record<string, string> | null,
): unknown[] {
  const components: unknown[] = [];
  const placeholders = template.placeholders;
  const vars = variables || {};

  if (!placeholders) return components;

  for (const [compType, keys] of Object.entries(placeholders)) {
    if (!Array.isArray(keys) || keys.length === 0) continue;

    const parameters = keys.map((key) => {
      const val = vars[key];
      if (val === undefined || val === null) {
        throw new TemplateVariableMissingError(
          `Missing variable '${key}' for component '${compType}'`,
        );
      }
      return { type: 'text', text: String(val) };
    });

    if (compType === 'button') {
      components.push({ type: 'button', sub_type: 'url', index: '0', parameters });
    } else {
      components.push({ type: compType, parameters });
    }
  }

  return components;
}
