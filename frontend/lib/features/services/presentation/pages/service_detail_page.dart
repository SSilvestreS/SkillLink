import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ServiceDetailPage extends ConsumerWidget {
  final String serviceId;
  
  const ServiceDetailPage({
    super.key,
    required this.serviceId,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalhes do Serviço'),
      ),
      body: Center(
        child: Text('Detalhes do Serviço $serviceId - Em desenvolvimento'),
      ),
    );
  }
}
