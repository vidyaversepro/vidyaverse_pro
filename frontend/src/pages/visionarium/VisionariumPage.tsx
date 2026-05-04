import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Filter, Globe, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const CATEGORIES = [
    { label: 'All', value: '' },
    { label: 'Science (विज्ञान)', value: 'SCIENCE' },
    { label: 'Maths (गणित)', value: 'MATHS' },
    { label: 'History (इतिहास)', value: 'HISTORY' },
    { label: 'IT (सूचना प्रौद्योगिकी)', value: 'IT' },
    { label: 'Essay (निबंध)', value: 'ESSAY' },
    { label: 'Poetry (कविता)', value: 'POEM' },
    { label: 'Itihasa (इतिहास)', value: 'ITIHASA' },
    { label: 'Darshana (दर्शन)', value: 'DARSHANA' },
    { label: 'Bharatiya Vigyan', value: 'BHARATIYA_VIGYAN' },
];

const LANGUAGES = [
    { label: 'All', value: '' },
    { label: 'English', value: 'en' },
    { label: 'Hindi (हिन्दी)', value: 'hi' },
    { label: 'Bilingual (द्विभाषी)', value: 'hi_en' },
];

export default function VisionariumPage() {
    const [category, setCategory] = useState('');
    const [language, setLanguage] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['visionarium-articles', category, language, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '12');
            if (category) params.set('category', category);
            if (language) params.set('language', language);
            const res = await api.get(`/visionarium/articles?${params}`);
            return res.data;
        },
    });

    const articles = data?.data || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-orange-500" />
                        Visionarium (विज़नेरियम)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        India-rooted educational content, test series & student contributions
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm dark:text-gray-300"
                >
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>

                <select
                    value={language}
                    onChange={(e) => { setLanguage(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm dark:text-gray-300"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                </select>

                <div className="relative w-full sm:w-auto sm:ml-auto">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm dark:text-gray-300 w-full sm:w-56"
                    />
                </div>
            </div>

            {/* Articles Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg font-medium">No articles yet</p>
                    <p className="text-sm">Published articles will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articles.map((article: any, i: number) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                                    {article.category}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center gap-1">
                                    <Globe className="w-3 h-3" /> {article.language === 'hi_en' ? 'Bilingual' : article.language === 'hi' ? 'Hindi' : 'English'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                                {article.title}
                            </h3>
                            {article.summary && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">{article.summary}</p>
                            )}
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                                <span>{article.authorUser?.name || article.authorStudent?.name || 'Editorial'}</span>
                                <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-IN') : 'Draft'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                    <span className="text-sm text-gray-500 flex items-center px-3">Page {page} of {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
            )}
        </div>
    );
}
