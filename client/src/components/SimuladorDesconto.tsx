import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Save } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ProdutoDesconto {
  produtoId: number;
  nome: string;
  quantidade: number;
  precoCusto: number;
  precoVenda: number;
  margemMinima: number;
}

interface CalculadoraProps {
  onSave?: (simulacao: any) => void;
}

export function SimuladorDesconto({ onSave }: CalculadoraProps) {
  const [nomeMedico, setNomeMedico] = useState("");
  const [modo, setModo] = useState<"por_produto" | "pedido_total">("pedido_total");
  const [descontoSolicitado, setDescontoSolicitado] = useState(0);
  const [produtos, setProdutos] = useState<ProdutoDesconto[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [status, setStatus] = useState<"aceitou" | "nao_aceitou" | "em_negociacao">(
    "em_negociacao"
  );

  const configQuery = trpc.desconto.getConfig.useQuery();
  const saveMutation = trpc.desconto.saveSimulacao.useMutation({
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
      const initialProdutos = configQuery.data.map((config) => {
        // Get price from comodato config if available
        const precoVenda = (config as any).precoVenda
          ? parseFloat((config as any).precoVenda as any)
          : 0;
        return {
          produtoId: config.produtoId,
          nome: config.produto?.nome || `Produto ${config.produtoId}`,
          quantidade: 0,
          precoCusto: parseFloat(config.precoCusto as any),
          precoVenda,
          margemMinima: parseFloat(config.margemMinima as any),
        };
      });
      setProdutos(initialProdutos);
    }
  }, [configQuery.data]);

  const handleQuantidadeChange = (produtoId: number, value: string) => {
    const quantidade = parseInt(value) || 0;
    setProdutos((prev) =>
      prev.map((p) =>
        p.produtoId === produtoId
          ? { ...p, quantidade: Math.max(0, quantidade) }
          : p
      )
    );
  };

  const valorSemDesconto = produtos.reduce(
    (total, p) => total + p.quantidade * p.precoVenda,
    0
  );
  const valorComDesconto = valorSemDesconto * (1 - descontoSolicitado / 100);
  const descontoAplicado = valorSemDesconto - valorComDesconto;

  // Calcular viabilidade do desconto
  const viavel = produtos.every((p) => {
    if (p.quantidade === 0 || p.precoVenda === 0) return true;
    const precoComDesconto = p.precoVenda * (1 - descontoSolicitado / 100);
    const margemAtual = ((precoComDesconto - p.precoCusto) / precoComDesconto) * 100;
    return margemAtual >= p.margemMinima;
  });

  // Calcular desconto máximo possível
  const produtosComPreco = produtos.filter((p) => p.quantidade > 0 && p.precoVenda > 0);
  const descontoMaximoPossivel = produtosComPreco.length > 0
    ? Math.min(
        ...produtosComPreco.map((p) => {
          const precoMinimo = p.precoCusto / (1 - p.margemMinima / 100);
          return ((p.precoVenda - precoMinimo) / p.precoVenda) * 100;
        })
      )
    : 0;

  const handleSave = async () => {
    if (!nomeMedico.trim()) {
      alert("Por favor, insira o nome do médico");
      return;
    }

    const detalhes = JSON.stringify(
      produtos.map((p) => ({
        nome: p.nome,
        quantidade: p.quantidade,
        precoUnitario: p.precoVenda,
        subtotalSemDesconto: p.quantidade * p.precoVenda,
        subtotalComDesconto: p.quantidade * p.precoVenda * (1 - descontoSolicitado / 100),
      }))
    );

    saveMutation.mutate({
      nomeMedico,
      descontoSolicitado: Number(descontoSolicitado),
      viavel,
      valorComDesconto: valorComDesconto.toFixed(2),
      valorSemDesconto: valorSemDesconto.toFixed(2),
      modo,
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

      {/* Modo de Desconto */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-4">Modo de Desconto</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="pedido_total"
              checked={modo === "pedido_total"}
              onChange={(e) => setModo(e.target.value as any)}
              className="w-5 h-5"
            />
            <span>Desconto no pedido total</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              value="por_produto"
              checked={modo === "por_produto"}
              onChange={(e) => setModo(e.target.value as any)}
              className="w-5 h-5"
            />
            <span>Desconto por produto</span>
          </label>
        </div>
      </Card>

      {/* Desconto Solicitado */}
      <Card className="p-6">
        <label className="block text-sm font-medium mb-2">
          Desconto Solicitado (%)
        </label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={descontoSolicitado}
            onChange={(e) => setDescontoSolicitado(parseFloat(e.target.value) || 0)}
            className="btn-touch"
          />
          <span className="text-2xl font-bold text-primary">{descontoSolicitado.toFixed(2)}%</span>
        </div>
      </Card>

      {/* Produtos */}
      <div className="space-y-4">
        {produtos.map((produto) => (
          <Card key={produto.produtoId} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{produto.nome}</h3>
              <p className="text-sm text-muted-foreground">
                Custo: R$ {produto.precoCusto.toFixed(2)} • Margem mín: {produto.margemMinima.toFixed(2)}%
              </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Quantidade</label>
                <Input
                  type="number"
                  min="0"
                  value={produto.quantidade}
                  onChange={(e) => handleQuantidadeChange(produto.produtoId, e.target.value)}
                  className="btn-touch"
                />
              </div>

              {produto.quantidade > 0 && (
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sem desconto:</span>
                    <span>R$ {(produto.quantidade * produto.precoVenda).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Com {descontoSolicitado.toFixed(2)}% desconto:</span>
                    <span className="font-semibold">
                      R$ {(produto.quantidade * produto.precoVenda * (1 - descontoSolicitado / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Resultado */}
      <Card
        className={`p-6 ${
          viavel ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {viavel ? "✅ Desconto Viável" : "❌ Desconto Inviável"}
            </h3>
            <p className={`text-lg font-semibold ${viavel ? "text-green-700" : "text-red-700"}`}>
              {descontoSolicitado.toFixed(2)}% de desconto
            </p>
          </div>

          {!viavel && (
            <div className="p-4 bg-white rounded-lg border border-border">
              <p className="text-sm font-medium mb-2">Desconto máximo possível:</p>
              <p className="text-lg font-bold text-primary">
                {descontoMaximoPossivel.toFixed(2)}%
              </p>
            </div>
          )}

          {/* Valores */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Valor sem desconto:</span>
              <span className="text-lg">R$ {valorSemDesconto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Desconto:</span>
              <span className="text-lg font-semibold text-red-600">
                -R$ {descontoAplicado.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-border pt-3">
              <span className="font-semibold">Valor com desconto:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {valorComDesconto.toFixed(2)}
              </span>
            </div>
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
