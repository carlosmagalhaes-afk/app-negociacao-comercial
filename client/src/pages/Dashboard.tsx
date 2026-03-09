import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { CalculadoraComodato } from "@/components/CalculadoraComodato";
import { SimuladorDesconto } from "@/components/SimuladorDesconto";
import { HistoricoSimulacoes } from "@/components/HistoricoSimulacoes";
import { TabelaHistoricoGerente } from "@/components/TabelaHistoricoGerente";
import { PainelAdminUsuarios } from "@/components/PainelAdminUsuarios";
import { PainelAdminConfiguracoes } from "@/components/PainelAdminConfiguracoes";
import { ImportacaoCSV } from "@/components/ImportacaoCSV";
import { DashboardMetricas } from "@/components/DashboardMetricas";
import { SincronizacaoCRM } from "@/components/SincronizacaoCRM";
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
          { id: "importacao", label: "Importação" },
          { id: "metricas", label: "Métricas" },
          { id: "crm", label: "CRM" },
          { id: "historico", label: "Histórico" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div className="space-y-6">
          {activeTab === "usuarios" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestão de Usuários</h2>
              <p className="text-muted-foreground mb-6">
                Gerenciamento de representantes, gerentes e administradores
              </p>
              <PainelAdminUsuarios />
            </div>
          )}

          {activeTab === "configuracoes" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Configurações</h2>
              <p className="text-muted-foreground mb-6">
                Configurar comodato, desconto e faixas de preço
              </p>
              <PainelAdminConfiguracoes />
            </div>
          )}

          {activeTab === "importacao" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Importação em Lote</h2>
              <p className="text-muted-foreground mb-6">
                Importar múltiplos usuários e configurações via CSV
              </p>
              <ImportacaoCSV />
            </div>
          )}

          {activeTab === "metricas" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Dashboard de Métricas</h2>
              <p className="text-muted-foreground mb-6">
                Visualizar gráficos e indicadores de desempenho
              </p>
              <DashboardMetricas />
            </div>
          )}

          {activeTab === "crm" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Sincronização com CRM</h2>
              <p className="text-muted-foreground mb-6">
                Conectar e sincronizar dados com seu CRM
              </p>
              <SincronizacaoCRM />
            </div>
          )}

          {activeTab === "historico" && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Histórico Completo</h2>
              <p className="text-muted-foreground mb-6">
                Visualizar todas as simulações de todos os usuários
              </p>
              <TabelaHistoricoGerente />
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
          <div>
            <h2 className="text-2xl font-bold mb-2">Histórico de Simulações</h2>
            <p className="text-muted-foreground mb-6">
              Visualize todas as suas simulações anteriores
            </p>
            <HistoricoSimulacoes />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
