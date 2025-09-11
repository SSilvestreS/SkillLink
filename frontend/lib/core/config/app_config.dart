class AppConfig {
  static const String appName = 'SkillLink';
  static const String appVersion = '1.0.0';
  
  // API Configuration
  static const String baseUrl = 'http://localhost:3000';
  static const String apiUrl = '$baseUrl/api';
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  
  // Pagination
  static const int defaultPageSize = 20;
  
  // File Upload
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx', 'txt'];
  
  // UI Configuration
  static const double defaultPadding = 16.0;
  static const double defaultRadius = 8.0;
  static const double defaultElevation = 2.0;
}
