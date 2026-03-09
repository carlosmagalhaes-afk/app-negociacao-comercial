import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();

  // Se já está autenticado, redireciona para dashboard
  useEffect(() => {
    if (user && !loading) {
      window.location.href = "/dashboard";
    }
  }, [user, loading]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-foreground">NC</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Negociação Comercial
            </h1>
            <p className="text-muted-foreground">
              Sistema de Gestão de Comodato e Desconto
            </p>
          </div>

          {/* Login Button */}
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full btn-touch bg-primary hover:bg-primary/90 text-lg py-6"
            >
              Entrar com Manus
            </Button>
          </div>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Funcionalidades:</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Calculadora de Comodato com sugestões automáticas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Simulador de Desconto com análise de viabilidade</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Histórico completo de negociações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Painéis para Gerente Regional e Administrador</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            <p>Sistema corporativo restrito</p>
            <p className="mt-2">Acesso apenas para usuários autorizados</p>
          </div>
        </div>
      </Card>

      {/* Watermark */}
      <div className="watermark">
        Negociação Comercial
      </div>
    </div>
  );
}
