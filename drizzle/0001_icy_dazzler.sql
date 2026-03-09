CREATE TABLE `config_comodato` (
	`id` int AUTO_INCREMENT NOT NULL,
	`produtoId` int NOT NULL,
	`pontos` int NOT NULL,
	`precoVenda` decimal(10,2) NOT NULL,
	`metaPontos` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `config_comodato_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `config_desconto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`produtoId` int NOT NULL,
	`margemMinima` decimal(5,2) NOT NULL,
	`precoCusto` decimal(10,2) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `config_desconto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `faixas_desconto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`produtoId` int NOT NULL,
	`quantidadeMinima` int NOT NULL,
	`descontoMaximo` decimal(5,2) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faixas_desconto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`),
	CONSTRAINT `produtos_nome_unique` UNIQUE(`nome`)
);
--> statement-breakpoint
CREATE TABLE `sessoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`token` varchar(512) NOT NULL,
	`ultimaAtividade` timestamp NOT NULL DEFAULT (now()),
	`expiradoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessoes_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `simulacoes_comodato` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`nomeMedico` varchar(255) NOT NULL,
	`pontosObtidos` int NOT NULL,
	`metaPontos` int NOT NULL,
	`qualifica` boolean NOT NULL,
	`valorTotal` decimal(10,2) NOT NULL,
	`detalhes` text,
	`status` enum('aceitou','nao_aceitou','em_negociacao') NOT NULL DEFAULT 'em_negociacao',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulacoes_comodato_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulacoes_desconto` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`nomeMedico` varchar(255) NOT NULL,
	`modo` enum('por_produto','pedido_total') NOT NULL,
	`descontoSolicitado` decimal(5,2) NOT NULL,
	`viavel` boolean NOT NULL,
	`descontoMaximoPossivel` decimal(5,2),
	`valorSemDesconto` decimal(10,2) NOT NULL,
	`valorComDesconto` decimal(10,2) NOT NULL,
	`detalhes` text,
	`status` enum('aceitou','nao_aceitou','em_negociacao') NOT NULL DEFAULT 'em_negociacao',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `simulacoes_desconto_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','gerente','representante') NOT NULL DEFAULT 'representante';--> statement-breakpoint
ALTER TABLE `users` ADD `password` text;--> statement-breakpoint
ALTER TABLE `users` ADD `regiao` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `ativo` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);