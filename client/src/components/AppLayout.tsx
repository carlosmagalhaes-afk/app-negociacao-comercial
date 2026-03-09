import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  tabs?: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
  }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function AppLayout({
  children,
  title,
  tabs,
  activeTab,
  onTabChange,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-6">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">NC</span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {title}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {user?.name}
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">
              {user?.role === "admin"
                ? "Administrador"
                : user?.role === "gerente"
                  ? "Gerente Regional"
                  : "Representante"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="btn-touch"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 space-y-3">
            <div className="text-sm text-muted-foreground px-3 py-2 rounded-lg bg-muted/50">
              {user?.role === "admin"
                ? "Administrador"
                : user?.role === "gerente"
                  ? "Gerente Regional"
                  : "Representante"}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="w-full btn-touch"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        )}

        {/* Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="border-t border-border flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Watermark */}
      <div className="watermark">
        {user?.name} • {new Date().toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}
