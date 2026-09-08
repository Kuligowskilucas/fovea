import { Link } from '@inertiajs/react';
import { LayoutGrid, Users, CalendarClock, Archive, Wallet, Glasses, QrCode } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';

import { index as arquivadosIndex } from '@/routes/arquivados';
import { qrcode as catalogoQrcode } from '@/routes/catalogo';
import { index as consultasIndex } from '@/routes/consultas';
import { mes as financeiroMes } from '@/routes/financeiro';
import { index as pacientesIndex } from '@/routes/pacientes';
import { index as produtosIndex } from '@/routes/produtos';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Pacientes',
        href: pacientesIndex(),
        icon: Users,
    },
    {
        title: 'Consultas',
        href: consultasIndex(),
        icon: CalendarClock,
    },
    {
        title: 'Financeiro',
        href: financeiroMes(),
        icon: Wallet,
    },
    {
        title: 'Produtos',
        href: produtosIndex(),
        icon: Glasses,
    },
    {
        title: 'QR do catálogo',
        href: catalogoQrcode(),
        icon: QrCode,
    },
    {
        title: 'Arquivados',
        href: arquivadosIndex(),
        icon: Archive,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}