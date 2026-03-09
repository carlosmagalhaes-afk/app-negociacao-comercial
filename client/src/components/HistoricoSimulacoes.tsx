import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface HistoricoProps {
  tipo?: "comodato" | "desconto" | "todos";
  onRecarregar?: (simulacao: any) => void;
}

export function HistoricoSimulacoes({ tipo = "todos", onRecarregar }: HistoricoProps) {
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "aceitou" | "nao_aceitou" | "em_negociacao">("");

  const historicoQuery = trpc.comodato.getHistorico.useQuery();

  const simulacoes = historicoQuery.data || [];

  // Filtrar dados
  const dadosFiltrados = simulacoes.filter((item: any) => {
    if (filtroMedico && !item.nomeMedico?.toLowerCase().includes(filtroMedico.toLowerCase())) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    return true;
  });

  // Agrupar por médico
  const agrupado = dadosFiltrados.reduce((acc: any, item: any) => {
    if (!acc[item.nomeMedico]) {
      acc[item.nomeMedico] = [];
    }
    acc[item.nomeMedico].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Médico</label>
            <Input
              type="text"
              placeholder="Nome do médico"
              value={filtroMedico}
              onChange={(e) => setFiltroMedico(e.target.value)}
              className="btn-touch"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as any)}
              className="btn-touch border border-input rounded-lg"
            >
              <option value="">Todos</option>
              <option value="aceitou">Aceitou</option>
              <option value="nao_aceitou">Não Aceitou</option>
              <option value="em_negociacao">Em Negociação</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Histórico Agrupado */}
      {Object.keys(agrupado).length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Nenhuma simulação encontrada</p>
        </Card>
      ) : (
        Object.entries(agrupado).map(([medico, simulacoes]: [string, any]) => (
          <Card key={medico} className="p-6">
            <h3 className="text-xl font-bold mb-4">{medico}</h3>
            <div className="space-y-3">
              {simulacoes.map((sim: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 bg-muted/50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Comodato
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sim.status === "aceitou"
                          ? "bg-green-100 text-green-700"
                          : sim.status === "nao_aceitou"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {sim.status === "aceitou"
                          ? "Aceitou"
                          : sim.status === "nao_aceitou"
                            ? "Não Aceitou"
                            : "Em Negociação"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sim.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(sim.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm font-medium mt-2">
                      {sim.pontosObtidos}/{sim.metaPontos} pontos • R$ {sim.valorTotal}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRecarregar?.(sim)}
                      className="btn-touch"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
