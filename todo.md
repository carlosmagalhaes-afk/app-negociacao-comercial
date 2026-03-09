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
- [ ] Implementar detecção de saída do app (bloqueio de tela)
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
- [ ] Criar visualização de histórico de simulações
- [ ] Implementar separação por aba (Comodato / Desconto)
- [ ] Implementar agrupamento por médico
- [ ] Implementar botão "Recarregar" para editar simulações
- [ ] Implementar API para listar histórico do representante

## Fase 5: Painel do Gerente Regional
- [ ] Criar layout do painel do gerente
- [ ] Implementar visualização de histórico de reps da região
- [ ] Implementar exibição de margens e faixas de desconto
- [ ] Implementar filtros (rep, médico, tipo, status, data)
- [ ] Implementar API para listar histórico da região

## Fase 6: Painel do Admin - Configurações
- [ ] Criar layout do painel do admin
- [ ] Implementar configuração de comodato (pontos, preço, meta)
- [ ] Implementar configuração de desconto (margem, custo, faixas)
- [ ] Implementar tabela dinâmica de faixas de desconto
- [ ] Implementar API para salvar configurações

## Fase 6: Painel do Admin - Gestão de Usuários
- [ ] Implementar cadastro de representantes (nome, email, senha, região)
- [ ] Implementar cadastro de gerentes (nome, email, senha, região)
- [ ] Implementar desativação de usuários
- [ ] Implementar API para CRUD de usuários

## Fase 6: Painel do Admin - Histórico e Analytics
- [ ] Implementar visualização de histórico completo
- [ ] Implementar filtros por gerente/região
- [ ] Implementar API para listar histórico completo

## Fase 7: Segurança
- [ ] Implementar marca d'água com nome completo do rep
- [ ] Implementar bloqueio de tela ao sair do Safari
- [ ] Implementar expiração de sessão (30 minutos)
- [ ] Implementar proteção de rotas (sem URLs compartilháveis)
- [ ] Implementar validação de permissões em todas as rotas

## Fase 8: Testes e Entrega
- [ ] Testes de autenticação e roles
- [ ] Testes de cálculos de comodato
- [ ] Testes de cálculos de desconto
- [ ] Testes de responsividade em iPad
- [ ] Testes de segurança (marca d'água, bloqueio, sessão)
- [ ] Validação de performance
- [ ] Documentação final
