import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';
import { User, UserPublic, RegisterRequest, LoginRequest, AuthResponse } from '../domain/models/User';
import { UnauthorizedError, BadRequestError, ConflictError, NotFoundError } from '../errorHandling';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { logPublisher } from '../config/logPublisher';

const JWT_SECRET = process.env.JWT_SECRET || 'micro-donjon-jwt-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

export class AuthService {

  private toUserPublic(user: User): UserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      hero_id: user.hero_id,
      created_at: user.created_at
    };
  }
  private generateToken(userId: string): string {
    const payload = { userId };
    const secret = JWT_SECRET as Secret;
    // expiresIn doit être string littérale ou number, donc cast explicite pour TS v9+
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    if (logPublisher) {
      logPublisher.logAuthEvent('TOKEN_GENERATED', { userId });
    }
    return jwt.sign(payload, secret, options);
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { username, email, password } = data;

    if (!username || !email || !password) {
      if (logPublisher) {
        logPublisher.logError(new BadRequestError('Missing registration fields'), { data });
      }
      throw new BadRequestError('Username, email and password are required');
    }

    if (password.length < 6) {
      if (logPublisher) {
        logPublisher.logError(new BadRequestError('Password too short'), { data });
      }
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const pool = getPool();

    // Check if user already exists
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      if (logPublisher) {
        logPublisher.logError(new ConflictError('User already exists'), { data });
      }
      throw new ConflictError('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = uuidv4();
    await pool.execute<ResultSetHeader>(
      'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, username, email, passwordHash]
    );

    if (logPublisher) {
      logPublisher.logAuthEvent('USER_REGISTERED', { userId, username, email }); 
    }

    // Get created user
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0] as User;
    const token = this.generateToken(user.id);

    return {
      user: this.toUserPublic(user),
      token
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    if (!email || !password) {
      if (logPublisher) {
        logPublisher.logError(new BadRequestError('Missing login fields'), { data });
      }
      throw new BadRequestError('Email and password are required');
    }

    const pool = getPool();

    // Find user by email
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      if (logPublisher) {
        logPublisher.logError(new UnauthorizedError('Invalid email or password'), { email });
      }
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = users[0] as User;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      if (logPublisher) {
        logPublisher.logError(new UnauthorizedError('Invalid email or password'), { email });
      }
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user.id);
    if (logPublisher) {
      logPublisher.logAuthEvent('USER_LOGGED_IN', { userId: user.id, email }); 
    }
    return {
      user: this.toUserPublic(user),
      token
    };
  }

  async verifyToken(token: string): Promise<UserPublic> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      const pool = getPool();
      const [users] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        if (logPublisher) {
          logPublisher.logError(new UnauthorizedError('User not found'), { userId: decoded.userId });
        }
        throw new UnauthorizedError('User not found');
      }
      if (logPublisher) {
        logPublisher.logAuthEvent('TOKEN_VERIFIED', { userId: decoded.userId }); 
      }
      return this.toUserPublic(users[0] as User);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        if (logPublisher) {
          logPublisher.logError(error, { error });
        }
        throw error;
      }
      if (logPublisher) {
        logPublisher.logError(new UnauthorizedError('Invalid or expired token'), { error });
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  async getUserById(userId: string): Promise<UserPublic> {
    const pool = getPool();
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      if (logPublisher) {
        logPublisher.logError(new NotFoundError('User not found'), { userId });
      }
      throw new NotFoundError('User not found');
    }
    if (logPublisher) {
      logPublisher.logAuthEvent('USER_FETCHED', { userId }); 
    }
    return this.toUserPublic(users[0] as User);
  }

  async linkHeroToUser(userId: string, heroId: string): Promise<UserPublic> {
    const pool = getPool();

    // Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      if (logPublisher) {
        logPublisher.logError(new NotFoundError('User not found'), { userId });
      }
      throw new NotFoundError('User not found');
    }

    // Update user with hero_id
    await pool.execute<ResultSetHeader>(
      'UPDATE users SET hero_id = ? WHERE id = ?',
      [heroId, userId]
    );

    // Get updated user
    const [updatedUsers] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    if (logPublisher) {
      logPublisher.logAuthEvent('HERO_LINKED', { userId, heroId }); 
    }
    return this.toUserPublic(updatedUsers[0] as User);
  }

  async unlinkHeroFromUser(userId: string): Promise<UserPublic> {
    const pool = getPool();

    await pool.execute<ResultSetHeader>(
      'UPDATE users SET hero_id = NULL WHERE id = ?',
      [userId]
    );

    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      if (logPublisher) {
        logPublisher.logError(new NotFoundError('User not found'), { userId });
      }
      throw new NotFoundError('User not found');
    }
    if (logPublisher) {
      logPublisher.logAuthEvent('HERO_UNLINKED', { userId }); 
    }
    return this.toUserPublic(users[0] as User);
  }
}
