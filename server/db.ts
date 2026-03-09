import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  configComodato,
  configDesconto,
  faixasDesconto,
  produtos,
  simulacoesComodato,
  simulacoesDesconto,
  sessoes,
  InsertSimulacaoComodato,
  InsertSimulacaoDesconto,
  InsertConfigComodato,
  InsertConfigDesconto,
  InsertFaixaDesconto,
  InsertSessao,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Comodato and Discount configuration queries
 */
export async function getConfigComodato() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(configComodato);
}

export async function getConfigDesconto() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(configDesconto);
}

export async function getFaixasDesconto() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(faixasDesconto);
}

export async function getProdutos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(produtos).where(eq(produtos.ativo, true));
}

/**
 * Simulation queries for representante
 */
export async function saveSimulacaoComodato(data: InsertSimulacaoComodato) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(simulacoesComodato).values(data);
  return result;
}

export async function saveSimulacaoDesconto(data: InsertSimulacaoDesconto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(simulacoesDesconto).values(data);
  return result;
}

export async function getSimulacoesComodatoByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulacoesComodato).where(eq(simulacoesComodato.usuarioId, usuarioId));
}

export async function getSimulacoesDescontoByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulacoesDesconto).where(eq(simulacoesDesconto.usuarioId, usuarioId));
}

/**
 * Queries for gerente (regional manager)
 */
export async function getSimulacoesComodatoByRegiao(regiao: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(simulacoesComodato)
    .innerJoin(users, eq(simulacoesComodato.usuarioId, users.id))
    .where(eq(users.regiao, regiao));
}

export async function getSimulacoesDescontoByRegiao(regiao: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(simulacoesDesconto)
    .innerJoin(users, eq(simulacoesDesconto.usuarioId, users.id))
    .where(eq(users.regiao, regiao));
}

/**
 * User management for admin
 */
export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(users).values(data);
}

export async function getUsersByRole(role: "admin" | "gerente" | "representante") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.role, role));
}

export async function deactivateUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ ativo: false }).where(eq(users.id, userId));
}

export async function updateUser(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set(data).where(eq(users.id, userId));
}

/**
 * Configuration management for admin
 */
export async function updateConfigComodato(id: number, data: Partial<InsertConfigComodato>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(configComodato).set(data).where(eq(configComodato.id, id));
}

export async function updateConfigDesconto(id: number, data: Partial<InsertConfigDesconto>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(configDesconto).set(data).where(eq(configDesconto.id, id));
}

export async function addFaixaDesconto(data: InsertFaixaDesconto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(faixasDesconto).values(data);
}

export async function deleteFaixaDesconto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(faixasDesconto).where(eq(faixasDesconto.id, id));
}

/**
 * Session management
 */
export async function createSessao(data: InsertSessao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sessoes).values(data);
}

export async function getSessaoByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sessoes).where(eq(sessoes.token, token));
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSessaoAtividade(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sessoes).set({ ultimaAtividade: new Date() }).where(eq(sessoes.token, token));
}

export async function deleteSessao(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(sessoes).where(eq(sessoes.token, token));
}
