import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class CreateServicePage extends ConsumerWidget {
  const CreateServicePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Criar Serviço'),
      ),
      body: const Center(
        child: Text('Criar Serviço - Em desenvolvimento'),
      ),
    );
  }
}
