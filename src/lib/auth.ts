import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = async (token: string): Promise<any> => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const protect = async (req: NextRequest, res: NextResponse) => {
  let token;

  if (req.headers.get('authorization')?.startsWith('Bearer')) {
    token = req.headers.get('authorization')?.split(' ')[1];
  }

  if (!token) {
    return NextResponse.json(
      { message: 'Not authorized, no token' },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: 'Not authorized, token failed' },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { message: 'Not authorized, user not found' },
        { status: 401 }
      );
    }

    return user;
  } catch (error) {
    return NextResponse.json(
      { message: 'Not authorized, token failed' },
      { status: 401 }
    );
  }
}; 