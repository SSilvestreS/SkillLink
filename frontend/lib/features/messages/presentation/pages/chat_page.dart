import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChatPage extends ConsumerWidget {
  final String contractId;
  
  const ChatPage({
    super.key,
    required this.contractId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chat'),
      ),
      body: Center(
        child: Text('Chat do Contrato $contractId - Em desenvolvimento'),
      ),
    );
  }
}
