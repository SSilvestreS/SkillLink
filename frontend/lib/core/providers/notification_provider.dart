import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/notification_service.dart';

final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

final notificationsProvider = StateNotifierProvider<NotificationNotifier, AsyncValue<List<NotificationModel>>>((ref) {
  final notificationService = ref.watch(notificationServiceProvider);
  return NotificationNotifier(notificationService);
});

final unreadCountProvider = StateNotifierProvider<UnreadCountNotifier, AsyncValue<int>>((ref) {
  final notificationService = ref.watch(notificationServiceProvider);
  return UnreadCountNotifier(notificationService);
});

class NotificationNotifier extends StateNotifier<AsyncValue<List<NotificationModel>>> {
  final NotificationService _notificationService;

  NotificationNotifier(this._notificationService) : super(const AsyncValue.loading()) {
    loadNotifications();
  }

  Future<void> loadNotifications({int page = 1, int limit = 20}) async {
    state = const AsyncValue.loading();
    try {
      final notifications = await _notificationService.getNotifications(
        page: page,
        limit: limit,
      );
      state = AsyncValue.data(notifications);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> refresh() async {
    await loadNotifications();
  }

  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);
      // Atualizar a lista local
      state.whenData((notifications) {
        final updatedNotifications = notifications.map((notification) {
          if (notification.id == notificationId) {
            return NotificationModel(
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              createdAt: notification.createdAt,
              actionUrl: notification.actionUrl,
              isRead: true,
            );
          }
          return notification;
        }).toList();
        state = AsyncValue.data(updatedNotifications);
      });
    } catch (e) {
      // Tratar erro se necessário
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
      // Atualizar todas as notificações como lidas
      state.whenData((notifications) {
        final updatedNotifications = notifications.map((notification) {
          return NotificationModel(
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            createdAt: notification.createdAt,
            actionUrl: notification.actionUrl,
            isRead: true,
          );
        }).toList();
        state = AsyncValue.data(updatedNotifications);
      });
    } catch (e) {
      // Tratar erro se necessário
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _notificationService.deleteNotification(notificationId);
      // Remover da lista local
      state.whenData((notifications) {
        final updatedNotifications = notifications
            .where((notification) => notification.id != notificationId)
            .toList();
        state = AsyncValue.data(updatedNotifications);
      });
    } catch (e) {
      // Tratar erro se necessário
    }
  }
}

class UnreadCountNotifier extends StateNotifier<AsyncValue<int>> {
  final NotificationService _notificationService;

  UnreadCountNotifier(this._notificationService) : super(const AsyncValue.loading()) {
    loadUnreadCount();
  }

  Future<void> loadUnreadCount() async {
    try {
      final count = await _notificationService.getUnreadCount();
      state = AsyncValue.data(count);
    } catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    }
  }

  Future<void> refresh() async {
    await loadUnreadCount();
  }

  void decrement() {
    state.whenData((count) {
      state = AsyncValue.data(count > 0 ? count - 1 : 0);
    });
  }

  void reset() {
    state = const AsyncValue.data(0);
  }
}
