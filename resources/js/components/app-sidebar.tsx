import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarHeart, Globe, Home, LifeBuoy, Settings, Users } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Home', url: '/dashboard', icon: Home },
    { title: 'Find a specialist', url: '/specialists', icon: Users },
    { title: 'My sessions', url: '/dashboard#sessions', icon: CalendarHeart },
    { title: 'Settings', url: '/settings/profile', icon: Settings },
];

const footerNavItems: NavItem[] = [
    { title: 'Visit website', url: '/', icon: Globe },
    { title: 'Help & contact', url: 'mailto:hello@sanad.com', icon: LifeBuoy },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />

                {/* gentle booking nudge */}
                <div className="mt-auto px-3 pb-3">
                    <Link
                        href="/specialists"
                        className="group/nudge border-sage-200 bg-sage-50 hover:border-sage-300 hover:bg-sage-100 block rounded-2xl border p-4 transition"
                    >
                        <p className="font-display text-ashen-800 text-base leading-snug">Feeling overwhelmed?</p>
                        <p className="text-ashen-500 mt-1 text-xs leading-relaxed">A specialist is ready whenever you are.</p>
                        <span className="text-sage-700 mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-all group-hover/nudge:gap-2.5">
                            Talk to someone today
                            <ArrowUpRight className="size-4" />
                        </span>
                    </Link>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
