import React from "react";
import { LogoIcon } from "@/components/ui/logo";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Plus, Settings, User, ArrowUp, ArrowDown, CreditCard, LayoutDashboard } from "lucide-react";
import { useOrgsAndRepos } from "@/services/queries";
import { Organization } from "@/types/dashboard";
import { AppStore, setSelectedOrg } from "@/lib/store";
import { useStoreState } from 'pullstate';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const { data, isLoading } = useOrgsAndRepos();
  const selectedOrg = useStoreState(AppStore, s => s.selectedOrg);
  const [isMac, setIsMac] = React.useState(false);
  const pathname = usePathname();

  // Set initial selected org when data loads
  React.useEffect(() => {
    const results = data?.data?.results;
    if (results && results.length > 0 && !selectedOrg) {
      setSelectedOrg(results[0].organization.name);
    }
  }, [data, selectedOrg]);

  // Detect platform for shortcut label
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mac =
        navigator.platform.toLowerCase().includes('mac') ||
        navigator.userAgent.toLowerCase().includes('mac');
      setIsMac(mac);
    }
  }, []);

  return (
    <aside className="h-screen w-64 bg-black text-white flex flex-col border-r border-neutral-800">
      {/* Top Section: Org, Search, Plus */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-neutral-800">
        <LogoIcon className="w-8 h-8 bg-blue-600 rounded-md p-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="px-2 py-1 text-[11px] font-semibold flex items-center gap-1 text-white hover:bg-neutral-900 focus:bg-neutral-900 focus:outline-none focus:ring-0"
              tabIndex={-1}
              onKeyDown={(e) => {
                // Prevent default keyboard navigation
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                }
              }}
            >
              <span className="truncate max-w-[100px]">{isLoading ? "Loading..." : selectedOrg}</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="ml-1"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-neutral-900 border-neutral-800 text-white">
            {data?.data?.results?.map((result) => (
              <DropdownMenuItem
                key={result.organization.id}
                onClick={() => setSelectedOrg(result.organization.name)}
                className={selectedOrg === result.organization.name ? "bg-neutral-800" : ""}
              >
                {result.organization.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-neutral-800" />
            <div className="px-2 py-1.5 text-xs text-neutral-400 flex items-center gap-1">
              <span className="font-medium">{isMac ? '⌘' : 'Ctrl'}</span>
              <span className="flex items-center gap-0.5">
                <ArrowUp className="w-3 h-3" />
                <ArrowDown className="w-3 h-3" />
              </span>
              <span>to switch orgs</span>
            </div>
            <div className="px-2 py-1.5 text-xs text-neutral-400 flex items-center gap-1">
              <button
                onClick={() => {
                  window.open('https://github.com/apps/trackyourdev/installations/new', '_blank');
                }}
                className="hover:text-white transition-colors duration-200 flex items-center gap-1"
              >
                <Settings className="w-3 h-3 text-white" />
                <span className="text-white">Manage Organizations</span>
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="flex-1" />
        {/* <Button variant="ghost" size="icon" className="text-white hover:bg-neutral-900">
          <Search className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-neutral-900">
          <Plus className="w-5 h-5" />
        </Button> */}
      </div>
      {/* Sidebar Options */}
      <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
        <SidebarOption
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Board"
          asLink
          href="/dashboard/board"
          active={pathname === '/dashboard/board'}
        />
        <SidebarOption
          icon={<User className="w-5 h-5" />}
          label="Track Tasks"
          asLink
          href="/dashboard/tracktasks"
          active={pathname === '/dashboard/tracktasks'}
        />
        <SidebarOption icon={<CreditCard className="w-5 h-5" />} label="Manage Billing" />
        {/* <SidebarOption icon={<Search className="w-5 h-5" />} label="Search" /> */}
        {/* <SidebarOption icon={<Plus className="w-5 h-5" />} label="Create" /> */}
      </nav>
      <div className="px-4 py-4 border-t border-neutral-800 text-xs text-neutral-400">© 2025 TrackYourDev</div>
    </aside>
  );
}

function SidebarOption({ icon, label, active, asLink, href }: { icon: React.ReactNode; label: string; active?: boolean; asLink?: boolean; href?: string }) {
  const className = `flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-neutral-900 transition-colors text-left ${active ? 'bg-neutral-800 font-semibold' : ''}`;
  if (asLink && href) {
    return (
      <Link href={href} className={className}>
        <span>{icon}</span>
        <span className="truncate">{label}</span>
      </Link>
    );
  }
  return (
    <button className={className}>
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
