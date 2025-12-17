import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码是必填项' },
        { status: 400 }
      );
    }

    // 查询用户是否存在
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length > 0) {
      // 用户存在，验证密码
      const user = userResult.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        // 更新最后登录时间
        const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        await pool.query(
          'UPDATE users SET last_login = NOW(), last_login_ip = $1 WHERE user_id = $2',
          [clientIp, user.user_id]
        );

        return NextResponse.json(
          { 
            success: true, 
            message: '登录成功',
            user: {
              user_id: user.user_id,
              email: user.email,
              username: user.username
            }
          },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: '密码错误' },
          { status: 401 }
        );
      }
    } else {
      // 用户不存在，创建新用户
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userId = uuidv4();
      const username = email.split('@')[0]; // 使用邮箱前缀作为默认用户名

      await pool.query(
        `INSERT INTO users (
          user_id, username, email, password, salt, status, 
          created_at, updated_at, last_login
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())`,
        [userId, username, email, hashedPassword, salt, 'active']
      );

      return NextResponse.json(
        { 
          success: true, 
          message: '用户创建成功并登录',
          user: {
            user_id: userId,
            email,
            username
          }
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}