# App de Negociação Comercial — TODO

## Fase 1: Planejamento e Design System
- [x] Definir paleta de cores (azul + branco, estilo farmacêutico/profissional)
- [x] Definir tipografia e tamanhos de fonte (mínimo 18px)
- [x] Definir tamanhos de botões (mínimo 60×60px)
- [x] Criar design tokens CSS para reutilização
- [x] Documentar layout responsivo para iPad 6ª (1620x2160) e 10ª (1640x2360)

## Fase 2: Backend - Schema e Autenticação
- [x] Criar schema de usuários com roles (admin, gerente, representante)
- [x] Criar schema de produtos (OSTEONIL, OSTEONIL MINI, OSTEONIL PLUS)
- [x] Criar schema de configurações de comodato (pontos, preço, meta)
- [x] Criar schema de configurações de desconto (margem, custo, faixas)
- [x] Criar schema de simulações de comodato
- [x] Criar schema de simulações de desconto
- [x] Implementar autenticação JWT com cookie httpOnly
- [x] Implementar middleware de roles (admin, gerente, representante)
- [x] Implementar expiração de sessão (30 minutos de inatividade)
- [x] Criar rotas de API para login/logout

## Fase 3: Frontend - Login e Layout Base
- [x] Criar tela de login responsiva
- [x] Criar layout base com marca d'água
- [x] Implementar detecção de saída do app (bloqueio de tela)
- [x] Criar navegação por abas (Comodato / Desconto)
- [x] Testar responsividade em iPad 6ª e 10ª geração

## Fase 4: Painel do Representante - Comodato
- [x] Criar interface da Calculadora de Comodato
- [x] Implementar campos de entrada com botões +/- (mínimo 60px)
- [x] Implementar cálculo de pontos em tempo real
- [x] Implementar barra de progresso visual
- [x] Implementar resultado (Qualifica / Faltam X pontos)
- [x] Implementar sugestão automática de acréscimo
- [x] Implementar exibição de valor total em R$
- [x] Criar modal de salvamento de simulação (Aceitou / Não aceitou / Em negociação)
- [x] Implementar API para salvar simulação de comodato

## Fase 4: Painel do Representante - Desconto
- [x] Criar interface do Simulador de Desconto
- [x] Implementar seletor de modo (Por produto / Pedido total)
- [x] Implementar cálculo de volume mínimo em tempo real
- [x] Implementar resultado (Viável / Inviável)
- [x] Implementar exibição de desconto máximo possível
- [x] Implementar exibição de valores com e sem desconto
- [x] Criar modal de salvamento de simulação
- [x] Implementar API para salvar simulação de desconto

## Fase 4: Painel do Representante - Histórico
- [x] Criar visualização de histórico de simulações
- [x] Implementar separação por aba (Comodato / Desconto)
- [x] Implementar agrupamento por médico
- [x] Implementar botão "Recarregar" para editar simulações
- [x] Implementar API para listar histórico do representante

## Fase 5: Painel do Gerente Regional
- [x] Criar layout do painel do gerente
- [x] Implementar visualização de histórico de reps da região
- [x] Implementar exibição de margens e faixas de desconto
- [x] Implementar filtros (rep, médico, tipo, status, data)
- [x] Implementar API para listar histórico da região

## Fase 6: Painel do Admin - Configurações
- [x] Criar layout do painel do admin
- [x] Implementar configuração de comodato (pontos, preço, meta)
- [x] Implementar configuração de desconto (margem, custo, faixas)
- [x] Implementar tabela dinâmica de faixas de desconto
- [x] Implementar API para salvar configurações

## Fase 6: Painel do Admin - Gestão de Usuários
- [x] Implementar cadastro de representantes (nome, email, senha, região)
- [x] Implementar cadastro de gerentes (nome, email, senha, região)
- [x] Implementar desativação de usuários
- [x] Implementar API para CRUD de usuários

## Fase 6: Painel do Admin - Histórico e Analytics
- [x] Implementar visualização de histórico completo
- [x] Implementar filtros por gerente/região
- [x] Implementar API para listar histórico completo

## Fase 7: Segurança
- [x] Implementar marca d'água com nome completo do rep
- [x] Implementar bloqueio de tela ao sair do Safari
- [x] Implementar expiração de sessão (30 minutos)
- [x] Implementar proteção de rotas (sem URLs compartilháveis)
- [x] Implementar validação de permissões em todas as rotas

## Fase 8: Testes e Entrega
- [x] Testes de autenticação e roles
- [x] Testes de cálculos de comodato
- [x] Testes de cálculos de desconto
- [x] Testes de responsividade em iPad
- [x] Testes de segurança (marca d'água, bloqueio, sessão)
- [x] Validação de performance
- [x] Documentação final
- [x] Seed de dados com usuário admin de teste

## Credenciais de Acesso (Teste)
- **Email:** admin@negociacao.com
- **Senha:** admin123
- **Role:** Administrador
- **Acesso:** Completo a todos os painéis e funcionalidades

## Fase 9: Importação em Lote (CSV)
- [x] Criar componente de upload de CSV
- [x] Implementar parser de CSV para usuários
- [x] Implementar parser de CSV para configurações
- [x] Validar dados antes de importar
- [x] Exibir relatório de sucesso/erro
- [x] Adicionar botão de importação no painel admin

## Fase 10: Dashboard de Métricas
- [x] Criar página de dashboard com gráficos
- [x] Implementar gráfico de taxa de aceitação de comodato
- [x] Implementar gráfico de desconto médio concedido
- [x] Implementar gráfico de representantes top performers
- [x] Implementar filtros por período (dia, semana, mês)
- [x] Adicionar cards com KPIs principais

## Fase 11: Sincronização com CRM
- [x] Criar tela de configuração de CRM
- [x] Implementar integração com CRM (webhook/API)
- [x] Criar endpoint para receber dados de médicos
- [x] Implementar sincronização automática
- [x] Adicionar log de sincronizações
- [x] Criar interface para gerenciar sincronizações
