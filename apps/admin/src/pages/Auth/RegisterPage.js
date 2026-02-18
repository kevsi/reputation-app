"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegisterPage;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const AuthContext_1 = require("@/contexts/AuthContext");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const card_1 = require("@/components/ui/card");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
function RegisterPage() {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { register } = (0, AuthContext_1.useAuth)();
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
    });
    const [error, setError] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        setIsLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                organizationName: formData.organizationName,
            });
            navigate('/admin');
        }
        catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <card_1.Card className="w-full max-w-md shadow-2xl">
                <card_1.CardHeader className="space-y-3 text-center">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <lucide_react_1.Shield className="w-8 h-8 text-white"/>
                    </div>
                    <card_1.CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Create Account
                    </card_1.CardTitle>
                    <card_1.CardDescription className="text-base">
                        Start monitoring your reputation today
                    </card_1.CardDescription>
                </card_1.CardHeader>

                <form onSubmit={handleSubmit}>
                    <card_1.CardContent className="space-y-4">
                        {error && (<alert_1.Alert variant="destructive">
                                <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                            </alert_1.Alert>)}

                        <div className="space-y-2">
                            <label_1.Label htmlFor="name">Full Name</label_1.Label>
                            <input_1.Input id="name" name="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required disabled={isLoading} className="h-11"/>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="email">Email</label_1.Label>
                            <input_1.Input id="email" name="email" type="email" placeholder="john@company.com" value={formData.email} onChange={handleChange} required disabled={isLoading} className="h-11"/>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="organizationName" className="flex items-center gap-2">
                                <lucide_react_1.Building2 className="w-4 h-4"/>
                                Organization Name
                            </label_1.Label>
                            <input_1.Input id="organizationName" name="organizationName" type="text" placeholder="My Company" value={formData.organizationName} onChange={handleChange} required disabled={isLoading} className="h-11"/>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="password">Password</label_1.Label>
                            <input_1.Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required disabled={isLoading} className="h-11"/>
                            <p className="text-xs text-slate-500">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label_1.Label htmlFor="confirmPassword">Confirm Password</label_1.Label>
                            <input_1.Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} className="h-11"/>
                        </div>
                    </card_1.CardContent>

                    <card_1.CardFooter className="flex flex-col space-y-4">
                        <button_1.Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" disabled={isLoading}>
                            {isLoading ? (<>
                                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating account...
                                </>) : ('Create Account')}
                        </button_1.Button>

                        <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                            Already have an account?{' '}
                            <react_router_dom_1.Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                Sign in
                            </react_router_dom_1.Link>
                        </div>
                    </card_1.CardFooter>
                </form>
            </card_1.Card>
        </div>);
}
