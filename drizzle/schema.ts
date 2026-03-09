import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table with extended fields for role-based access control.
 * Supports three roles: admin, gerente (regional manager), representante (sales rep)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"), // For non-OAuth login
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "gerente", "representante"]).default("representante").notNull(),
  regiao: varchar("regiao", { length: 255 }), // Region for gerente and representante
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products: OSTEONIL, OSTEONIL MINI, OSTEONIL PLUS
 */
export const produtos = mysqlTable("produtos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull().unique(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Produto = typeof produtos.$inferSelect;
export type InsertProduto = typeof produtos.$inferInsert;

/**
 * Comodato configuration: points per product, sale price, minimum points target
 */
export const configComodato = mysqlTable("config_comodato", {
  id: int("id").autoincrement().primaryKey(),
  produtoId: int("produtoId").notNull(),
  pontos: int("pontos").notNull(), // Points per unit
  precoVenda: decimal("precoVenda", { precision: 10, scale: 2 }).notNull(), // Sale price in R$
  metaPontos: int("metaPontos").notNull(), // Minimum points target for comodato
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfigComodato = typeof configComodato.$inferSelect;
export type InsertConfigComodato = typeof configComodato.$inferInsert;

/**
 * Discount configuration: minimum margin, cost price, discount tiers
 */
export const configDesconto = mysqlTable("config_desconto", {
  id: int("id").autoincrement().primaryKey(),
  produtoId: int("produtoId").notNull(),
  margemMinima: decimal("margemMinima", { precision: 5, scale: 2 }).notNull(), // Minimum margin %
  precoCusto: decimal("precoCusto", { precision: 10, scale: 2 }).notNull(), // Cost price in R$
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfigDesconto = typeof configDesconto.$inferSelect;
export type InsertConfigDesconto = typeof configDesconto.$inferInsert;

/**
 * Discount tiers: quantity ranges and max discount allowed per product
 */
export const faixasDesconto = mysqlTable("faixas_desconto", {
  id: int("id").autoincrement().primaryKey(),
  produtoId: int("produtoId").notNull(),
  quantidadeMinima: int("quantidadeMinima").notNull(),
  descontoMaximo: decimal("descontoMaximo", { precision: 5, scale: 2 }).notNull(), // Max discount %
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaixaDesconto = typeof faixasDesconto.$inferSelect;
export type InsertFaixaDesconto = typeof faixasDesconto.$inferInsert;

/**
 * Comodato simulations: saved calculations by representatives
 */
export const simulacoesComodato = mysqlTable("simulacoes_comodato", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  nomeMedico: varchar("nomeMedico", { length: 255 }).notNull(),
  pontosObtidos: int("pontosObtidos").notNull(),
  metaPontos: int("metaPontos").notNull(),
  qualifica: boolean("qualifica").notNull(),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }).notNull(),
  detalhes: text("detalhes"), // JSON with product breakdown
  status: mysqlEnum("status", ["aceitou", "nao_aceitou", "em_negociacao"]).default("em_negociacao").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SimulacaoComodato = typeof simulacoesComodato.$inferSelect;
export type InsertSimulacaoComodato = typeof simulacoesComodato.$inferInsert;

/**
 * Discount simulations: saved calculations by representatives
 */
export const simulacoesDesconto = mysqlTable("simulacoes_desconto", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  nomeMedico: varchar("nomeMedico", { length: 255 }).notNull(),
  modo: mysqlEnum("modo", ["por_produto", "pedido_total"]).notNull(),
  descontoSolicitado: decimal("descontoSolicitado", { precision: 5, scale: 2 }).notNull(),
  viavel: boolean("viavel").notNull(),
  descontoMaximoPossivel: decimal("descontoMaximoPossivel", { precision: 5, scale: 2 }),
  valorSemDesconto: decimal("valorSemDesconto", { precision: 10, scale: 2 }).notNull(),
  valorComDesconto: decimal("valorComDesconto", { precision: 10, scale: 2 }).notNull(),
  detalhes: text("detalhes"), // JSON with product breakdown and quantities
  status: mysqlEnum("status", ["aceitou", "nao_aceitou", "em_negociacao"]).default("em_negociacao").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SimulacaoDesconto = typeof simulacoesDesconto.$inferSelect;
export type InsertSimulacaoDesconto = typeof simulacoesDesconto.$inferInsert;

/**
 * Session tracking for activity-based expiration
 */
export const sessoes = mysqlTable("sessoes", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull(),
  token: varchar("token", { length: 512 }).notNull().unique(),
  ultimaAtividade: timestamp("ultimaAtividade").defaultNow().notNull(),
  expiradoEm: timestamp("expiradoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sessao = typeof sessoes.$inferSelect;
export type InsertSessao = typeof sessoes.$inferInsert;