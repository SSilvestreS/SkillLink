import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';

class ServicesPage extends ConsumerWidget {
  const ServicesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Serviços'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Lista de Serviços - Em desenvolvimento'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/services/create'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
