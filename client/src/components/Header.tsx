// src/components/Header.tsx
import { useEffect, useState } from "react";
import { Search, Moon, SunMedium, Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [dark, setDark] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Perfect theme detection: system + localStorage + no flash
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved ? saved === "dark" : prefersDark;

    setDark(initial);
    if (initial) document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Close mobile menus when clicking outside
  useEffect(() => {
    if (mobileSearch || mobileMenu) {
      const handler = () => {
        setMobileSearch(false);
        setMobileMenu(false);
      };
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [mobileSearch, mobileMenu]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex-shrink-0 shadow-md" />
            <div className="hidden xs:block">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Validata Admin</div>
              <div className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">
                Document Validation
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search orgs, documents, users, reports..."
                className="w-full rounded-xl border bg-background/80 pl-10 pr-4 py-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all duration-200 placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center gap-1.5">
            {/* Mobile Search Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSearch(!mobileSearch);
                setMobileMenu(false);
              }}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Toggle (Future use - you can add links later) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenu(!mobileMenu);
                setMobileSearch(false);
              }}
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {dark ? <SunMedium className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <div className="ml-2 h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-4 ring-background shadow-lg" />
            </div>

            {/* Mobile Theme + Avatar */}
            <div className="md:hidden flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {dark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 ring-2 ring-background" />
            </div>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {mobileSearch && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur px-4 py-4 animate-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                autoFocus
                className="w-full rounded-xl border bg-background pl-10 pr-4 py-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Mobile Menu (Optional - ready for future links) */}
        {mobileMenu && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur px-6 py-4 space-y-3 animate-in slide-in-from-top-2">
            <a href="/admin" className="block py-2 text-sm font-medium">Dashboard</a>
            <a href="/admin/users" className="block py-2 text-sm text-muted-foreground">Users</a>
            <a href="/admin/reports" className="block py-2 text-sm text-muted-foreground">Reports</a>
            <a href="/admin/settings" className="block py-2 text-sm text-muted-foreground">Settings</a>
          </div>
        )}
      </header>
    </>
  );
}