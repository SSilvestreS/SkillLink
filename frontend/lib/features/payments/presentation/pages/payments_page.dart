import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/models/payment.dart';
import '../../../core/services/payment_service.dart';
import '../../../core/theme/app_theme.dart';

class PaymentsPage extends ConsumerStatefulWidget {
  const PaymentsPage({super.key});

  @override
  ConsumerState<PaymentsPage> createState() => _PaymentsPageState();
}

class _PaymentsPageState extends ConsumerState<PaymentsPage> {
  final PaymentService _paymentService = PaymentService();
  List<Payment> _payments = [];
  PaymentStats? _stats;
  bool _isLoading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      setState(() => _isLoading = true);
      final payments = await _paymentService.getMyPayments();
      final stats = await _paymentService.getPaymentStats();
      
      setState(() {
        _payments = payments;
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pagamentos'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? _buildErrorWidget()
              : _buildBody(),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
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
            'Erro ao carregar pagamentos',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            _error,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadData,
            child: const Text('Tentar novamente'),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_stats != null) _buildStatsCards(),
          const SizedBox(height: 24),
          _buildPaymentsList(),
        ],
      ),
    );
  }

  Widget _buildStatsCards() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Resumo Financeiro',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Recebido',
                'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(_stats!.totalReceived)}',
                AppTheme.successColor,
                Icons.trending_up,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Pago',
                'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(_stats!.totalPaid)}',
                AppTheme.primaryColor,
                Icons.trending_down,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildStatCard(
                'Taxas',
                'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(_stats!.totalFees)}',
                AppTheme.warningColor,
                Icons.percent,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildStatCard(
                'Pendente',
                'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(_stats!.pendingAmount)}',
                AppTheme.textSecondary,
                Icons.schedule,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, Color color, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentsList() {
    if (_payments.isEmpty) {
      return Center(
        child: Column(
          children: [
            Icon(
              Icons.payment,
              size: 64,
              color: AppTheme.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              'Nenhum pagamento encontrado',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Histórico de Pagamentos',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _payments.length,
          itemBuilder: (context, index) {
            final payment = _payments[index];
            return _buildPaymentCard(payment);
          },
        ),
      ],
    );
  }

  Widget _buildPaymentCard(Payment payment) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: _getStatusColor(payment.status),
          child: Icon(
            _getStatusIcon(payment.status),
            color: Colors.white,
            size: 20,
          ),
        ),
        title: Text(
          payment.description ?? 'Pagamento',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(payment.amount)}',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: _getAmountColor(payment),
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Text(
                  payment.method.displayName,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  payment.method.icon,
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              DateFormat('dd/MM/yyyy HH:mm').format(payment.createdAt),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppTheme.textTertiary,
                fontSize: 12,
              ),
            ),
          ],
        ),
        trailing: Chip(
          label: Text(
            _getStatusText(payment.status),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          backgroundColor: _getStatusColor(payment.status),
        ),
        onTap: () {
          _showPaymentDetails(payment);
        },
      ),
    );
  }

  Color _getStatusColor(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return AppTheme.warningColor;
      case PaymentStatus.processing:
        return AppTheme.primaryColor;
      case PaymentStatus.completed:
        return AppTheme.successColor;
      case PaymentStatus.failed:
        return AppTheme.errorColor;
      case PaymentStatus.cancelled:
        return AppTheme.textTertiary;
      case PaymentStatus.refunded:
        return Colors.blue;
    }
  }

  IconData _getStatusIcon(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return Icons.schedule;
      case PaymentStatus.processing:
        return Icons.hourglass_empty;
      case PaymentStatus.completed:
        return Icons.check_circle;
      case PaymentStatus.failed:
        return Icons.cancel;
      case PaymentStatus.cancelled:
        return Icons.block;
      case PaymentStatus.refunded:
        return Icons.refresh;
    }
  }

  String _getStatusText(PaymentStatus status) {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pendente';
      case PaymentStatus.processing:
        return 'Processando';
      case PaymentStatus.completed:
        return 'Concluído';
      case PaymentStatus.failed:
        return 'Falhou';
      case PaymentStatus.cancelled:
        return 'Cancelado';
      case PaymentStatus.refunded:
        return 'Reembolsado';
    }
  }

  Color _getAmountColor(Payment payment) {
    // Lógica para determinar cor baseada no tipo de pagamento
    if (payment.type == PaymentType.contractPayment) {
      return AppTheme.successColor;
    } else if (payment.type == PaymentType.platformFee) {
      return AppTheme.warningColor;
    } else if (payment.type == PaymentType.refund) {
      return AppTheme.errorColor;
    }
    return AppTheme.textPrimary;
  }

  void _showPaymentDetails(Payment payment) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Detalhes do Pagamento'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildDetailRow('ID', payment.id),
            _buildDetailRow('Valor', 'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(payment.amount)}'),
            _buildDetailRow('Taxa da Plataforma', 'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(payment.platformFee)}'),
            _buildDetailRow('Valor Líquido', 'R\$ ${NumberFormat.currency(locale: 'pt_BR', symbol: '').format(payment.freelancerAmount)}'),
            _buildDetailRow('Método', payment.method.displayName),
            _buildDetailRow('Status', _getStatusText(payment.status)),
            _buildDetailRow('Data', DateFormat('dd/MM/yyyy HH:mm').format(payment.createdAt)),
            if (payment.pixCode != null) _buildDetailRow('Código PIX', payment.pixCode!),
            if (payment.transactionId != null) _buildDetailRow('ID da Transação', payment.transactionId!),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Fechar'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
