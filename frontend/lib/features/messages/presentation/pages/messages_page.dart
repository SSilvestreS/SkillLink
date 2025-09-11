import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MessagesPage extends ConsumerWidget {
  const MessagesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mensagens'),
      ),
      body: const Center(
        child: Text('Lista de Mensagens - Em desenvolvimento'),
      ),
    );
  }
}
