import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';

import { Payment, PaymentStatus, PaymentMethod, PaymentType } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private notificationsService: NotificationsService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { amount, contractId, payerId, receiverId, method, description } = createPaymentDto;

    // Calcular taxas da plataforma (5% do valor)
    const platformFeeRate = 0.05;
    const platformFee = amount * platformFeeRate;
    const freelancerAmount = amount - platformFee;

    const payment = this.paymentRepository.create({
      amount,
      platformFee,
      freelancerAmount,
      currency: 'BRL',
      status: PaymentStatus.PENDING,
      method,
      type: PaymentType.CONTRACT_PAYMENT,
      payerId,
      receiverId,
      contractId,
      description,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Processar pagamento baseado no método
    switch (method) {
      case PaymentMethod.STRIPE_CARD:
        await this.processStripeCardPayment(savedPayment);
        break;
      case PaymentMethod.STRIPE_PIX:
        await this.processStripePixPayment(savedPayment);
        break;
      case PaymentMethod.PIX_DIRECT:
        await this.processDirectPixPayment(savedPayment);
        break;
      default:
        throw new BadRequestException('Método de pagamento não suportado');
    }

    return savedPayment;
  }

  private async processStripeCardPayment(payment: Payment): Promise<void> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100), // Stripe usa centavos
        currency: payment.currency.toLowerCase(),
        metadata: {
          paymentId: payment.id,
          contractId: payment.contractId || '',
        },
        description: payment.description,
      });

      payment.stripePaymentIntentId = paymentIntent.id;
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentRepository.save(payment);
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      payment.failedAt = new Date();
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  private async processStripePixPayment(payment: Payment): Promise<void> {
    try {
      // Criar PaymentIntent com PIX
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(payment.amount * 100),
        currency: payment.currency.toLowerCase(),
        payment_method_types: ['pix'],
        metadata: {
          paymentId: payment.id,
          contractId: payment.contractId || '',
        },
        description: payment.description,
      });

      payment.stripePaymentIntentId = paymentIntent.id;
      payment.status = PaymentStatus.PROCESSING;
      await this.paymentRepository.save(payment);

      // Obter dados do PIX
      const paymentIntentWithPix = await this.stripe.paymentIntents.retrieve(
        paymentIntent.id,
        { expand: ['payment_method'] }
      );

      if (paymentIntentWithPix.payment_method) {
        // Simular geração de código PIX (em produção, usar dados reais do Stripe)
        payment.pixCode = this.generatePixCode();
        payment.pixQrCode = `data:image/png;base64,${this.generateQrCodeBase64()}`;
        payment.pixExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
        await this.paymentRepository.save(payment);
      }
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      payment.failedAt = new Date();
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  private async processDirectPixPayment(payment: Payment): Promise<void> {
    // Simular processamento de PIX direto
    payment.pixCode = this.generatePixCode();
    payment.pixQrCode = `data:image/png;base64,${this.generateQrCodeBase64()}`;
    payment.pixExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    payment.status = PaymentStatus.PROCESSING;
    await this.paymentRepository.save(payment);
  }

  async confirmPayment(paymentId: string, stripePaymentIntentId?: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['payer', 'receiver', 'contract'],
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status !== PaymentStatus.PROCESSING) {
      throw new BadRequestException('Pagamento não está em processamento');
    }

    try {
      if (stripePaymentIntentId) {
        // Confirmar via Stripe
        const paymentIntent = await this.stripe.paymentIntents.retrieve(stripePaymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
          payment.status = PaymentStatus.COMPLETED;
          payment.processedAt = new Date();
          payment.stripeChargeId = paymentIntent.latest_charge as string;
        } else {
          throw new Error('Pagamento não foi confirmado no Stripe');
        }
      } else {
        // Confirmar PIX direto (simulação)
        payment.status = PaymentStatus.COMPLETED;
        payment.processedAt = new Date();
        payment.transactionId = this.generateTransactionId();
      }

      const savedPayment = await this.paymentRepository.save(payment);

      // Enviar notificação
      await this.notificationsService.notifyPaymentReceived(
        payment.receiverId,
        payment.freelancerAmount,
        payment.contract?.title || 'Pagamento recebido'
      );

      return savedPayment;
    } catch (error) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = error.message;
      payment.failedAt = new Date();
      await this.paymentRepository.save(payment);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: [
        { payerId: userId },
        { receiverId: userId },
      ],
      relations: ['payer', 'receiver', 'contract'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['payer', 'receiver', 'contract'],
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return payment;
  }

  async getPaymentStats(userId: string): Promise<{
    totalReceived: number;
    totalPaid: number;
    totalFees: number;
    pendingAmount: number;
  }> {
    const payments = await this.paymentRepository.find({
      where: [
        { receiverId: userId, status: PaymentStatus.COMPLETED },
        { payerId: userId, status: PaymentStatus.COMPLETED },
      ],
    });

    const totalReceived = payments
      .filter(p => p.receiverId === userId)
      .reduce((sum, p) => sum + Number(p.freelancerAmount), 0);

    const totalPaid = payments
      .filter(p => p.payerId === userId)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalFees = payments
      .filter(p => p.receiverId === userId)
      .reduce((sum, p) => sum + Number(p.platformFee), 0);

    const pendingPayments = await this.paymentRepository.find({
      where: { receiverId: userId, status: PaymentStatus.PROCESSING },
    });

    const pendingAmount = pendingPayments
      .reduce((sum, p) => sum + Number(p.freelancerAmount), 0);

    return {
      totalReceived,
      totalPaid,
      totalFees,
      pendingAmount,
    };
  }

  private generatePixCode(): string {
    // Simular geração de código PIX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateQrCodeBase64(): string {
    // Simular QR Code em base64 (em produção, usar biblioteca real)
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }

  private generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
