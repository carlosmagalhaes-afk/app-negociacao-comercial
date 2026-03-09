import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, Minus, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProdutoQuantidade {
  produtoId: number;
  nome: string;
  quantidade: number;
  pontos: number;
  precoVenda: number;
}

interface CalculadoraProps {
  onSave?: (simulacao: any) => void;
}

export function CalculadoraComodato({ onSave }: CalculadoraProps) {
  const [nomeMedico, setNomeMedico] = useState("");
  const [produtos, setProdutos] = useState<ProdutoQuantidade[]>([]);
  const [metaPontos, setMetaPontos] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [status, setStatus] = useState<"aceitou" | "nao_aceitou" | "em_negociacao">(
    "em_negociacao"
  );

  const configQuery = trpc.comodato.getConfig.useQuery();
  const saveMutation = trpc.comodato.saveSimulacao.useMutation({
    onSuccess: () => {
      setShowSaveModal(false);
      setNomeMedico("");
      setProdutos([]);
      onSave?.({});
    },
  });

  // Initialize produtos from config
  useEffect(() => {
    if (configQuery.data && produtos.length === 0) {
      const initialProdutos = configQuery.data.map((config) => ({
        produtoId: config.produtoId,
        nome: config.produto?.nome || `Produto ${config.produtoId}`,
        quantidade: 0,
        pontos: config.pontos,
        precoVenda: parseFloat(config.precoVenda as any),
      }));
      setProdutos(initialProdutos);
      setMetaPontos(configQuery.data[0]?.metaPontos || 100);
    }
  }, [configQuery.data]);

  const handleQuantidadeChange = (produtoId: number, delta: number) => {
    setProdutos((prev) =>
      prev.map((p) =>
        p.produtoId === produtoId
          ? { ...p, quantidade: Math.max(0, p.quantidade + delta) }
          : p
      )
    );
  };

  const pontosObtidos = produtos.reduce(
    (total, p) => total + p.quantidade * p.pontos,
    0
  );
  const valorTotal = produtos.reduce(
    (total, p) => total + p.quantidade * p.precoVenda,
    0
  );
  const qualifica = pontosObtidos >= metaPontos;
  const faltamPontos = Math.max(0, metaPontos - pontosObtidos);

  const sugestaoAcrescimo = faltamPontos > 0
    ? produtos
        .filter((p) => p.pontos > 0)
        .map((p) => ({
          nome: p.nome,
          quantidade: Math.ceil(faltamPontos / p.pontos),
          pontos: Math.ceil(faltamPontos / p.pontos) * p.pontos,
        }))
        .sort((a, b) => a.quantidade - b.quantidade)[0]
    : null;

  const handleSave = async () => {
    if (!nomeMedico.trim()) {
      alert("Por favor, insira o nome do médico");
      return;
    }

    const detalhes = JSON.stringify(
      produtos.map((p) => ({
        nome: p.nome,
        quantidade: p.quantidade,
        pontos: p.pontos,
        subtotal: p.quantidade * p.precoVenda,
      }))
    );

    saveMutation.mutate({
      nomeMedico,
      pontosObtidos,
      metaPontos,
      qualifica,
      valorTotal: valorTotal.toFixed(2),
      detalhes,
      status,
    });
  };

  return (
    <div className="space-y-6">
      {/* Nome do Médico */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">Nome do Médico</label>
        <Input
          type="text"
          placeholder="Digite o nome do médico"
          value={nomeMedico}
          onChange={(e) => setNomeMedico(e.target.value)}
          className="btn-touch"
        />
      </Card>

      {/* Produtos */}
      <div className="space-y-4">
        {produtos.map((produto) => (
          <Card key={produto.produtoId} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{produto.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {produto.pontos} pontos por unidade • R$ {produto.precoVenda.toFixed(2)} por unidade
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {produto.quantidade}
                  </p>
                  <p className="text-xs text-muted-foreground">unidades</p>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleQuantidadeChange(produto.produtoId, -1)}
                  disabled={produto.quantidade === 0}
                  className="btn-touch"
                >
                  <Minus className="w-5 h-5" />
                </Button>

                <div className="flex-1 text-center">
                  <p className="text-xl font-bold">{produto.quantidade}</p>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleQuantidadeChange(produto.produtoId, 1)}
                  className="btn-touch"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Subtotal */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Subtotal: R$ {(produto.quantidade * produto.precoVenda).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Pontos: {produto.quantidade * produto.pontos}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Resultado */}
      <Card className={`p-6 ${qualifica ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {qualifica ? "✅ Qualifica para Comodato!" : "❌ Faltam Pontos"}
            </h3>
            <p className={`text-lg font-semibold ${qualifica ? "text-green-700" : "text-red-700"}`}>
              {pontosObtidos} / {metaPontos} pontos
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={Math.min((pontosObtidos / metaPontos) * 100, 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground">
              {Math.round((pontosObtidos / metaPontos) * 100)}% da meta
            </p>
          </div>

          {/* Sugestão de Acréscimo */}
          {sugestaoAcrescimo && (
            <div className="p-4 bg-white rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Sugestão para atingir a meta:</p>
              <p className="text-sm text-muted-foreground">
                Adicionar {sugestaoAcrescimo.quantidade} unidade(s) de{" "}
                <span className="font-semibold">{sugestaoAcrescimo.nome}</span> ({sugestaoAcrescimo.pontos} pontos)
              </p>
            </div>
          )}

          {/* Valor Total */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Valor Total em R$:</p>
            <p className="text-3xl font-bold text-primary">
              R$ {valorTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <Button
        onClick={() => setShowSaveModal(true)}
        disabled={!nomeMedico.trim() || saveMutation.isPending}
        className="w-full btn-touch bg-primary hover:bg-primary/90"
      >
        <Save className="w-5 h-5 mr-2" />
        Salvar Simulação
      </Button>

      {/* Save Modal */}
      {showSaveModal && (
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-xl font-bold mb-4">Salvar Simulação</h3>
          <div className="space-y-4 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="aceitou"
                checked={status === "aceitou"}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-5 h-5"
              />
              <span>Médico aceitou</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="nao_aceitou"
                checked={status === "nao_aceitou"}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-5 h-5"
              />
              <span>Médico não aceitou</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="em_negociacao"
                checked={status === "em_negociacao"}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-5 h-5"
              />
              <span>Em negociação</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSaveModal(false)}
              className="flex-1 btn-touch"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex-1 btn-touch bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? "Salvando..." : "Confirmar"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
