import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { QUICK_ACTIONS } from '@/pages/dashboard/dashboard.config';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function QuickActionsPanel() {
    return (
        <Card className="h-full border-0 shadow-lg rounded-2xl bg-white dark:bg-gray-900 flex flex-col">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800/60">
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                <CardDescription className="text-xs">Fast access to common tasks</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUICK_ACTIONS.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={index}
                                to={action.href}
                                className="group flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-md transition-all bg-gray-50/50 dark:bg-gray-800/30"
                            >
                                <div className={cn("p-2 rounded-lg text-white mr-3 shadow-sm", `bg-gradient-to-br ${action.color}`)}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors truncate">
                                        {action.label}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </Link>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
