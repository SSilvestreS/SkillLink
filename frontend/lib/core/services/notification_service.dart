import 'dart:convert';
import 'package:http/http.dart' as http';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type;
  final DateTime createdAt;
  final String? actionUrl;
  final bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.createdAt,
    this.actionUrl,
    this.isRead = false,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      actionUrl: json['actionUrl'] as String?,
      isRead: json['isRead'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'createdAt': createdAt.toIso8601String(),
      'actionUrl': actionUrl,
      'isRead': isRead,
    };
  }
}

class NotificationService {
  Future<List<NotificationModel>> getNotifications({
    int page = 1,
    int limit = 20,
  }) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/notifications?page=$page&limit=$limit'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final notifications = (data['notifications'] as List)
          .map((json) => NotificationModel.fromJson(json))
          .toList();
      return notifications;
    } else {
      throw Exception('Erro ao buscar notificações');
    }
  }

  Future<int> getUnreadCount() async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/notifications/unread-count'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return data['unreadCount'] as int;
    } else {
      throw Exception('Erro ao buscar contagem de notificações');
    }
  }

  Future<void> markAsRead(String notificationId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.patch(
      Uri.parse('${AppConfig.apiUrl}/notifications/$notificationId/read'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao marcar notificação como lida');
    }
  }

  Future<void> markAllAsRead() async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.patch(
      Uri.parse('${AppConfig.apiUrl}/notifications/mark-all-read'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao marcar todas as notificações como lidas');
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.delete(
      Uri.parse('${AppConfig.apiUrl}/notifications/$notificationId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode != 200) {
      throw Exception('Erro ao deletar notificação');
    }
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConfig.tokenKey);
  }
}
