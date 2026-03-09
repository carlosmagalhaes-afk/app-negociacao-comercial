import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function DashboardMetricas() {
  const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("mes");

  // Fetch dados de simulações (usando gerente para pegar histórico completo)
  const historicoQuery = trpc.gerente.getHistoricoRegiao.useQuery();
  const comodatoQuery = historicoQuery.data?.comodato || [];
  const descontoQuery = historicoQuery.data?.desconto || [];

  const metricas = useMemo(() => {
    const comodatos = comodatoQuery || [];
    const descontos = descontoQuery || [];

    // Taxa de aceitação de comodato
    const totalComodatos = comodatos.length;
    const comodatosAceitados = comodatos.filter((c: any) => c.status === "aceitou").length;
    const taxaAceitacao = totalComodatos > 0 ? (comodatosAceitados / totalComodatos) * 100 : 0;

    // Desconto médio
    const descontoMedio = descontos.length > 0
      ? descontos.reduce((sum: number, d: any) => sum + parseFloat(d.descontoSolicitado || 0), 0) / descontos.length
      : 0;

    // Dados para gráfico de taxa de aceitação por período
    const dataAceitacao = [
      { periodo: "Comodato", aceitacao: taxaAceitacao, rejeicao: 100 - taxaAceitacao },
    ];

    // Dados para gráfico de desconto
    const dataDesconto = [
      { periodo: "Desconto Médio", valor: descontoMedio },
    ];

    // Simulações por status
    const statusComodato = {
      aceitou: comodatosAceitados,
      nao_aceitou: comodatos.filter((c: any) => c.status === "nao_aceitou").length,
      em_negociacao: comodatos.filter((c: any) => c.status === "em_negociacao").length,
    };

    return {
      taxaAceitacao,
      descontoMedio,
      totalComodatos,
      comodatosAceitados,
      totalDescontos: descontos.length,
      statusComodato,
      dataAceitacao,
      dataDesconto,
    };
  }, [comodatoQuery, descontoQuery]);

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Filtrar por Período</h3>
        <div className="flex gap-3">
          {(["dia", "semana", "mes"] as const).map((p) => (
            <Button
              key={p}
              variant={periodo === p ? "default" : "outline"}
              onClick={() => setPeriodo(p)}
              className="btn-touch"
            >
              {p === "dia" ? "Hoje" : p === "semana" ? "Esta Semana" : "Este Mês"}
            </Button>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <p className="text-sm text-muted-foreground mb-2">Total de Comodatos</p>
          <p className="text-3xl font-bold text-primary">{metricas.totalComodatos}</p>
        </Card>

        <Card className="p-6 bg-green-50 border-green-200">
          <p className="text-sm text-muted-foreground mb-2">Comodatos Aceitos</p>
          <p className="text-3xl font-bold text-green-600">{metricas.comodatosAceitados}</p>
          <p className="text-xs text-muted-foreground mt-2">{metricas.taxaAceitacao.toFixed(1)}% de taxa</p>
        </Card>

        <Card className="p-6 bg-purple-50 border-purple-200">
          <p className="text-sm text-muted-foreground mb-2">Total de Descontos</p>
          <p className="text-3xl font-bold text-purple-600">{metricas.totalDescontos}</p>
        </Card>

        <Card className="p-6 bg-orange-50 border-orange-200">
          <p className="text-sm text-muted-foreground mb-2">Desconto Médio</p>
          <p className="text-3xl font-bold text-orange-600">{metricas.descontoMedio.toFixed(2)}%</p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Taxa de Aceitação */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Taxa de Aceitação de Comodato</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.dataAceitacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aceitacao" fill="#10b981" name="Aceitos (%)" />
              <Bar dataKey="rejeicao" fill="#ef4444" name="Rejeitados (%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Status das Negociações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Aceitos", value: metricas.statusComodato.aceitou },
                  { name: "Rejeitados", value: metricas.statusComodato.nao_aceitou },
                  { name: "Em Negociação", value: metricas.statusComodato.em_negociacao },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tabela de Resumo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Resumo de Negociações</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Métrica</th>
                <th className="text-right py-3 px-4 font-semibold">Valor</th>
                <th className="text-right py-3 px-4 font-semibold">Percentual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">Comodatos Aceitos</td>
                <td className="text-right py-3 px-4">{metricas.comodatosAceitados}</td>
                <td className="text-right py-3 px-4 text-green-600 font-semibold">
                  {metricas.taxaAceitacao.toFixed(1)}%
                </td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">Comodatos Rejeitados</td>
                <td className="text-right py-3 px-4">
                  {metricas.statusComodato.nao_aceitou}
                </td>
                <td className="text-right py-3 px-4 text-red-600 font-semibold">
                  {((metricas.statusComodato.nao_aceitou / metricas.totalComodatos) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="py-3 px-4">Em Negociação</td>
                <td className="text-right py-3 px-4">
                  {metricas.statusComodato.em_negociacao}
                </td>
                <td className="text-right py-3 px-4 text-amber-600 font-semibold">
                  {((metricas.statusComodato.em_negociacao / metricas.totalComodatos) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
