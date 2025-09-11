import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/providers/auth_provider.dart';
import '../../../../core/providers/notification_provider.dart';
import '../../../../core/models/user.dart';
import '../../../../core/theme/app_theme.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('SkillLink'),
        actions: [
          Consumer(
            builder: (context, ref, child) {
              final unreadCountState = ref.watch(unreadCountProvider);
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    onPressed: () => context.go('/notifications'),
                  ),
                  unreadCountState.when(
                    data: (count) => count > 0
                        ? Positioned(
                            right: 8,
                            top: 8,
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: AppTheme.errorColor,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              constraints: const BoxConstraints(
                                minWidth: 16,
                                minHeight: 16,
                              ),
                              child: Text(
                                count > 99 ? '99+' : count.toString(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                          )
                        : const SizedBox.shrink(),
                    loading: () => const SizedBox.shrink(),
                    error: (_, __) => const SizedBox.shrink(),
                  ),
                ],
              );
            },
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  context.go('/profile');
                  break;
                case 'logout':
                  ref.read(authProvider.notifier).logout();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person_outline),
                    SizedBox(width: 8),
                    Text('Perfil'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout),
                    SizedBox(width: 8),
                    Text('Sair'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: authState.when(
        data: (user) => _buildBody(context, user),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Text('Erro: $error'),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: 0,
        onTap: (index) {
          switch (index) {
            case 0:
              // Already on home
              break;
            case 1:
              context.go('/services');
              break;
            case 2:
              context.go('/contracts');
              break;
            case 3:
              context.go('/messages');
              break;
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Início',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.work_outline),
            activeIcon: Icon(Icons.work),
            label: 'Serviços',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.description_outlined),
            activeIcon: Icon(Icons.description),
            label: 'Contratos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.message_outlined),
            activeIcon: Icon(Icons.message),
            label: 'Mensagens',
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context, User? user) {
    if (user == null) return const SizedBox.shrink();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome Section
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppTheme.primaryColor,
                  AppTheme.primaryVariant,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Olá, ${user.name}!',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _getWelcomeMessage(user.role),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.white70,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Quick Actions
          Text(
            'Ações Rápidas',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 1.2,
            children: _getQuickActions(context, user.role),
          ),
          
          const SizedBox(height: 24),
          
          // Recent Activity
          Text(
            'Atividade Recente',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.work_outline),
                    title: const Text('Nenhuma atividade recente'),
                    subtitle: const Text('Suas atividades aparecerão aqui'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _getWelcomeMessage(UserRole role) {
    switch (role) {
      case UserRole.freelancer:
        return 'Encontre projetos incríveis e cresça sua carreira';
      case UserRole.company:
        return 'Encontre os melhores freelancers para seus projetos';
      case UserRole.admin:
        return 'Gerencie a plataforma SkillLink';
    }
  }

  List<Widget> _getQuickActions(BuildContext context, UserRole role) {
    switch (role) {
      case UserRole.freelancer:
        return [
          _buildQuickActionCard(
            context,
            'Criar Serviço',
            Icons.add_circle_outline,
            AppTheme.primaryColor,
            () => context.go('/services/create'),
          ),
          _buildQuickActionCard(
            context,
            'Meus Serviços',
            Icons.work_outline,
            AppTheme.secondaryColor,
            () => context.go('/services'),
          ),
          _buildQuickActionCard(
            context,
            'Propostas',
            Icons.description_outlined,
            AppTheme.warningColor,
            () => context.go('/contracts'),
          ),
          _buildQuickActionCard(
            context,
            'Mensagens',
            Icons.message_outlined,
            AppTheme.successColor,
            () => context.go('/messages'),
          ),
        ];
      case UserRole.company:
        return [
          _buildQuickActionCard(
            context,
            'Buscar Freelancers',
            Icons.search,
            AppTheme.primaryColor,
            () => context.go('/services'),
          ),
          _buildQuickActionCard(
            context,
            'Criar Contrato',
            Icons.add_circle_outline,
            AppTheme.secondaryColor,
            () => context.go('/contracts'),
          ),
          _buildQuickActionCard(
            context,
            'Meus Contratos',
            Icons.description_outlined,
            AppTheme.warningColor,
            () => context.go('/contracts'),
          ),
          _buildQuickActionCard(
            context,
            'Mensagens',
            Icons.message_outlined,
            AppTheme.successColor,
            () => context.go('/messages'),
          ),
        ];
      case UserRole.admin:
        return [
          _buildQuickActionCard(
            context,
            'Usuários',
            Icons.people_outline,
            AppTheme.primaryColor,
            () {},
          ),
          _buildQuickActionCard(
            context,
            'Serviços',
            Icons.work_outline,
            AppTheme.secondaryColor,
            () => context.go('/services'),
          ),
          _buildQuickActionCard(
            context,
            'Contratos',
            Icons.description_outlined,
            AppTheme.warningColor,
            () => context.go('/contracts'),
          ),
          _buildQuickActionCard(
            context,
            'Relatórios',
            Icons.analytics_outlined,
            AppTheme.successColor,
            () {},
          ),
        ];
    }
  }

  Widget _buildQuickActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 32,
                color: color,
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
