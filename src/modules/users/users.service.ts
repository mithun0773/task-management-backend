import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'; // ✅ FIX 1: Import bcrypt
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role: true,
        avatar_url: true,
        created_at: true,
      },
      order: { created_at: 'DESC' },
    });
  }

  // async findByEmail(email: string): Promise<User | null> {
  //   return this.userRepository.findOne({ where: { email } });
  // }

  async findByEmail(email: string): Promise<User | null> {
    console.log('=== Repository Test ===');

    // 1. Raw SQL through repository
    const raw = await this.userRepository.query(
      'SELECT current_database(), current_schema()',
    );
    console.log(raw);

    // 2. List tables visible to this repository
    const tables = await this.userRepository.query(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);
    console.log(tables);

    // 3. Query users using raw SQL
    const users = await this.userRepository.query(
      'SELECT id, email FROM public.users',
    );
    console.log(users);

    // 4. Original query
    return this.userRepository.findOne({
      where: { email },
    });
  }
  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // If email is being changed, check for duplicates
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const { password, ...dtoWithoutPassword } = updateUserDto;

    const dataToUpdate: Partial<User> = { ...dtoWithoutPassword };

    if (password) {
      dataToUpdate.password_hash = await bcrypt.hash(password, 10);
    }

    Object.assign(user, dataToUpdate);
    return this.userRepository.save(user);
  }
}
