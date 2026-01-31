"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHeader = AdminHeader;
const lucide_react_1 = require("lucide-react");
const AuthContext_1 = require("@/contexts/AuthContext");
const react_router_dom_1 = require("react-router-dom");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const avatar_1 = require("@/components/ui/avatar");
function AdminHeader({ onMenuClick }) {
    const { user, logout } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    return (<header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
      {/* Left - Menu button mobile */}
      <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors">
        <lucide_react_1.Menu className="w-5 h-5 text-foreground"/>
      </button>

      {/* Center - Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input type="text" placeholder="Rechercher..." className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
        </div>
      </div>

      {/* Right - Notifications & User */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <lucide_react_1.Bell className="w-5 h-5 text-foreground"/>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger className="focus:outline-none">
            <div className="flex items-center gap-2 p-1 hover:bg-muted rounded-lg transition-colors">
              <avatar_1.Avatar className="h-8 w-8">
                <avatar_1.AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {user?.name ? getInitials(user.name) : 'U'}
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.role || 'USER'}</p>
              </div>
            </div>
          </dropdown_menu_1.DropdownMenuTrigger>
          <dropdown_menu_1.DropdownMenuContent align="end" className="w-56">
            <dropdown_menu_1.DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </div>
            </dropdown_menu_1.DropdownMenuLabel>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuItem>
              <lucide_react_1.User className="mr-2 h-4 w-4"/>
              Profile
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuItem>
              <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
              Settings
            </dropdown_menu_1.DropdownMenuItem>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
              Logout
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>
      </div>
    </header>);
}
