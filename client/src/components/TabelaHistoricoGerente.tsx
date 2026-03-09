import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function TabelaHistoricoGerente() {
  const [filtroRep, setFiltroRep] = useState("");
  const [filtroMedico, setFiltroMedico] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"" | "comodato" | "desconto">("");
  const [filtroStatus, setFiltroStatus] = useState<"" | "aceitou" | "nao_aceitou" | "em_negociacao">("");

  const historicoQuery = trpc.gerente.getHistoricoRegiao.useQuery();

  const comodato = historicoQuery.data?.comodato || [];
  const desconto = historicoQuery.data?.desconto || [];

  // Combinar e filtrar dados
  const dadosCombinados = [
    ...comodato.map((item: any) => ({
      ...item.simulacoes_comodato,
      tipo: "comodato",
      usuario: item.users,
    })),
    ...desconto.map((item: any) => ({
      ...item.simulacoes_desconto,
      tipo: "desconto",
      usuario: item.users,
    })),
  ].filter((item) => {
    if (filtroRep && !item.usuario?.name?.toLowerCase().includes(filtroRep.toLowerCase())) return false;
    if (filtroMedico && !item.nomeMedico?.toLowerCase().includes(filtroMedico.toLowerCase())) return false;
    if (filtroTipo && item.tipo !== filtroTipo) return false;
    if (filtroStatus && item.status !== filtroStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Representante</label>
            <Input
              type="text"
              placeholder="Nome do rep"
              value={filtroRep}
              onChange={(e) => setFiltroRep(e.target.value)}
              className="btn-touch"
            />
          </div>
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
            <label className="text-sm font-medium mb-2 block">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="btn-touch border border-input rounded-lg"
            >
              <option value="">Todos</option>
              <option value="comodato">Comodato</option>
              <option value="desconto">Desconto</option>
            </select>
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

      {/* Tabela */}
      <Card className="p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">
          {dadosCombinados.length} Negociações
        </h3>
        {dadosCombinados.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">Nenhuma negociação encontrada</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Representante</th>
                <th className="text-left py-3 px-4 font-semibold">Médico</th>
                <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold">Valor</th>
                <th className="text-center py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {dadosCombinados.map((item: any, idx: number) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">{item.usuario?.name || "—"}</td>
                  <td className="py-3 px-4">{item.nomeMedico}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.tipo === "comodato"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {item.tipo === "comodato" ? "Comodato" : "Desconto"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    R$ {item.tipo === "comodato" ? item.valorTotal : item.valorComDesconto}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "aceitou"
                        ? "bg-green-100 text-green-700"
                        : item.status === "nao_aceitou"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {item.status === "aceitou"
                        ? "Aceitou"
                        : item.status === "nao_aceitou"
                          ? "Não Aceitou"
                          : "Em Negociação"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
