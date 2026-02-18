import { Sun, Moon, Clock, Bell, Menu, Search, PanelRightOpen } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { BrandSelector } from "./BrandSelector";

interface HeaderProps {
  onMenuClick?: () => void;
  onRightSidebarClick?: () => void;
  rightSidebarCollapsed?: boolean;
}

export function Header({ onMenuClick, onRightSidebarClick, rightSidebarCollapsed }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-[68px] border-b border-border px-4 md:px-7 py-5 flex items-center justify-between bg-card">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Burger menu mobile */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-accent transition-colors"
        >
          <Menu className="w-4 h-4 text-foreground" />
        </button>
        
        {/* Brand Selector */}
        <div className="hidden sm:flex items-center gap-2 ml-2">
          <button className="px-3 py-1 rounded-2xl hover:bg-accent transition-colors">
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </button>
          <span className="text-sm text-muted-foreground opacity-40">/</span>
          <BrandSelector />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-5">
        

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-accent transition-all hover:scale-110"
            title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-foreground" />
            )}
          </button>

          <button className="hidden sm:flex w-7 h-7 items-center justify-center rounded-2xl hover:bg-accent transition-colors">
            <Clock className="w-4 h-4 text-foreground" />
          </button>
          
          <button className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-accent transition-colors relative">
            <Bell className="w-4 h-4 text-foreground" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          
          {rightSidebarCollapsed && onRightSidebarClick && (
            <button 
              onClick={onRightSidebarClick}
              className="hidden xl:flex w-7 h-7 items-center justify-center rounded-2xl hover:bg-accent transition-colors"
            >
              <PanelRightOpen className="w-4 h-4 text-foreground" />
            </button>
          )}
          
          <button 
            onClick={onRightSidebarClick}
            className="xl:hidden w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-accent transition-colors"
          >
            <PanelRightOpen className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}