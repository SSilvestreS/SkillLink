import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/home/presentation/pages/home_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/services/presentation/pages/services_page.dart';
import '../../features/services/presentation/pages/service_detail_page.dart';
import '../../features/services/presentation/pages/create_service_page.dart';
import '../../features/contracts/presentation/pages/contracts_page.dart';
import '../../features/contracts/presentation/pages/contract_detail_page.dart';
import '../../features/messages/presentation/pages/messages_page.dart';
import '../../features/messages/presentation/pages/chat_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/payments/presentation/pages/payments_page.dart';
import '../providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.when(
        data: (user) => user != null,
        loading: () => false,
        error: (_, __) => false,
      );
      
      final isAuthRoute = state.location.startsWith('/login') || 
                         state.location.startsWith('/register');
      
      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      
      if (isLoggedIn && isAuthRoute) {
        return '/';
      }
      
      return null;
    },
    routes: [
      // Auth Routes
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      
      // Main Routes
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
      
      // Services Routes
      GoRoute(
        path: '/services',
        builder: (context, state) => const ServicesPage(),
      ),
      GoRoute(
        path: '/services/:id',
        builder: (context, state) {
          final serviceId = state.pathParameters['id']!;
          return ServiceDetailPage(serviceId: serviceId);
        },
      ),
      GoRoute(
        path: '/services/create',
        builder: (context, state) => const CreateServicePage(),
      ),
      
      // Contracts Routes
      GoRoute(
        path: '/contracts',
        builder: (context, state) => const ContractsPage(),
      ),
      GoRoute(
        path: '/contracts/:id',
        builder: (context, state) {
          final contractId = state.pathParameters['id']!;
          return ContractDetailPage(contractId: contractId);
        },
      ),
      
      // Messages Routes
      GoRoute(
        path: '/messages',
        builder: (context, state) => const MessagesPage(),
      ),
      GoRoute(
        path: '/messages/:contractId',
        builder: (context, state) {
          final contractId = state.pathParameters['contractId']!;
          return ChatPage(contractId: contractId);
        },
      ),
      
      // Notifications Routes
      GoRoute(
        path: '/notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
      
      // Payments Routes
      GoRoute(
        path: '/payments',
        builder: (context, state) => const PaymentsPage(),
      ),
    ],
  );
});
