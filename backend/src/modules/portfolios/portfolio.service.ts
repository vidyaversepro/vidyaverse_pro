import { prisma } from '../../config/database.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { storage } from '../../config/minio.js';
import { logger } from '../../utils/logger.js';
import type {
  PortfolioCreateInput,
  PortfolioUpdateInput,
  PortfolioSectionCreateInput,
  PortfolioSectionUpdateInput,
  PortfolioQueryInput,
  GenerateStaticSiteInput,
} from '@vidyaverse/shared-validation';

// Portfolio themes with their CSS configurations
const PORTFOLIO_THEMES = {
  modern: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
  },
  classic: {
    primaryColor: '#1F2937',
    secondaryColor: '#4B5563',
    fontFamily: 'Georgia, serif',
    borderRadius: '4px',
  },
  minimal: {
    primaryColor: '#000000',
    secondaryColor: '#6B7280',
    fontFamily: 'Helvetica, sans-serif',
    borderRadius: '0',
  },
  colorful: {
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899',
    fontFamily: 'Poppins, sans-serif',
    borderRadius: '16px',
  },
  professional: {
    primaryColor: '#0F172A',
    secondaryColor: '#334155',
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '8px',
  },
};

export const createPortfolioService = (tx: any = prisma) => ({
  // ============================================================================
  // PORTFOLIO CRUD
  // ============================================================================

  async create(institutionId: string, data: PortfolioCreateInput) {
    const { studentId, templateId, title, bio, theme, customDomain, isPublic } = data;

    // Verify student exists
    const student = await tx.student.findFirst({
      where: { id: studentId, institutionId },
      include: {
        section: { include: { class: true } },
        institution: true,
      },
    });

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Check if portfolio already exists
    const existing = await tx.portfolio.findFirst({
      where: { studentId },
    });

    if (existing) {
      throw new BadRequestError('Portfolio already exists for this student');
    }

    // Generate unique slug
    const slug = await this.generateUniqueSlug(student.name, institutionId);

    // Create portfolio
    const portfolio = await tx.portfolio.create({
      data: {
        studentId,
        institutionId,
        templateId,
        title: title || `${student.name}'s Portfolio`,
        bio,
        theme: theme || 'modern',
        themeConfig: PORTFOLIO_THEMES[theme || 'modern'],
        slug,
        customDomain,
        isPublic: isPublic ?? true,
        status: 'draft',
      },
      include: {
        student: true,
        sections: true,
      },
    });

    // Create default sections
    await this.createDefaultSections(portfolio.id, student);

    logger.info('Portfolio created', { portfolioId: portfolio.id, studentId });
    return this.getById(portfolio.id, institutionId);
  },

  async createDefaultSections(portfolioId: string, student: any) {
    const defaultSections = [
      {
        portfolioId,
        type: 'about',
        title: 'About Me',
        content: {
          name: student.name,
          bio: '',
          photoUrl: student.photoUrl,
        },
        order: 0,
        isVisible: true,
      },
      {
        portfolioId,
        type: 'education',
        title: 'Education',
        content: {
          entries: [
            {
              institution: student.institution?.name,
              degree: student.section?.class?.name,
              years: `${new Date().getFullYear() - 1} - Present`,
            },
          ],
        },
        order: 1,
        isVisible: true,
      },
      {
        portfolioId,
        type: 'skills',
        title: 'Skills',
        content: { skills: [] },
        order: 2,
        isVisible: true,
      },
      {
        portfolioId,
        type: 'achievements',
        title: 'Achievements',
        content: { achievements: [] },
        order: 3,
        isVisible: true,
      },
      {
        portfolioId,
        type: 'projects',
        title: 'Projects',
        content: { projects: [] },
        order: 4,
        isVisible: true,
      },
      {
        portfolioId,
        type: 'gallery',
        title: 'Gallery',
        content: { items: [] },
        order: 5,
        isVisible: false,
      },
      {
        portfolioId,
        type: 'contact',
        title: 'Contact',
        content: { email: '', showEmail: false },
        order: 6,
        isVisible: true,
      },
    ];

    await tx.portfolioSection.createMany({
      data: defaultSections as any,
    });
  },

  async update(id: string, institutionId: string, data: PortfolioUpdateInput) {
    await this.getById(id, institutionId);

    const updateData: any = { ...data };
    if (data.theme) {
      updateData.themeConfig = PORTFOLIO_THEMES[data.theme];
    }

    const portfolio = await tx.portfolio.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        sections: { orderBy: { order: 'asc' } },
      },
    });

    return portfolio;
  },

  async getById(id: string, institutionId: string) {
    const portfolio = await tx.portfolio.findFirst({
      where: { id, institutionId },
      include: {
        student: {
          include: {
            section: { include: { class: true } },
            institution: true,
          },
        },
        sections: { orderBy: { order: 'asc' } },
      },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio not found');
    }

    return portfolio;
  },

  async getBySlug(slug: string) {
    const portfolio = await tx.portfolio.findFirst({
      where: { slug, isPublic: true, status: 'published' },
      include: {
        student: {
          select: {
            name: true,
            photoUrl: true,
            section: { include: { class: true } },
            institution: { select: { name: true, logoUrl: true } },
          },
        },
        sections: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!portfolio) {
      throw new NotFoundError('Portfolio not found');
    }

    // Increment view count
    await tx.portfolio.update({
      where: { id: portfolio.id },
      data: { viewCount: { increment: 1 } },
    });

    return portfolio;
  },

  async list(institutionId: string, query: PortfolioQueryInput) {
    const { sectionId, isPublic, theme, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = { institutionId };
    if (sectionId) where.student = { sectionId };
    if (isPublic !== undefined) where.isPublic = isPublic;
    if (theme) where.theme = theme;

    const [portfolios, total] = await Promise.all([
      tx.portfolio.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              admissionNumber: true,
              photoUrl: true,
              section: { include: { class: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      tx.portfolio.count({ where }),
    ]);

    return {
      portfolios,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async publish(id: string, institutionId: string) {
    await this.getById(id, institutionId);

    return tx.portfolio.update({
      where: { id },
      data: { status: 'published', publishedAt: new Date() },
    });
  },

  async unpublish(id: string, institutionId: string) {
    await this.getById(id, institutionId);

    return tx.portfolio.update({
      where: { id },
      data: { status: 'draft' },
    });
  },

  async delete(id: string, institutionId: string) {
    await this.getById(id, institutionId);

    // Delete sections first
    await tx.portfolioSection.deleteMany({ where: { portfolioId: id } });

    return tx.portfolio.delete({ where: { id } });
  },

  // ============================================================================
  // SECTIONS
  // ============================================================================

  async createSection(institutionId: string, data: PortfolioSectionCreateInput) {
    await this.getById(data.portfolioId, institutionId);

    return tx.portfolioSection.create({
      data: {
        portfolioId: data.portfolioId,
        type: data.type,
        title: data.title,
        content: data.content,
        order: data.order,
        isVisible: data.isVisible ?? true,
      },
    });
  },

  async updateSection(sectionId: string, institutionId: string, data: PortfolioSectionUpdateInput) {
    const section = await tx.portfolioSection.findFirst({
      where: { id: sectionId },
      include: { portfolio: true },
    });

    if (!section || section.portfolio.institutionId !== institutionId) {
      throw new NotFoundError('Section not found');
    }

    return tx.portfolioSection.update({
      where: { id: sectionId },
      data,
    });
  },

  async deleteSection(sectionId: string, institutionId: string) {
    const section = await tx.portfolioSection.findFirst({
      where: { id: sectionId },
      include: { portfolio: true },
    });

    if (!section || section.portfolio.institutionId !== institutionId) {
      throw new NotFoundError('Section not found');
    }

    return tx.portfolioSection.delete({ where: { id: sectionId } });
  },

  async reorderSections(portfolioId: string, institutionId: string, sectionIds: string[]) {
    await this.getById(portfolioId, institutionId);

    const updates = sectionIds.map((id, index) =>
      tx.portfolioSection.update({
        where: { id },
        data: { order: index },
      })
    );

    await Promise.all(updates);
    return this.getById(portfolioId, institutionId);
  },

  // ============================================================================
  // STATIC SITE GENERATION
  // ============================================================================

  async generateStaticSite(institutionId: string, data: GenerateStaticSiteInput) {
    const portfolio = await this.getById(data.portfolioId, institutionId);
    const { format } = data;

    // Generate HTML
    const html = this.generatePortfolioHTML(portfolio);

    if (format === 'pdf') {
      // Generate PDF using puppeteer (placeholder - would use pdf-generator)
      const objectName = storage.generateObjectName(
        institutionId,
        'documents',
        `${portfolio.slug}.pdf`
      );
      // PDF generation would happen here
      return { url: objectName, format: 'pdf' };
    }

    // Upload HTML to MinIO for static hosting
    const objectName = storage.generateObjectName(
      institutionId,
      'documents',
      `${portfolio.slug}/index.html`
    );
    const htmlBuffer = Buffer.from(html, 'utf-8');
    const url = await storage.uploadFile(objectName, htmlBuffer, 'text/html');

    // Also upload CSS
    const css = this.generatePortfolioCSS(portfolio.themeConfig as Record<string, any>);
    const cssObjectName = storage.generateObjectName(
      institutionId,
      'documents',
      `${portfolio.slug}/styles.css`
    );
    await storage.uploadFile(cssObjectName, Buffer.from(css, 'utf-8'), 'text/css');

    logger.info('Static site generated', { portfolioId: portfolio.id, url });

    return { url, format: 'html' };
  },

  generatePortfolioHTML(portfolio: any): string {
    const { student, sections, title } = portfolio;

    const sectionsHtml = sections
      .filter((s: any) => s.isVisible)
      .map((section: any) => this.renderSection(section))
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header class="portfolio-header">
    <div class="container">
      <img src="${student.photoUrl || '/placeholder.jpg'}" alt="${student.name}" class="profile-photo">
      <h1>${student.name}</h1>
      <p class="subtitle">${student.section?.class?.name || 'Student'} | ${student.institution?.name || ''}</p>
    </div>
  </header>
  
  <main class="portfolio-content">
    <div class="container">
      ${sectionsHtml}
    </div>
  </main>
  
  <footer class="portfolio-footer">
    <div class="container">
      <p>Powered by Vidyaverse Pro</p>
    </div>
  </footer>
</body>
</html>`;
  },

  renderSection(section: any): string {
    const content = section.content || {};

    switch (section.type) {
      case 'about':
        return `
          <section class="portfolio-section about-section" id="about">
            <h2>${section.title}</h2>
            <p>${content.bio || 'No bio added yet.'}</p>
          </section>`;

      case 'education': {
        const eduEntries = content.entries || [];
        return `
          <section class="portfolio-section education-section" id="education">
            <h2>${section.title}</h2>
            <div class="education-list">
              ${eduEntries.map((e: any) => `
                <div class="education-item">
                  <h3>${e.institution}</h3>
                  <p>${e.degree} | ${e.years}</p>
                </div>
              `).join('')}
            </div>
          </section>`;
      }

      case 'skills': {
        const skills = content.skills || [];
        return `
          <section class="portfolio-section skills-section" id="skills">
            <h2>${section.title}</h2>
            <div class="skills-grid">
              ${skills.map((s: any) => `
                <div class="skill-item">
                  <span class="skill-name">${s.name}</span>
                  <div class="skill-bar" style="width: ${(s.proficiency || 3) * 20}%"></div>
                </div>
              `).join('')}
            </div>
          </section>`;
      }

      case 'achievements': {
        const achievements = content.achievements || [];
        return `
          <section class="portfolio-section achievements-section" id="achievements">
            <h2>${section.title}</h2>
            <div class="achievements-grid">
              ${achievements.map((a: any) => `
                <div class="achievement-card">
                  <span class="category">${a.category}</span>
                  <h3>${a.title}</h3>
                  <p>${a.description || ''}</p>
                </div>
              `).join('')}
            </div>
          </section>`;
      }

      case 'projects': {
        const projects = content.projects || [];
        return `
          <section class="portfolio-section projects-section" id="projects">
            <h2>${section.title}</h2>
            <div class="projects-grid">
              ${projects.map((p: any) => `
                <div class="project-card">
                  <h3>${p.title}</h3>
                  <p>${p.description || ''}</p>
                  <div class="tech-stack">${(p.technologies || []).join(', ')}</div>
                  ${p.projectUrl ? `<a href="${p.projectUrl}" target="_blank">View Project</a>` : ''}
                </div>
              `).join('')}
            </div>
          </section>`;
      }

      case 'gallery': {
        const items = content.items || [];
        return `
          <section class="portfolio-section gallery-section" id="gallery">
            <h2>${section.title}</h2>
            <div class="gallery-grid">
              ${items.map((i: any) => `
                <div class="gallery-item">
                  <img src="${i.imageUrl}" alt="${i.title || ''}" loading="lazy">
                  <span>${i.title || ''}</span>
                </div>
              `).join('')}
            </div>
          </section>`;
      }

      case 'contact':
        return `
          <section class="portfolio-section contact-section" id="contact">
            <h2>${section.title}</h2>
            ${content.showEmail && content.email ? `<p>Email: <a href="mailto:${content.email}">${content.email}</a></p>` : ''}
          </section>`;

      default:
        return `
          <section class="portfolio-section custom-section" id="${section.type}">
            <h2>${section.title}</h2>
            <div>${JSON.stringify(content)}</div>
          </section>`;
    }
  },

  generatePortfolioCSS(themeConfig: any): string {
    const { primaryColor, secondaryColor, fontFamily, borderRadius } = themeConfig || PORTFOLIO_THEMES.modern;

    return `
:root {
  --primary: ${primaryColor};
  --secondary: ${secondaryColor};
  --bg: #ffffff;
  --text: #1f2937;
  --text-muted: #6b7280;
  --radius: ${borderRadius};
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: ${fontFamily};
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.portfolio-header {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  padding: 60px 0;
  text-align: center;
}

.profile-photo {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  margin-bottom: 20px;
}

.portfolio-header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.subtitle {
  opacity: 0.9;
  font-size: 1.1rem;
}

.portfolio-content {
  padding: 40px 0;
}

.portfolio-section {
  margin-bottom: 40px;
  padding: 30px;
  background: #f9fafb;
  border-radius: var(--radius);
}

.portfolio-section h2 {
  color: var(--primary);
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--primary);
}

.skills-grid, .achievements-grid, .projects-grid, .gallery-grid {
  display: grid;
  gap: 16px;
}

.skills-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
.achievements-grid, .projects-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.gallery-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }

.skill-item {
  background: white;
  padding: 12px;
  border-radius: var(--radius);
}

.skill-bar {
  height: 6px;
  background: var(--primary);
  border-radius: 3px;
  margin-top: 8px;
}

.achievement-card, .project-card {
  background: white;
  padding: 20px;
  border-radius: var(--radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.achievement-card .category {
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-bottom: 10px;
}

.gallery-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--radius);
}

.portfolio-footer {
  background: var(--text);
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .portfolio-header h1 { font-size: 1.8rem; }
  .portfolio-section { padding: 20px; }
}`;
  },

  // ============================================================================
  // HELPERS
  // ============================================================================

  async generateUniqueSlug(name: string, _institutionId: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await tx.portfolio.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  },
});

export const portfolioService = createPortfolioService();
