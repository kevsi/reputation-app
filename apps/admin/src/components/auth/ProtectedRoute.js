"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ProtectedRoute;
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = (0, AuthContext_1.useAuth)();
    const location = (0, react_router_dom_1.useLocation)();
    if (isLoading) {
        return (<div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center space-y-4">
                    <lucide_react_1.Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto"/>
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>);
    }
    if (!isAuthenticated) {
        // Redirect to login but save the location they were trying to access
        return <react_router_dom_1.Navigate to="/login" state={{ from: location }} replace/>;
    }
    return <>{children}</>;
}
