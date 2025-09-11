import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ContractsPage extends ConsumerWidget {
  const ContractsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contratos'),
      ),
      body: const Center(
        child: Text('Lista de Contratos - Em desenvolvimento'),
      ),
    );
  }
}
