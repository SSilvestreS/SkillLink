import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../models/user.dart';

class AuthResponse {
  final String accessToken;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}

class AuthService {
  Future<AuthResponse> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final authResponse = AuthResponse.fromJson(data);
      
      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.tokenKey, authResponse.accessToken);
      await prefs.setString(AppConfig.userKey, jsonEncode(authResponse.user.toJson()));
      
      return authResponse;
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao fazer login');
    }
  }

  Future<AuthResponse> register(String email, String password, String name, UserRole role) async {
    final response = await http.post(
      Uri.parse('${AppConfig.apiUrl}/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
        'name': name,
        'role': role.value,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final authResponse = AuthResponse.fromJson(data);
      
      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.tokenKey, authResponse.accessToken);
      await prefs.setString(AppConfig.userKey, jsonEncode(authResponse.user.toJson()));
      
      return authResponse;
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao registrar');
    }
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(AppConfig.userKey);
    
    if (userJson == null) return null;
    
    final userData = jsonDecode(userJson) as Map<String, dynamic>;
    return User.fromJson(userData);
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConfig.tokenKey);
  }

  Future<User> updateProfile(Map<String, dynamic> profileData) async {
    final token = await getToken();
    if (token == null) throw Exception('Usuário não autenticado');

    final response = await http.put(
      Uri.parse('${AppConfig.apiUrl}/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(profileData),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final user = User.fromJson(data);
      
      // Update stored user
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(AppConfig.userKey, jsonEncode(user.toJson()));
      
      return user;
    } else {
      final error = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(error['message'] ?? 'Erro ao atualizar perfil');
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConfig.tokenKey);
    await prefs.remove(AppConfig.userKey);
  }
}
