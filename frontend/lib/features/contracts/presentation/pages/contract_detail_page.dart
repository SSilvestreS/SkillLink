import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ContractDetailPage extends ConsumerWidget {
  final String contractId;
  
  const ContractDetailPage({
    super.key,
    required this.contractId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhes do Contrato'),
      ),
      body: Center(
        child: Text('Detalhes do Contrato $contractId - Em desenvolvimento'),
      ),
    );
  }
}
