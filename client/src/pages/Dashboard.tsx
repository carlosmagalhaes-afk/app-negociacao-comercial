import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { CalculadoraComodato } from "@/components/CalculadoraComodato";
import { SimuladorDesconto } from "@/components/SimuladorDesconto";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("comodato");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Render based on user role
  if (user.role === "admin") {
    return (
      <AppLayout
        title="Painel Administrativo"
        tabs={[
          { id: "usuarios", label: "Usuários" },
          { id: "configuracoes", label: "Configurações" },
          { id: "historico", label: "Histórico" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-6">
          {activeTab === "usuarios" && (
            <div className="card-professional">
              <h2 className="text-2xl font-bold mb-4">Gestão de Usuários</h2>
              <p className="text-muted-foreground">
                Gerenciamento de representantes, gerentes e administradores
              </p>
              {/* TODO: Implementar tabela de usuários */}
            </div>
          )}

          {activeTab === "configuracoes" && (
            <div className="card-professional">
              <h2 className="text-2xl font-bold mb-4">Configurações</h2>
              <p className="text-muted-foreground">
                Configurar comodato, desconto e faixas de preço
              </p>
              {/* TODO: Implementar formulários de configuração */}
            </div>
          )}

          {activeTab === "historico" && (
            <div className="card-professional">
              <h2 className="text-2xl font-bold mb-4">Histórico Completo</h2>
              <p className="text-muted-foreground">
                Visualizar todas as simulações de todos os usuários
              </p>
              {/* TODO: Implementar tabela de histórico */}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  if (user.role === "gerente") {
    return (
      <AppLayout
        title="Painel do Gerente Regional"
        tabs={[
          { id: "historico", label: "Histórico da Região" },
          { id: "analise", label: "Análise" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-6">
          {activeTab === "historico" && (
            <div className="card-professional">
              <h2 className="text-2xl font-bold mb-4">
                Histórico de Negociações
              </h2>
              <p className="text-muted-foreground">
                Visualizar simulações de comodato e desconto da sua região
              </p>
              {/* TODO: Implementar tabela de histórico com filtros */}
            </div>
          )}

          {activeTab === "analise" && (
            <div className="card-professional">
              <h2 className="text-2xl font-bold mb-4">Análise Regional</h2>
              <p className="text-muted-foreground">
                Relatórios e métricas de desempenho da região
              </p>
              {/* TODO: Implementar gráficos e análises */}
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // Representante
  return (
    <AppLayout
      title="Calculadora de Negociação"
      tabs={[
        { id: "comodato", label: "Comodato" },
        { id: "desconto", label: "Desconto" },
        { id: "historico", label: "Histórico" },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === "comodato" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Calculadora de Comodato</h2>
            <p className="text-muted-foreground mb-6">
              Calcule se o médico qualifica para receber uma máquina de ultrassom
              em comodato
            </p>
            <CalculadoraComodato />
          </div>
        )}

        {activeTab === "desconto" && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Simulador de Desconto</h2>
            <p className="text-muted-foreground mb-6">
              Simule diferentes cenários de desconto e visualize o impacto
              financeiro
            </p>
            <SimuladorDesconto />
          </div>
        )}

        {activeTab === "historico" && (
          <div className="card-professional">
            <h2 className="text-2xl font-bold mb-4">Histórico de Simulações</h2>
            <p className="text-muted-foreground">
              Visualize todas as suas simulações anteriores
            </p>
            {/* TODO: Implementar tabela de histórico */}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
