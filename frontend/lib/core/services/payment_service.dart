import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../models/payment.dart';

class CreatePaymentDto {
  final double amount;
  final String? contractId;
  final String payerId;
  final String receiverId;
  final PaymentMethod method;
  final String? description;

  CreatePaymentDto({
    required this.amount,
    this.contractId,
    required this.payerId,
    required this.receiverId,
    required this.method,
    this.description,
  });

  Map<String, dynamic> toJson() {
    return {
      'amount': amount,
      'contractId': contractId,
      'payerId': payerId,
      'receiverId': receiverId,
      'method': method.value,
      'description': description,
    };
  }
}

class PaymentService {
  Future<Payment> createPayment(CreatePaymentDto dto) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/payments'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode(dto.toJson()),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return Payment.fromJson(data);
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao criar pagamento');
    }
  }

  Future<List<Payment>> getMyPayments() async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/payments'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as List;
      return data.map((json) => Payment.fromJson(json)).toList();
    } else {
      throw Exception('Erro ao buscar pagamentos');
    }
  }

  Future<Payment> getPaymentById(String paymentId) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/payments/$paymentId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return Payment.fromJson(data);
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao buscar pagamento');
    }
  }

  Future<Payment> confirmPayment(String paymentId, {String? stripePaymentIntentId}) async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/payments/$paymentId/confirm'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'stripePaymentIntentId': stripePaymentIntentId,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return Payment.fromJson(data);
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao confirmar pagamento');
    }
  }

  Future<PaymentStats> getPaymentStats() async {
    final token = await _getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.get(
      Uri.parse('${AppConfig.apiUrl}/payments/stats'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return PaymentStats.fromJson(data);
    } else {
      throw Exception('Erro ao buscar estatísticas de pagamentos');
    }
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConfig.tokenKey);
  }
}
