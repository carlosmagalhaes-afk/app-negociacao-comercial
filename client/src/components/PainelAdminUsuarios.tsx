import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function PainelAdminUsuarios() {
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "representante" as "admin" | "gerente" | "representante",
    regiao: "",
  });

  const listQuery = trpc.admin.listUsers.useQuery();
  const createMutation = trpc.admin.createUser.useMutation({
    onSuccess: () => {
      setFormData({ name: "", email: "", password: "", role: "representante", regiao: "" });
      setShowForm(false);
      listQuery.refetch();
    },
  });
  const deleteMutation = trpc.admin.deactivateUser.useMutation({
    onSuccess: () => {
      listQuery.refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const usuarios = [
    ...(listQuery.data?.representantes || []),
    ...(listQuery.data?.gerentes || []),
    ...(listQuery.data?.admins || []),
  ];

  return (
    <div className="space-y-6">
      {/* Botão Novo Usuário */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="btn-touch bg-primary hover:bg-primary/90"
        >
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-xl font-bold mb-4">Cadastrar Novo Usuário</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nome</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="btn-touch"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="btn-touch"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Senha</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="btn-touch pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="btn-touch border border-input rounded-lg"
                >
                  <option value="representante">Representante</option>
                  <option value="gerente">Gerente Regional</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {(formData.role === "representante" || formData.role === "gerente") && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Região</label>
                  <Input
                    type="text"
                    value={formData.regiao}
                    onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                    placeholder="Ex: Sul, Sudeste"
                    className="btn-touch"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 btn-touch"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 btn-touch bg-primary hover:bg-primary/90"
              >
                {createMutation.isPending ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tabela de Usuários */}
      <Card className="p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">{usuarios.length} Usuários</h3>
        {usuarios.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum usuário cadastrado</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Nome</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Região</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-center py-3 px-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user: any) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : user.role === "gerente"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}>
                      {user.role === "admin"
                        ? "Admin"
                        : user.role === "gerente"
                          ? "Gerente"
                          : "Representante"}
                    </span>
                  </td>
                  <td className="py-3 px-4">{user.regiao || "—"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.ativo
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {user.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {user.ativo && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate({ userId: user.id })}
                        disabled={deleteMutation.isPending}
                        className="btn-touch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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
