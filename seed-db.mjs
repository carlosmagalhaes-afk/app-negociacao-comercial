import { drizzle } from "drizzle-orm/mysql2";
import { users, produtos, comodatoConfig, descontoConfig } from "./drizzle/schema.js";
import bcryptjs from "bcryptjs";
import mysql from "mysql2/promise";

const pool = mysql.createPool(process.env.DATABASE_URL);
const db = drizzle(pool);

async function seed() {
  try {
    console.log("🌱 Iniciando seed do banco de dados...");

    // Criar usuário admin
    const hashedPassword = await bcryptjs.hash("admin123", 10);
    
    await db.insert(users).values({
      name: "Administrador",
      email: "admin@negociacao.com",
      password: hashedPassword,
      role: "admin",
      regiao: null,
      ativo: true,
    }).onDuplicateKeyUpdate({ set: { email: "admin@negociacao.com" } });

    console.log("✅ Usuário admin criado: admin@negociacao.com / admin123");

    // Criar produtos
    await db.insert(produtos).values({
      nome: "OSTEONIL",
      descricao: "Máquina de ultrassom padrão",
      ativo: true,
    }).onDuplicateKeyUpdate({ set: { nome: "OSTEONIL" } });

    await db.insert(produtos).values({
      nome: "OSTEONIL MINI",
      descricao: "Máquina de ultrassom portátil",
      ativo: true,
    }).onDuplicateKeyUpdate({ set: { nome: "OSTEONIL MINI" } });

    await db.insert(produtos).values({
      nome: "OSTEONIL PLUS",
      descricao: "Máquina de ultrassom premium",
      ativo: true,
    }).onDuplicateKeyUpdate({ set: { nome: "OSTEONIL PLUS" } });

    console.log("✅ Produtos criados");

    // Criar configurações de comodato
    await db.insert(comodatoConfig).values({
      produtoId: 1,
      pontos: 10,
      precoVenda: "15000.00",
      metaPontos: 100,
    }).onDuplicateKeyUpdate({ set: { pontos: 10 } });

    await db.insert(comodatoConfig).values({
      produtoId: 2,
      pontos: 8,
      precoVenda: "10000.00",
      metaPontos: 80,
    }).onDuplicateKeyUpdate({ set: { pontos: 8 } });

    await db.insert(comodatoConfig).values({
      produtoId: 3,
      pontos: 12,
      precoVenda: "20000.00",
      metaPontos: 120,
    }).onDuplicateKeyUpdate({ set: { pontos: 12 } });

    console.log("✅ Configurações de comodato criadas");

    // Criar configurações de desconto
    await db.insert(descontoConfig).values({
      produtoId: 1,
      margemMinima: "15.00",
      precoCusto: "8000.00",
    }).onDuplicateKeyUpdate({ set: { margemMinima: "15.00" } });

    await db.insert(descontoConfig).values({
      produtoId: 2,
      margemMinima: "12.00",
      precoCusto: "5500.00",
    }).onDuplicateKeyUpdate({ set: { margemMinima: "12.00" } });

    await db.insert(descontoConfig).values({
      produtoId: 3,
      margemMinima: "18.00",
      precoCusto: "11000.00",
    }).onDuplicateKeyUpdate({ set: { margemMinima: "18.00" } });

    console.log("✅ Configurações de desconto criadas");

    console.log("\n🎉 Seed concluído com sucesso!");
    console.log("\nCredenciais de teste:");
    console.log("Email: admin@negociacao.com");
    console.log("Senha: admin123");
    console.log("Role: Administrador");

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    await pool.end();
    process.exit(1);
  }
}

seed();
