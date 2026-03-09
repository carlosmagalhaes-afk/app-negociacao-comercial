import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

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
   * Authentication routes
   */
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(input.password, user.password);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        if (!user.ativo) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User account is inactive" });
        }

        // Update last signed in
        await db.updateUser(user.id, { lastSignedIn: new Date() });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, user.id.toString(), {
          ...cookieOptions,
          maxAge: 30 * 60 * 1000, // 30 minutes
        });

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            regiao: user.regiao,
          },
        };
      }),

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

    saveSimulacao: protectedProcedure
      .input(
        z.object({
          nomeMedico: z.string().min(1),
          pontosObtidos: z.number().int().nonnegative(),
          metaPontos: z.number().int().positive(),
          qualifica: z.boolean(),
          valorTotal: z.string(),
          detalhes: z.string(),
          status: z.enum(["aceitou", "nao_aceitou", "em_negociacao"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

        const result = await db.saveSimulacaoComodato({
          usuarioId: ctx.user.id,
          nomeMedico: input.nomeMedico,
          pontosObtidos: input.pontosObtidos,
          metaPontos: input.metaPontos,
          qualifica: input.qualifica,
          valorTotal: input.valorTotal as any,
          detalhes: input.detalhes,
          status: input.status,
        });

        return { success: true, id: (result as any).insertId };
      }),

    getHistorico: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getSimulacoesComodatoByUsuario(ctx.user.id);
    }),
  }),

  /**
   * Desconto routes
   */
  desconto: router({
    getConfig: publicProcedure.query(async () => {
      const config = await db.getConfigDesconto();
      const faixas = await db.getFaixasDesconto();
      const produtos = await db.getProdutos();
      return config.map((c) => ({
        ...c,
        produto: produtos.find((p) => p.id === c.produtoId),
        faixas: faixas.filter((f) => f.produtoId === c.produtoId),
      }));
    }),

    saveSimulacao: protectedProcedure
      .input(
        z.object({
          nomeMedico: z.string().min(1),
          modo: z.enum(["por_produto", "pedido_total"]),
          descontoSolicitado: z.string(),
          viavel: z.boolean(),
          descontoMaximoPossivel: z.string().optional(),
          valorSemDesconto: z.string(),
          valorComDesconto: z.string(),
          detalhes: z.string(),
          status: z.enum(["aceitou", "nao_aceitou", "em_negociacao"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

        const result = await db.saveSimulacaoDesconto({
          usuarioId: ctx.user.id,
          nomeMedico: input.nomeMedico,
          modo: input.modo,
          descontoSolicitado: input.descontoSolicitado as any,
          viavel: input.viavel,
          descontoMaximoPossivel: input.descontoMaximoPossivel as any,
          valorSemDesconto: input.valorSemDesconto as any,
          valorComDesconto: input.valorComDesconto as any,
          detalhes: input.detalhes,
          status: input.status,
        });

        return { success: true, id: (result as any).insertId };
      }),

    getHistorico: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return db.getSimulacoesDescontoByUsuario(ctx.user.id);
    }),
  }),

  /**
   * Gerente (Regional Manager) routes
   */
  gerente: router({
    getHistoricoRegiao: gerenteProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.regiao) throw new TRPCError({ code: "BAD_REQUEST" });
      const comodato = await db.getSimulacoesComodatoByRegiao(ctx.user.regiao);
      const desconto = await db.getSimulacoesDescontoByRegiao(ctx.user.regiao);
      return { comodato, desconto };
    }),
  }),

  /**
   * Admin routes
   */
  admin: router({
    /**
     * User management
     */
    createUser: adminProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
          role: z.enum(["admin", "gerente", "representante"]),
          regiao: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const result = await db.createUser({
          openId: `local-${Date.now()}`,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          regiao: input.regiao,
          loginMethod: "password",
        });

        return { success: true, id: (result as any).insertId };
      }),

    listUsers: adminProcedure.query(async () => {
      const reps = await db.getUsersByRole("representante");
      const gerentes = await db.getUsersByRole("gerente");
      const admins = await db.getUsersByRole("admin");
      return { representantes: reps, gerentes, admins };
    }),

    deactivateUser: adminProcedure
      .input(z.object({ userId: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.deactivateUser(input.userId);
        return { success: true };
      }),

    /**
     * Configuration management
     */
    updateConfigComodato: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          pontos: z.number().int().optional(),
          precoVenda: z.string().optional(),
          metaPontos: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateConfigComodato(id, data as any);
        return { success: true };
      }),

    updateConfigDesconto: adminProcedure
      .input(
        z.object({
          id: z.number().int(),
          margemMinima: z.string().optional(),
          precoCusto: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateConfigDesconto(id, data as any);
        return { success: true };
      }),

    addFaixaDesconto: adminProcedure
      .input(
        z.object({
          produtoId: z.number().int(),
          quantidadeMinima: z.number().int().positive(),
          descontoMaximo: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.addFaixaDesconto(input as any);
        return { success: true, id: (result as any).insertId };
      }),

    deleteFaixaDesconto: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await db.deleteFaixaDesconto(input.id);
        return { success: true };
      }),

    /**
     * Analytics and history
     */
    getAllSimulacoes: adminProcedure.query(async () => {
      return { comodato: [], desconto: [] };
    }),
  }),
});

export type AppRouter = typeof appRouter;
