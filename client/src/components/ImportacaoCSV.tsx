import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ImportResult {
  sucesso: number;
  erros: number;
  mensagens: string[];
}

export function ImportacaoCSV() {
  const [tipoImportacao, setTipoImportacao] = useState<"usuarios" | "configuracoes">("usuarios");
  const [resultado, setResultado] = useState<ImportResult | null>(null);
  const [carregando, setCarregando] = useState(false);

  const importarMutation = trpc.admin.importarCSV.useMutation({
    onSuccess: (data: any) => {
      setResultado(data);
      setCarregando(false);
    },
    onError: (error: any) => {
      setResultado({
        sucesso: 0,
        erros: 1,
        mensagens: [error.message || "Erro ao importar arquivo"],
      });
      setCarregando(false);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    setResultado(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const conteudo = e.target?.result as string;
      const linhas = conteudo.split("\n").filter((l) => l.trim());
      const cabecalho = linhas[0]?.split(",").map((h) => h.trim()) || [];
      const dados = linhas.slice(1).map((linha) => {
        const valores = linha.split(",").map((v) => v.trim());
        const obj: Record<string, string> = {};
        cabecalho.forEach((col, idx) => {
          obj[col] = valores[idx] || "";
        });
        return obj;
      });

      importarMutation.mutate({
        tipo: tipoImportacao,
        dados,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Seletor de Tipo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tipo de Importação</h3>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="usuarios"
              checked={tipoImportacao === "usuarios"}
              onChange={(e) => setTipoImportacao(e.target.value as any)}
              className="w-4 h-4"
            />
            <span>Usuários (Representantes/Gerentes)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="configuracoes"
              checked={tipoImportacao === "configuracoes"}
              onChange={(e) => setTipoImportacao(e.target.value as any)}
              className="w-4 h-4"
            />
            <span>Configurações (Comodato/Desconto)</span>
          </label>
        </div>
      </Card>

      {/* Upload */}
      <Card className="p-6 border-2 border-dashed border-primary">
        <div className="text-center space-y-4">
          <Upload className="w-12 h-12 mx-auto text-primary" />
          <div>
            <p className="font-semibold mb-2">Selecione um arquivo CSV</p>
            <p className="text-sm text-muted-foreground mb-4">
              {tipoImportacao === "usuarios"
                ? "Formato: nome, email, role (admin/gerente/representante), regiao"
                : "Formato: produtoId, pontos, precoVenda, metaPontos (comodato) ou margemMinima, precoCusto (desconto)"}
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={carregando}
                className="hidden"
              />
              <Button
                className="btn-touch bg-primary hover:bg-primary/90"
                disabled={carregando}
              >
                {carregando ? "Importando..." : "Escolher Arquivo"}
              </Button>
            </label>
          </div>
        </div>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card
          className={`p-6 ${
            resultado.erros === 0
              ? "bg-green-50 border-green-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {resultado.erros === 0 ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold mb-2">
                {resultado.erros === 0 ? "Importação Concluída" : "Importação com Avisos"}
              </h4>
              <p className="text-sm mb-3">
                ✅ {resultado.sucesso} registros importados com sucesso
                {resultado.erros > 0 && ` • ⚠️ ${resultado.erros} erros encontrados`}
              </p>
              {resultado.mensagens.length > 0 && (
                <div className="bg-white rounded p-3 text-sm space-y-1">
                  {resultado.mensagens.map((msg, idx) => (
                    <p key={idx} className="text-muted-foreground">
                      {msg}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Template de Download */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm font-medium mb-3">📋 Templates Disponíveis:</p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv =
                "nome,email,role,regiao\nJoão Silva,joao@empresa.com,representante,Sul\nMaria Santos,maria@empresa.com,gerente,Norte";
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "template-usuarios.csv";
              a.click();
            }}
            className="btn-touch"
          >
            Template Usuários
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const csv =
                "produtoId,pontos,precoVenda,metaPontos\n1,10,500.00,100\n2,5,250.00,100";
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "template-comodato.csv";
              a.click();
            }}
            className="btn-touch"
          >
            Template Comodato
          </Button>
        </div>
      </Card>
    </div>
  );
}
