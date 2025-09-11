class Payment {
  final String id;
  final double amount;
  final double platformFee;
  final double freelancerAmount;
  final String currency;
  final PaymentStatus status;
  final PaymentMethod method;
  final PaymentType type;
  final String? stripePaymentIntentId;
  final String? stripeChargeId;
  final String? pixCode;
  final String? pixQrCode;
  final DateTime? pixExpiresAt;
  final String? transactionId;
  final String? description;
  final Map<String, dynamic>? metadata;
  final DateTime? processedAt;
  final DateTime? failedAt;
  final String? failureReason;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String payerId;
  final String receiverId;
  final String? contractId;

  const Payment({
    required this.id,
    required this.amount,
    required this.platformFee,
    required this.freelancerAmount,
    required this.currency,
    required this.status,
    required this.method,
    required this.type,
    this.stripePaymentIntentId,
    this.stripeChargeId,
    this.pixCode,
    this.pixQrCode,
    this.pixExpiresAt,
    this.transactionId,
    this.description,
    this.metadata,
    this.processedAt,
    this.failedAt,
    this.failureReason,
    required this.createdAt,
    required this.updatedAt,
    required this.payerId,
    required this.receiverId,
    this.contractId,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      platformFee: (json['platformFee'] as num).toDouble(),
      freelancerAmount: (json['freelancerAmount'] as num).toDouble(),
      currency: json['currency'] as String,
      status: PaymentStatus.fromString(json['status'] as String),
      method: PaymentMethod.fromString(json['method'] as String),
      type: PaymentType.fromString(json['type'] as String),
      stripePaymentIntentId: json['stripePaymentIntentId'] as String?,
      stripeChargeId: json['stripeChargeId'] as String?,
      pixCode: json['pixCode'] as String?,
      pixQrCode: json['pixQrCode'] as String?,
      pixExpiresAt: json['pixExpiresAt'] != null 
          ? DateTime.parse(json['pixExpiresAt'] as String)
          : null,
      transactionId: json['transactionId'] as String?,
      description: json['description'] as String?,
      metadata: json['metadata'] != null 
          ? Map<String, dynamic>.from(json['metadata'] as Map)
          : null,
      processedAt: json['processedAt'] != null 
          ? DateTime.parse(json['processedAt'] as String)
          : null,
      failedAt: json['failedAt'] != null 
          ? DateTime.parse(json['failedAt'] as String)
          : null,
      failureReason: json['failureReason'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      payerId: json['payerId'] as String,
      receiverId: json['receiverId'] as String,
      contractId: json['contractId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'platformFee': platformFee,
      'freelancerAmount': freelancerAmount,
      'currency': currency,
      'status': status.value,
      'method': method.value,
      'type': type.value,
      'stripePaymentIntentId': stripePaymentIntentId,
      'stripeChargeId': stripeChargeId,
      'pixCode': pixCode,
      'pixQrCode': pixQrCode,
      'pixExpiresAt': pixExpiresAt?.toIso8601String(),
      'transactionId': transactionId,
      'description': description,
      'metadata': metadata,
      'processedAt': processedAt?.toIso8601String(),
      'failedAt': failedAt?.toIso8601String(),
      'failureReason': failureReason,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'payerId': payerId,
      'receiverId': receiverId,
      'contractId': contractId,
    };
  }
}

enum PaymentStatus {
  pending('pending'),
  processing('processing'),
  completed('completed'),
  failed('failed'),
  cancelled('cancelled'),
  refunded('refunded');

  const PaymentStatus(this.value);
  final String value;

  static PaymentStatus fromString(String value) {
    return PaymentStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => PaymentStatus.pending,
    );
  }
}

enum PaymentMethod {
  stripeCard('stripe_card'),
  stripePix('stripe_pix'),
  pixDirect('pix_direct'),
  bankTransfer('bank_transfer'),
  cryptoBitcoin('crypto_bitcoin'),
  cryptoEthereum('crypto_ethereum');

  const PaymentMethod(this.value);
  final String value;

  static PaymentMethod fromString(String value) {
    return PaymentMethod.values.firstWhere(
      (method) => method.value == value,
      orElse: () => PaymentMethod.stripePix,
    );
  }

  String get displayName {
    switch (this) {
      case PaymentMethod.stripeCard:
        return 'Cartão de Crédito';
      case PaymentMethod.stripePix:
        return 'PIX (Stripe)';
      case PaymentMethod.pixDirect:
        return 'PIX Direto';
      case PaymentMethod.bankTransfer:
        return 'Transferência Bancária';
      case PaymentMethod.cryptoBitcoin:
        return 'Bitcoin';
      case PaymentMethod.cryptoEthereum:
        return 'Ethereum';
    }
  }

  String get icon {
    switch (this) {
      case PaymentMethod.stripeCard:
        return '💳';
      case PaymentMethod.stripePix:
      case PaymentMethod.pixDirect:
        return '📱';
      case PaymentMethod.bankTransfer:
        return '🏦';
      case PaymentMethod.cryptoBitcoin:
        return '₿';
      case PaymentMethod.cryptoEthereum:
        return 'Ξ';
    }
  }
}

enum PaymentType {
  contractPayment('contract_payment'),
  platformFee('platform_fee'),
  refund('refund'),
  withdrawal('withdrawal');

  const PaymentType(this.value);
  final String value;

  static PaymentType fromString(String value) {
    return PaymentType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => PaymentType.contractPayment,
    );
  }
}

class PaymentStats {
  final double totalReceived;
  final double totalPaid;
  final double totalFees;
  final double pendingAmount;

  const PaymentStats({
    required this.totalReceived,
    required this.totalPaid,
    required this.totalFees,
    required this.pendingAmount,
  });

  factory PaymentStats.fromJson(Map<String, dynamic> json) {
    return PaymentStats(
      totalReceived: (json['totalReceived'] as num).toDouble(),
      totalPaid: (json['totalPaid'] as num).toDouble(),
      totalFees: (json['totalFees'] as num).toDouble(),
      pendingAmount: (json['pendingAmount'] as num).toDouble(),
    );
  }
}
