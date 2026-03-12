import { useState } from "react";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from "lucide-react";
import NyxLexLogo from "@/components/NyxLexLogo";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";

type AuthView = "main" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<AuthView>("main");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Forgot state
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      toast({
        title: "Error de acceso",
        description: error.message === "Invalid login credentials" ? "Credenciales inválidas" : error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      toast({ title: "Bienvenido", description: "Has iniciado sesión correctamente" });
      navigate("/");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }
    if (regPassword !== regConfirm) {
      toast({ title: "Error", description: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    if (regPassword.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const firstName = regName.split(' ')[0];
    const lastName = regName.split(' ').slice(1).join(' ');

    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast({ title: "Error de registro", description: error.message, variant: "destructive" });
      setIsLoading(false);
    } else {
      toast({
        title: "Cuenta creada",
        description: "Revisa tu correo para verificar la cuenta o inicia sesión."
      });
      // Clear fields and switch to login tab would be nice, but for now just show message
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Error", description: "Introduce tu correo electrónico", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth?view=reset`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
      setView("main");
    }
    setIsLoading(false);
  };

  return (
    <div data-theme="light" className="min-h-screen flex items-center justify-center p-4" style={{ background: "linear-gradient(160deg, hsl(0 0% 100%) 0%, hsl(220 14% 90%) 100%)" }}>
      {/* Background subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <NyxLexLogo size={64} variant="light" showText showTagline />
          <p className="text-sm text-muted-foreground mt-1">Gestión Avanzada para Abogados</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          {view === "forgot" ? (
            /* Forgot password */
            <div className="space-y-5">
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={14} /> Volver
              </button>
              <div>
                <h2 className="text-xl font-bold text-foreground">Recuperar Contraseña</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Introduce tu correo y te enviaremos instrucciones para restablecer tu contraseña.
                </p>
              </div>
              <form onSubmit={handleForgot} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="nombre@bufete.com"
                      className="pl-10"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      maxLength={255}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Instrucciones"}
                </Button>
              </form>
            </div>
          ) : (
            /* Login / Register tabs */
            <Tabs defaultValue="login" className="space-y-5">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nombre@bufete.com"
                        className="pl-10"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        maxLength={255}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        maxLength={128}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre completo</Label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        type="text"
                        placeholder="Juan García López"
                        className="pl-10"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        maxLength={100}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="nombre@bufete.com"
                        className="pl-10"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        maxLength={255}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10 pr-10"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        maxLength={128}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        type={showPassword ? "text" : "password"}
                        placeholder="Repite tu contraseña"
                        className="pl-10"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        maxLength={128}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Crear Cuenta"}
                  </Button>

                  <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                    Al registrarte, aceptas nuestros{" "}
                    <a href="#" className="text-primary hover:underline">Términos de Servicio</a> y{" "}
                    <a href="#" className="text-primary hover:underline">Política de Privacidad</a>.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          © 2026 NYX LEX. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
