import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    const review = this.reviewRepository.create({
      ...createReviewDto,
      reviewerId,
    });

    return this.reviewRepository.save(review);
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { reviewedId: userId },
      relations: ['reviewer', 'contract'],
    });
  }

  async findByContract(contractId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { contractId },
      relations: ['reviewer', 'reviewed'],
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['reviewer', 'reviewed', 'contract'],
    });

    if (!review) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    return review;
  }

  async update(id: string, updateData: Partial<CreateReviewDto>, userId: string): Promise<Review> {
    const review = await this.findOne(id);

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Você só pode editar suas próprias avaliações');
    }

    Object.assign(review, updateData);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, userId: string): Promise<void> {
    const review = await this.findOne(id);

    if (review.reviewerId !== userId) {
      throw new ForbiddenException('Você só pode remover suas próprias avaliações');
    }

    await this.reviewRepository.remove(review);
  }

  async getAverageRating(userId: string): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.reviewedId = :userId', { userId })
      .getRawOne();

    return parseFloat(result.average) || 0;
  }
}
