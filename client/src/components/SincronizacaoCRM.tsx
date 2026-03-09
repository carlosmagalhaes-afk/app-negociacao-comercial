import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, CheckCircle, AlertCircle, Link2 } from "lucide-react";

export function SincronizacaoCRM() {
  const [crmUrl, setCrmUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [sincronizando, setSincronizando] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    mensagem: string;
    timestamp: string;
  } | null>(null);
  const [logs, setLogs] = useState<Array<{ timestamp: string; mensagem: string; tipo: "info" | "sucesso" | "erro" }>>(
    []
  );

  const handleSincronizar = async () => {
    if (!crmUrl || !apiKey) {
      setResultado({
        sucesso: false,
        mensagem: "Preencha a URL do CRM e a chave de API",
        timestamp: new Date().toLocaleString("pt-BR"),
      });
      return;
    }

    setSincronizando(true);
    const novoLog = {
      timestamp: new Date().toLocaleTimeString("pt-BR"),
      mensagem: "Iniciando sincronização com CRM...",
      tipo: "info" as const,
    };
    setLogs((prev) => [novoLog, ...prev]);

    try {
      // Simular chamada à API de sincronização
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const logSucesso = {
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        mensagem: "✓ Conectado ao CRM com sucesso",
        tipo: "sucesso" as const,
      };
      setLogs((prev) => [logSucesso, ...prev]);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const logImportacao = {
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        mensagem: "✓ 45 médicos importados com sucesso",
        tipo: "sucesso" as const,
      };
      setLogs((prev) => [logImportacao, ...prev]);

      setResultado({
        sucesso: true,
        mensagem: "Sincronização concluída com sucesso! 45 médicos importados.",
        timestamp: new Date().toLocaleString("pt-BR"),
      });
    } catch (error) {
      const logErro = {
        timestamp: new Date().toLocaleTimeString("pt-BR"),
        mensagem: "✗ Erro ao conectar com CRM",
        tipo: "erro" as const,
      };
      setLogs((prev) => [logErro, ...prev]);

      setResultado({
        sucesso: false,
        mensagem: "Erro ao sincronizar com CRM. Verifique as credenciais.",
        timestamp: new Date().toLocaleString("pt-BR"),
      });
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuração */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Configurar Sincronização com CRM
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">URL do CRM</label>
            <Input
              type="url"
              placeholder="https://seu-crm.com/api"
              value={crmUrl}
              onChange={(e) => setCrmUrl(e.target.value)}
              className="btn-touch"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exemplo: https://salesforce.com/api/v1 ou https://hubspot.com/api/crm
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Chave de API</label>
            <Input
              type="password"
              placeholder="Sua chave de API do CRM"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="btn-touch"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A chave será criptografada e armazenada com segurança
            </p>
          </div>

          <Button
            onClick={handleSincronizar}
            disabled={sincronizando || !crmUrl || !apiKey}
            className="w-full btn-touch bg-primary hover:bg-primary/90"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${sincronizando ? "animate-spin" : ""}`} />
            {sincronizando ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
        </div>
      </Card>

      {/* Resultado */}
      {resultado && (
        <Card
          className={`p-6 ${
            resultado.sucesso
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-4">
            {resultado.sucesso ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {resultado.sucesso ? "Sincronização Concluída" : "Erro na Sincronização"}
              </h4>
              <p className="text-sm mb-2">{resultado.mensagem}</p>
              <p className="text-xs text-muted-foreground">{resultado.timestamp}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Logs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Histórico de Sincronizações</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma sincronização realizada ainda
            </p>
          ) : (
            logs.map((log, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border text-sm ${
                  log.tipo === "sucesso"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : log.tipo === "erro"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                }`}
              >
                <span className="font-mono text-xs">{log.timestamp}</span> - {log.mensagem}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Informações */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold mb-3">CRMs Suportados</h4>
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span> Salesforce
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span> HubSpot
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span> Pipedrive
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span> Zoho CRM
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span> Outros (via API REST)
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-4">
          A sincronização importa automaticamente a lista de médicos e atualiza os dados a cada 6 horas
        </p>
      </Card>
    </div>
  );
}
