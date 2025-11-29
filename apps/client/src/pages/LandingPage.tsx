import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Users, Shield, ArrowRight, AlertCircle } from "lucide-react";

export function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-accent relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">HMS Core</h1>
                <p className="text-white/80 text-sm">Hospital Management System</p>
              </div>
            </div>

            <h2 className="text-5xl font-bold leading-tight mb-6">
              Transform Your Hospital Management
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Streamline operations, enhance patient care, and boost efficiency with our comprehensive healthcare management platform.
            </p>

            <div className="space-y-6">
              <Feature icon={Heart} title="Patient-Centric Care" description="Comprehensive patient records and seamless appointment management" />
              <Feature icon={Users} title="Staff Coordination" description="Efficient team management and role-based access control" />
              <Feature icon={Shield} title="Secure & Compliant" description="HIPAA-compliant data security with multi-tenant architecture" />
            </div>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md border-none shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex justify-center gap-2 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isLogin 
                      ? "bg-primary text-white shadow-lg" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !isLogin 
                      ? "bg-primary text-white shadow-lg" 
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  Sign Up
                </button>
              </div>
              <CardTitle className="text-2xl text-center">
                {isLogin ? "Welcome Back" : "Create Your Hospital"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin 
                  ? "Enter your credentials to access your dashboard" 
                  : "Start your journey with HMS Core today"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <SignupForm setIsLogin={setIsLogin} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
    </div>
  );
}

function LoginForm({ setIsLogin }: { setIsLogin: (value: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password, hospitalId });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="admin@hospital.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary hover:underline"
          >
            Forgot Password?
          </button>
        </div>
        <Input 
          id="password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hospitalId">Hospital ID</Label>
        <Input 
          id="hospitalId" 
          placeholder="cityhospital" 
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          required
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className="text-primary hover:underline font-medium"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}

function SignupForm({ setIsLogin }: { setIsLogin: (value: boolean) => void }) {
  const [hospitalName, setHospitalName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup({ hospitalName, subdomain, adminEmail, adminName, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hospitalName">Hospital Name</Label>
          <Input 
            id="hospitalName" 
            placeholder="City Hospital" 
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input 
            id="subdomain" 
            placeholder="cityhospital" 
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Admin Email</Label>
        <Input 
          id="adminEmail" 
          type="email" 
          placeholder="admin@hospital.com" 
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminName">Admin Name</Label>
        <Input 
          id="adminName" 
          placeholder="Dr. Sarah Smith" 
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <Input 
          id="signupPassword" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
        disabled={loading}
      >
        {loading ? "Creating Hospital..." : "Create Hospital"} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
      <div className="space-y-2 text-center">
        <p className="text-xs text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
        <div className="text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="text-primary hover:underline font-medium"
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
}
