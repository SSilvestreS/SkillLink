class User {
  final String id;
  final String email;
  final String name;
  final UserRole role;
  final UserStatus status;
  final String? avatar;
  final String? phone;
  final DateTime? lastLoginAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Profile? profile;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.status,
    this.avatar,
    this.phone,
    this.lastLoginAt,
    required this.createdAt,
    required this.updatedAt,
    this.profile,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      role: UserRole.fromString(json['role'] as String),
      status: UserStatus.fromString(json['status'] as String),
      avatar: json['avatar'] as String?,
      phone: json['phone'] as String?,
      lastLoginAt: json['lastLoginAt'] != null 
          ? DateTime.parse(json['lastLoginAt'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      profile: json['profile'] != null 
          ? Profile.fromJson(json['profile'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'role': role.value,
      'status': status.value,
      'avatar': avatar,
      'phone': phone,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'profile': profile?.toJson(),
    };
  }
}

class Profile {
  final String id;
  final String? bio;
  final List<String>? skills;
  final String? experience;
  final String? education;
  final String? portfolio;
  final String? website;
  final String? linkedin;
  final String? github;
  final double? hourlyRate;
  final String? availability;
  final String? timezone;
  final List<String>? languages;
  final String? companyName;
  final String? companySize;
  final String? industry;
  final String? companyDescription;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Profile({
    required this.id,
    this.bio,
    this.skills,
    this.experience,
    this.education,
    this.portfolio,
    this.website,
    this.linkedin,
    this.github,
    this.hourlyRate,
    this.availability,
    this.timezone,
    this.languages,
    this.companyName,
    this.companySize,
    this.industry,
    this.companyDescription,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Profile.fromJson(Map<String, dynamic> json) {
    return Profile(
      id: json['id'] as String,
      bio: json['bio'] as String?,
      skills: json['skills'] != null 
          ? List<String>.from(json['skills'] as List)
          : null,
      experience: json['experience'] as String?,
      education: json['education'] as String?,
      portfolio: json['portfolio'] as String?,
      website: json['website'] as String?,
      linkedin: json['linkedin'] as String?,
      github: json['github'] as String?,
      hourlyRate: json['hourlyRate']?.toDouble(),
      availability: json['availability'] as String?,
      timezone: json['timezone'] as String?,
      languages: json['languages'] != null 
          ? List<String>.from(json['languages'] as List)
          : null,
      companyName: json['companyName'] as String?,
      companySize: json['companySize'] as String?,
      industry: json['industry'] as String?,
      companyDescription: json['companyDescription'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'bio': bio,
      'skills': skills,
      'experience': experience,
      'education': education,
      'portfolio': portfolio,
      'website': website,
      'linkedin': linkedin,
      'github': github,
      'hourlyRate': hourlyRate,
      'availability': availability,
      'timezone': timezone,
      'languages': languages,
      'companyName': companyName,
      'companySize': companySize,
      'industry': industry,
      'companyDescription': companyDescription,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

enum UserRole {
  admin('admin'),
  freelancer('freelancer'),
  company('company');

  const UserRole(this.value);
  final String value;

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.freelancer,
    );
  }
}

enum UserStatus {
  active('active'),
  inactive('inactive'),
  pending('pending');

  const UserStatus(this.value);
  final String value;

  static UserStatus fromString(String value) {
    return UserStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => UserStatus.active,
    );
  }
}
