// Define os tipos de usuários do sistema.
export enum UsersPermission {
    super_administrador,
    administrador,
    gerente,
    moderador,
    suporte,
    usuario_premium,
    usuario_regular,
    visitante,
}

// Define os status comuns para entidades do sistema.
export enum StatusList {
    ativo,
    inativo,
    bloqueado,
    pendente,
    rejeitado,
    cancelado,
}

//Define os papéis principais do sistema.
export enum Roles {
    SUPER_ADMIN = "super_admin", // Administrador global com acesso total
    PROVIDER_ADMIN = "provider_admin", // Administrador do provedor com acesso limitado
}

// Define os status para serviços ou produtos.
export enum ServiceStatus {
    disponivel, // Serviço disponível para contratação
    indisponivel, // Serviço temporariamente indisponível
    esgotado, // Serviço esgotado (ex.: limite de vagas)
    em_manutencao, // Serviço em manutenção
    cancelado, // Serviço cancelado permanentemente
}

//Define os status para transações financeiras.
export enum FinancialStatus {
    pago, // Pagamento realizado com sucesso
    pendente, // Pagamento pendente
    atrasado, // Pagamento atrasado
    cancelado, // Pagamento cancelado
    reembolsado, // Pagamento reembolsado
    em_disputa, // Pagamento em disputa (chargeback)
    falha, // Falha no processamento do pagamento
}

// Define os status para clientes.
export enum CustomerStatus {
    ativo, // Cliente ativo e utilizando os serviços
    inativo, // Cliente inativo (não utiliza os serviços há algum tempo)
    bloqueado, // Cliente bloqueado por violação de políticas
    pendente_ativacao, // Cliente aguardando ativação da conta
    rejeitado, // Cliente rejeitado durante o processo de cadastro
    suspenso, // Cliente suspenso temporariamente por problemas de pagamento
    em_analise, // Cliente em análise para reativação ou aprovação
    cancelado, // Cliente cancelado permanentemente
    trial, // Cliente em período de teste (trial)
    premium, // Cliente com plano premium
    regular, // Cliente com plano regular
}

// Define os status para usuários do provedor.
export enum ProviderUserStatus {
    ativo, // Usuário ativo e com acesso ao sistema
    inativo, // Usuário desativado temporariamente
    bloqueado, // Usuário bloqueado por violação de políticas
    pendente_ativacao, // Usuário aguardando ativação da conta
    rejeitado, // Usuário rejeitado durante o processo de cadastro
    suspenso, // Usuário suspenso temporariamente por problemas de segurança
    em_analise, // Usuário em análise para reativação ou aprovação
    cancelado, // Usuário cancelado permanentemente
}

// Define os status para provedores.
export enum ProviderStatus {
    ativo, // Provedor ativo e operando normalmente
    inativo, // Provedor desativado temporariamente
    bloqueado, // Provedor bloqueado por violação de políticas
    pendente_aprovacao, // Provedor aguardando aprovação para operar
    rejeitado, // Provedor rejeitado durante o processo de aprovação
    suspenso, // Provedor suspenso temporariamente por problemas técnicos ou financeiros
    em_analise, // Provedor em análise para reativação ou aprovação
    cancelado, // Provedor cancelado permanentemente
}

//Define as permissões disponíveis no sistema.
export enum Permissions {
    // Permissões globais (apenas para SUPER_ADMIN)
    MANAGE_ALL_PROVIDERS = "manage_all_providers",
    MANAGE_ALL_USERS = "manage_all_users",
    MANAGE_ALL_CUSTOMERS = "manage_all_customers",
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings",

    // Permissões específicas do provedor (para PROVIDER_ADMIN)
    MANAGE_OWN_PROVIDER = "manage_own_provider",
    MANAGE_OWN_CUSTOMERS = "manage_own_customers",
    VIEW_OWN_PROVIDER = "view_own_provider",
}

// Mapeamento de roles para permissões
export const RolePermissions = {
    [Roles.SUPER_ADMIN]: [
        Permissions.MANAGE_ALL_PROVIDERS,
        Permissions.MANAGE_ALL_USERS,
        Permissions.MANAGE_ALL_CUSTOMERS,
        Permissions.MANAGE_SYSTEM_SETTINGS,
    ],
    [Roles.PROVIDER_ADMIN]: [
        Permissions.MANAGE_OWN_PROVIDER,
        Permissions.MANAGE_OWN_CUSTOMERS,
        Permissions.VIEW_OWN_PROVIDER,
    ],
};