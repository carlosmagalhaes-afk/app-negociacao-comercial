import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function PainelAdminConfiguracoes() {
  const [activeTab, setActiveTab] = useState<"comodato" | "desconto">("comodato");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Comodato
  const [comodatoData, setComodatoData] = useState({
    pontos: 0,
    precoVenda: "",
    metaPontos: 0,
  });

  // Desconto
  const [descontoData, setDescontoData] = useState({
    margemMinima: "",
    precoCusto: "",
  });

  const [faixas, setFaixas] = useState<Array<{ quantidadeMinima: number; descontoMaximo: string }>>([
    { quantidadeMinima: 0, descontoMaximo: "" },
  ]);

  const comodatoQuery = trpc.comodato.getConfig.useQuery();
  const descontoQuery = trpc.desconto.getConfig.useQuery();

  const updateComodatoMutation = trpc.admin.updateConfigComodato.useMutation({
    onSuccess: () => {
      setEditingId(null);
      comodatoQuery.refetch();
    },
  });

  const updateDescontoMutation = trpc.admin.updateConfigDesconto.useMutation({
    onSuccess: () => {
      setEditingId(null);
      descontoQuery.refetch();
    },
  });

  const addFaixaMutation = trpc.admin.addFaixaDesconto.useMutation({
    onSuccess: () => {
      setFaixas([{ quantidadeMinima: 0, descontoMaximo: "" }]);
      descontoQuery.refetch();
    },
  });

  const deleteFaixaMutation = trpc.admin.deleteFaixaDesconto.useMutation({
    onSuccess: () => {
      descontoQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab("comodato")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "comodato"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Configuração de Comodato
        </button>
        <button
          onClick={() => setActiveTab("desconto")}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "desconto"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground"
          }`}
        >
          Configuração de Desconto
        </button>
      </div>

      {/* Comodato */}
      {activeTab === "comodato" && (
        <div className="space-y-4">
          {comodatoQuery.data?.map((config: any) => (
            <Card key={config.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{config.produto?.nome}</h3>
                {editingId !== config.id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(config.id);
                      setComodatoData({
                        pontos: config.pontos,
                        precoVenda: config.precoVenda,
                        metaPontos: config.metaPontos,
                      });
                    }}
                    className="btn-touch"
                  >
                    Editar
                  </Button>
                )}
              </div>

              {editingId === config.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Pontos por Unidade</label>
                      <Input
                        type="number"
                        value={comodatoData.pontos}
                        onChange={(e) =>
                          setComodatoData({ ...comodatoData, pontos: parseInt(e.target.value) || 0 })
                        }
                        className="btn-touch"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Preço de Venda (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={comodatoData.precoVenda}
                        onChange={(e) =>
                          setComodatoData({ ...comodatoData, precoVenda: e.target.value })
                        }
                        className="btn-touch"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Meta de Pontos</label>
                      <Input
                        type="number"
                        value={comodatoData.metaPontos}
                        onChange={(e) =>
                          setComodatoData({ ...comodatoData, metaPontos: parseInt(e.target.value) || 0 })
                        }
                        className="btn-touch"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="flex-1 btn-touch"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() =>
                        updateComodatoMutation.mutate({
                          id: config.id,
                          pontos: comodatoData.pontos,
                          precoVenda: comodatoData.precoVenda,
                          metaPontos: comodatoData.metaPontos,
                        })
                      }
                      disabled={updateComodatoMutation.isPending}
                      className="flex-1 btn-touch bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pontos por Unidade</p>
                    <p className="text-2xl font-bold text-primary">{config.pontos}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Preço de Venda</p>
                    <p className="text-2xl font-bold">R$ {parseFloat(config.precoVenda).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meta de Pontos</p>
                    <p className="text-2xl font-bold text-primary">{config.metaPontos}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Desconto */}
      {activeTab === "desconto" && (
        <div className="space-y-4">
          {descontoQuery.data?.map((config: any) => (
            <Card key={config.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{config.produto?.nome}</h3>
                {editingId !== config.id && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingId(config.id);
                      setDescontoData({
                        margemMinima: config.margemMinima,
                        precoCusto: config.precoCusto,
                      });
                    }}
                    className="btn-touch"
                  >
                    Editar
                  </Button>
                )}
              </div>

              {editingId === config.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Margem Mínima (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={descontoData.margemMinima}
                        onChange={(e) =>
                          setDescontoData({ ...descontoData, margemMinima: e.target.value })
                        }
                        className="btn-touch"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Preço de Custo (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={descontoData.precoCusto}
                        onChange={(e) =>
                          setDescontoData({ ...descontoData, precoCusto: e.target.value })
                        }
                        className="btn-touch"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="flex-1 btn-touch"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() =>
                        updateDescontoMutation.mutate({
                          id: config.id,
                          margemMinima: descontoData.margemMinima,
                          precoCusto: descontoData.precoCusto,
                        })
                      }
                      disabled={updateDescontoMutation.isPending}
                      className="flex-1 btn-touch bg-primary hover:bg-primary/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Margem Mínima</p>
                      <p className="text-2xl font-bold text-primary">
                        {parseFloat(config.margemMinima).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Preço de Custo</p>
                      <p className="text-2xl font-bold">R$ {parseFloat(config.precoCusto).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Faixas de Desconto */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">Faixas de Desconto</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFaixas([{ quantidadeMinima: 0, descontoMaximo: "" }]);
                        }}
                        className="btn-touch"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Adicionar
                      </Button>
                    </div>

                    {config.faixas?.map((faixa: any) => (
                      <div key={faixa.id} className="flex items-center gap-3 mb-2 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm">
                          A partir de {faixa.quantidadeMinima} unidades: até{" "}
                          {parseFloat(faixa.descontoMaximo).toFixed(2)}% desconto
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFaixaMutation.mutate({ id: faixa.id })}
                          disabled={deleteFaixaMutation.isPending}
                          className="ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
