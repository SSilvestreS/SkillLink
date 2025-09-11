import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/providers/notification_provider.dart';
import '../../../core/services/notification_service.dart';
import '../../../core/theme/app_theme.dart';

class NotificationsPage extends ConsumerWidget {
  const NotificationsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsState = ref.watch(notificationsProvider);
    final unreadCountState = ref.watch(unreadCountProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notificações'),
        actions: [
          Consumer(
            builder: (context, ref, child) {
              return IconButton(
                icon: const Icon(Icons.mark_email_read),
                onPressed: () async {
                  await ref.read(notificationsProvider.notifier).markAllAsRead();
                  ref.read(unreadCountProvider.notifier).reset();
                },
                tooltip: 'Marcar todas como lidas',
              );
            },
          ),
        ],
      ),
      body: notificationsState.when(
        data: (notifications) => _buildNotificationsList(context, ref, notifications),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: AppTheme.errorColor,
              ),
              const SizedBox(height: 16),
              Text(
                'Erro ao carregar notificações',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  ref.read(notificationsProvider.notifier).refresh();
                },
                child: const Text('Tentar novamente'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNotificationsList(
    BuildContext context,
    WidgetRef ref,
    List<NotificationModel> notifications,
  ) {
    if (notifications.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.notifications_none,
              size: 64,
              color: AppTheme.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhuma notificação',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Suas notificações aparecerão aqui',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppTheme.textTertiary,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        await ref.read(notificationsProvider.notifier).refresh();
        ref.read(unreadCountProvider.notifier).refresh();
      },
      child: ListView.builder(
        itemCount: notifications.length,
        itemBuilder: (context, index) {
          final notification = notifications[index];
          return _buildNotificationCard(context, ref, notification);
        },
      ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context,
    WidgetRef ref,
    NotificationModel notification,
  ) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getNotificationColor(notification.type),
          child: Icon(
            _getNotificationIcon(notification.type),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(
          notification.title,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              notification.message,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('dd/MM/yyyy HH:mm').format(notification.createdAt),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textTertiary,
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: PopupMenuButton<String>(
          onSelected: (value) async {
            switch (value) {
              case 'mark_read':
                if (!notification.isRead) {
                  await ref.read(notificationsProvider.notifier).markAsRead(notification.id);
                  ref.read(unreadCountProvider.notifier).decrement();
                }
                break;
              case 'delete':
                await ref.read(notificationsProvider.notifier).deleteNotification(notification.id);
                break;
            }
          },
          itemBuilder: (context) => [
            if (!notification.isRead)
              const PopupMenuItem(
                value: 'mark_read',
                child: Row(
                  children: [
                    Icon(Icons.mark_email_read, size: 16),
                    SizedBox(width: 8),
                    Text('Marcar como lida'),
                  ],
                ),
              ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(Icons.delete, size: 16, color: Colors.red),
                  SizedBox(width: 8),
                  Text('Deletar', style: TextStyle(color: Colors.red)),
                ],
              ),
            ),
          ],
        ),
        onTap: () async {
          if (!notification.isRead) {
            await ref.read(notificationsProvider.notifier).markAsRead(notification.id);
            ref.read(unreadCountProvider.notifier).decrement();
          }
          
          if (notification.actionUrl != null) {
            // TODO: Navegar para a URL da ação
            // context.go(notification.actionUrl!);
          }
        },
        tileColor: notification.isRead ? null : AppTheme.primaryColor.withOpacity(0.05),
      ),
    );
  }

  Color _getNotificationColor(String type) {
    switch (type) {
      case 'new_message':
        return AppTheme.primaryColor;
      case 'new_contract':
        return AppTheme.successColor;
      case 'contract_accepted':
        return AppTheme.secondaryColor;
      case 'contract_rejected':
        return AppTheme.errorColor;
      case 'contract_completed':
        return AppTheme.successColor;
      case 'payment_received':
        return Colors.green;
      case 'review_received':
        return Colors.orange;
      case 'system_announcement':
        return AppTheme.warningColor;
      default:
        return AppTheme.textTertiary;
    }
  }

  IconData _getNotificationIcon(String type) {
    switch (type) {
      case 'new_message':
        return Icons.message;
      case 'new_contract':
        return Icons.description;
      case 'contract_accepted':
        return Icons.check_circle;
      case 'contract_rejected':
        return Icons.cancel;
      case 'contract_completed':
        return Icons.done_all;
      case 'payment_received':
        return Icons.payment;
      case 'review_received':
        return Icons.star;
      case 'system_announcement':
        return Icons.announcement;
      default:
        return Icons.notifications;
    }
  }
}
