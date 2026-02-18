"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_router_dom_1 = require("react-router-dom");
const ThemeContext_1 = require("./contexts/ThemeContext");
const AuthContext_1 = require("./contexts/AuthContext");
const ProtectedRoute_1 = __importDefault(require("./components/auth/ProtectedRoute"));
const AdminLayout_1 = __importDefault(require("./components/layout/AdminLayout"));
const Dashboard_1 = __importDefault(require("./pages/Dashboard/Dashboard"));
const Organisations_1 = __importDefault(require("./pages/Organisations/Organisations"));
const Users_1 = __importDefault(require("./pages/Users/Users"));
const Connectors_1 = __importDefault(require("./pages/Connectors/Connectors"));
const Keywords_1 = __importDefault(require("./pages/Keywords/Keywords"));
const Alerts_1 = __importDefault(require("./pages/Alerts/Alerts"));
const AIPage_1 = __importDefault(require("./pages/AI/AIPage"));
const QualityPage_1 = __importDefault(require("./pages/Quality/QualityPage"));
const LoginPage_1 = __importDefault(require("./pages/Auth/LoginPage"));
const RegisterPage_1 = __importDefault(require("./pages/Auth/RegisterPage"));
const BrandsPage_1 = __importDefault(require("./pages/Brands/BrandsPage"));
const SourcesPage_1 = __importDefault(require("./pages/Sources/SourcesPage"));
const MentionsPage_1 = __importDefault(require("./pages/Mentions/MentionsPage"));
const ActionsPage_1 = __importDefault(require("./pages/Actions/ActionsPage"));
function App() {
    return (<ThemeContext_1.ThemeProvider>
      <AuthContext_1.AuthProvider>
        <react_router_dom_1.BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <react_router_dom_1.Routes>
            {/* Public routes */}
            <react_router_dom_1.Route path="/login" element={<LoginPage_1.default />}/>
            <react_router_dom_1.Route path="/register" element={<RegisterPage_1.default />}/>

            {/* Protected admin routes */}
            <react_router_dom_1.Route path="/" element={<react_router_dom_1.Navigate to="/admin" replace/>}/>
            <react_router_dom_1.Route path="/admin" element={<ProtectedRoute_1.default>
                  <AdminLayout_1.default />
                </ProtectedRoute_1.default>}>
              <react_router_dom_1.Route index element={<Dashboard_1.default />}/>
              <react_router_dom_1.Route path="mentions" element={<MentionsPage_1.default />}/>
              <react_router_dom_1.Route path="brands" element={<BrandsPage_1.default />}/>
              <react_router_dom_1.Route path="sources" element={<SourcesPage_1.default />}/>
              <react_router_dom_1.Route path="actions" element={<ActionsPage_1.default />}/>
              <react_router_dom_1.Route path="organisations" element={<Organisations_1.default />}/>
              <react_router_dom_1.Route path="users" element={<Users_1.default />}/>
              <react_router_dom_1.Route path="connectors" element={<Connectors_1.default />}/>
              <react_router_dom_1.Route path="keywords" element={<Keywords_1.default />}/>
              <react_router_dom_1.Route path="alerts" element={<Alerts_1.default />}/>
              <react_router_dom_1.Route path="ai" element={<AIPage_1.default />}/>
              <react_router_dom_1.Route path="quality" element={<QualityPage_1.default />}/>
            </react_router_dom_1.Route>
          </react_router_dom_1.Routes>
        </react_router_dom_1.BrowserRouter>
      </AuthContext_1.AuthProvider>
    </ThemeContext_1.ThemeProvider>);
}
