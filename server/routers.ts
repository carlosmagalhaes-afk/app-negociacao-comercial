import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Admin-only procedure wrapper
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Gerente-only procedure wrapper
 */
const gerenteProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "gerente" && ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Gerente access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  /**
   * Authentication routes (OAuth only)
   */
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Comodato routes
   */
  comodato: router({
    getConfig: publicProcedure.query(async () => {
      const config = await db.getConfigComodato();
      const produtos = await db.getProdutos();
      return config.map((c) => ({
        ...c,
        produto: produtos.find((p) => p.id === c.produtoId),
      }));
    }),

    getHistorico: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getSimulacoesComodatoByUsuario(ctx.user.id);
    }),

    saveSimulacao: protectedProcedure
      .input(
        z.object({
          nomeMedico: z.string(),
          pontosObtidos: z.number(),
          metaPontos: z.number(),
          qualifica: z.boolean(),
          valorTotal: z.string(),
          status: z.enum(["aceitou", "nao_aceitou", "em_negociacao"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.saveSimulacaoComodato({
          usuarioId: ctx.user.id,
          nomeMedico: input.nomeMedico,
          pontosObtidos: input.pontosObtidos,
          metaPontos: input.metaPontos,
          qualifica: input.qualifica,
          valorTotal: input.valorTotal,
          status: input.status,
          detalhes: null,
        });
      }),

    deleteSimulacao: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        // TODO: Implement delete
        return { success: true };
      }),
  }),

  /**
   * Desconto routes
   */
  desconto: router({
    getConfig: publicProcedure.query(async () => {
      const config = await db.getConfigDesconto();
      const produtos = await db.getProdutos();
      const faixas = await db.getFaixasDesconto();
      return config.map((c) => ({
        ...c,
        produto: produtos.find((p) => p.id === c.produtoId),
        faixas: faixas.filter((f) => f.produtoId === c.produtoId),
      }));
    }),

    saveSimulacao: protectedProcedure
      .input(
        z.object({
          nomeMedico: z.string(),
          descontoSolicitado: z.number(),
          viavel: z.boolean(),
          valorComDesconto: z.string(),
          valorSemDesconto: z.string(),
          modo: z.enum(["por_produto", "pedido_total"]),
          status: z.enum(["aceitou", "nao_aceitou", "em_negociacao"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return db.saveSimulacaoDesconto({
          usuarioId: ctx.user.id,
          nomeMedico: input.nomeMedico,
          descontoSolicitado: input.descontoSolicitado.toString(),
          viavel: input.viavel,
          valorComDesconto: input.valorComDesconto,
          valorSemDesconto: input.valorSemDesconto,
          modo: input.modo,
          status: input.status,
          detalhes: null,
        });
      }),
  }),

  /**
   * Admin routes
   */
  admin: router({
    getUsers: adminProcedure.query(async () => {
      return db.getUsersByRole("representante");
    }),

    createUser: adminProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          role: z.enum(["admin", "gerente", "representante"]),
          regiao: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.createUser({
          openId: `user-${Date.now()}`,
          name: input.name,
          email: input.email,
          role: input.role,
          regiao: input.regiao || null,
          ativo: true,
        });
      }),

    updateUser: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.enum(["admin", "gerente", "representante"]).optional(),
          regiao: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateUser(id, data);
      }),

    deactivateUser: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deactivateUser(input.id);
      }),

    updateConfigComodato: adminProcedure
      .input(
        z.object({
          id: z.number(),
          pontos: z.number().optional(),
          precoVenda: z.string().optional(),
          metaPontos: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateConfigComodato(id, data);
      }),

    updateConfigDesconto: adminProcedure
      .input(
        z.object({
          id: z.number(),
          margemMinima: z.string().optional(),
          precoCusto: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateConfigDesconto(id, data);
      }),

    addFaixaDesconto: adminProcedure
      .input(
        z.object({
          produtoId: z.number(),
          quantidadeMinima: z.number(),
          descontoMaximo: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return db.addFaixaDesconto(input);
      }),

    deleteFaixaDesconto: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteFaixaDesconto(input.id);
      }),

    importarCSV: adminProcedure
      .input(
        z.object({
          tipo: z.enum(["usuarios", "configuracoes"] as const),
          dados: z.array(z.record(z.string(), z.string())),
        })
      )
      .mutation(async ({ input }) => {
        const resultados = { sucesso: 0, erros: 0, mensagens: [] as string[] };

        if (input.tipo === "usuarios") {
          for (const linha of input.dados) {
            try {
              const { nome, email, role, regiao } = linha;
              if (!nome || !email || !role) {
                resultados.erros++;
                resultados.mensagens.push(`Linha invalida: ${JSON.stringify(linha)}`);
                continue;
              }
              await db.createUser({
                openId: `import-${Date.now()}-${Math.random()}`,
                name: (nome as string) || null,
                email: (email as string) || null,
                role: (role as any) || "representante",
                regiao: (regiao as string) || null,
                ativo: true,
              });
              resultados.sucesso++;
            } catch (err: any) {
              resultados.erros++;
              resultados.mensagens.push(err.message);
            }
          }
        } else if (input.tipo === "configuracoes") {
          for (const linha of input.dados) {
            try {
              const { produtoId, pontos, precoVenda, metaPontos } = linha;
              if (produtoId && pontos && precoVenda && metaPontos) {
                const config = await db.getConfigComodato();
                const pId = parseInt(produtoId as string);
                const existingConfig = config.find((c) => c.produtoId === pId);
                if (existingConfig) {
                  await db.updateConfigComodato(existingConfig.id, {
                    pontos: parseInt(pontos as string) || 0,
                    precoVenda: (precoVenda as string).toString(),
                    metaPontos: parseInt(metaPontos as string) || 0,
                  });
                  resultados.sucesso++;
                } else {
                  resultados.erros++;
                  resultados.mensagens.push(`Produto ${produtoId} nao encontrado`);
                }
              } else {
                resultados.erros++;
                resultados.mensagens.push(`Configuracao invalida: ${JSON.stringify(linha)}`);
              }
            } catch (err: any) {
              resultados.erros++;
              resultados.mensagens.push(err.message);
            }
          }
        }

        return resultados;
      }),
  }),

  /**
   * Gerente routes
   */
  gerente: router({
    getHistoricoRegiao: gerenteProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.regiao) throw new TRPCError({ code: "FORBIDDEN" });
      const comodato = await db.getSimulacoesComodatoByRegiao(ctx.user.regiao);
      const desconto = await db.getSimulacoesDescontoByRegiao(ctx.user.regiao);
      return { comodato, desconto };
    }),
  }),
});

export type AppRouter = typeof appRouter;
