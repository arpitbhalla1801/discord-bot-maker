-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SLASH',
    "discordCmdId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "options" JSONB,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "command_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_graph" (
    "id" TEXT NOT NULL,
    "commandId" TEXT NOT NULL,
    "graphJson" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "command_graph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "ownerId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guild_deployment" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "authorId" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "type" TEXT NOT NULL DEFAULT 'BLOCKS',
    "manifest" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_plugin" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "pluginId" TEXT NOT NULL,
    "config" JSONB,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_plugin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "graphJson" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "installs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "command_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_identifier_value_key" ON "verification"("identifier", "value");

-- CreateIndex
CREATE INDEX "bot_project_userId_idx" ON "bot_project"("userId");

-- CreateIndex
CREATE INDEX "bot_project_status_idx" ON "bot_project"("status");

-- CreateIndex
CREATE INDEX "command_projectId_idx" ON "command"("projectId");

-- CreateIndex
CREATE INDEX "command_type_idx" ON "command"("type");

-- CreateIndex
CREATE UNIQUE INDEX "command_projectId_name_key" ON "command"("projectId", "name");

-- CreateIndex
CREATE INDEX "command_graph_commandId_idx" ON "command_graph"("commandId");

-- CreateIndex
CREATE INDEX "command_graph_isActive_idx" ON "command_graph"("isActive");

-- CreateIndex
CREATE INDEX "guild_addedBy_idx" ON "guild"("addedBy");

-- CreateIndex
CREATE INDEX "guild_deployment_guildId_idx" ON "guild_deployment"("guildId");

-- CreateIndex
CREATE INDEX "guild_deployment_projectId_idx" ON "guild_deployment"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_deployment_guildId_projectId_key" ON "guild_deployment"("guildId", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_slug_key" ON "plugin"("slug");

-- CreateIndex
CREATE INDEX "plugin_authorId_idx" ON "plugin"("authorId");

-- CreateIndex
CREATE INDEX "plugin_slug_idx" ON "plugin"("slug");

-- CreateIndex
CREATE INDEX "plugin_isPublic_idx" ON "plugin"("isPublic");

-- CreateIndex
CREATE INDEX "project_plugin_projectId_idx" ON "project_plugin"("projectId");

-- CreateIndex
CREATE INDEX "project_plugin_pluginId_idx" ON "project_plugin"("pluginId");

-- CreateIndex
CREATE UNIQUE INDEX "project_plugin_projectId_pluginId_key" ON "project_plugin"("projectId", "pluginId");

-- CreateIndex
CREATE INDEX "command_template_authorId_idx" ON "command_template"("authorId");

-- CreateIndex
CREATE INDEX "command_template_isPublic_idx" ON "command_template"("isPublic");

-- CreateIndex
CREATE INDEX "command_template_tags_idx" ON "command_template"("tags");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_project" ADD CONSTRAINT "bot_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command" ADD CONSTRAINT "command_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "bot_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_graph" ADD CONSTRAINT "command_graph_commandId_fkey" FOREIGN KEY ("commandId") REFERENCES "command"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild" ADD CONSTRAINT "guild_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_deployment" ADD CONSTRAINT "guild_deployment_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_deployment" ADD CONSTRAINT "guild_deployment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "bot_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plugin" ADD CONSTRAINT "plugin_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_plugin" ADD CONSTRAINT "project_plugin_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "bot_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_plugin" ADD CONSTRAINT "project_plugin_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "plugin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_template" ADD CONSTRAINT "command_template_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
