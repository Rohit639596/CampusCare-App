import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const adminRegisterSchema = registerSchema.extend({
  adminKey: z.string().min(1)
});

const forgotSchema = z.object({
  email: z.string().email()
});

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(72)
});

function sign(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h'
    }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}


// =====================================================
// STUDENT REGISTER
// =====================================================

export async function register(req, res) {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(409).json({
        message: 'Email is already registered.'
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'STUDENT'
      }
    });

    const safe = safeUser(user);

    res.status(201).json({
      token: sign(safe),
      user: safe
    });
  } catch (error) {
    console.error('Student register error:', error);

    res.status(400).json({
      message: error.message || 'Unable to create student account.'
    });
  }
}


// =====================================================
// ADMIN REGISTER
// =====================================================

export async function adminRegister(req, res) {
  try {
    const data = adminRegisterSchema.parse(req.body);

    if (
      !process.env.ADMIN_REGISTRATION_KEY ||
      data.adminKey !== process.env.ADMIN_REGISTRATION_KEY
    ) {
      return res.status(403).json({
        message: 'Invalid admin registration key.'
      });
    }

    const email = data.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email }
    });

    if (exists) {
      return res.status(409).json({
        message: 'Email is already registered.'
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'ADMIN'
      }
    });

    const safe = safeUser(user);

    res.status(201).json({
      token: sign(safe),
      user: safe
    });
  } catch (error) {
    console.error('Admin register error:', error);

    res.status(400).json({
      message: error.message || 'Unable to create admin account.'
    });
  }
}


// =====================================================
// STUDENT LOGIN
// =====================================================

export async function login(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (
      !user ||
      user.role !== 'STUDENT' ||
      !(await bcrypt.compare(data.password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Invalid student email or password.'
      });
    }

    const safe = safeUser(user);

    res.json({
      token: sign(safe),
      user: safe
    });
  } catch (error) {
    console.error('Student login error:', error);

    res.status(400).json({
      message: error.message || 'Unable to login.'
    });
  }
}


// =====================================================
// ADMIN LOGIN
// =====================================================

export async function adminLogin(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (
      !user ||
      user.role !== 'ADMIN' ||
      !(await bcrypt.compare(data.password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Invalid admin email or password.'
      });
    }

    const safe = safeUser(user);

    res.json({
      token: sign(safe),
      user: safe
    });
  } catch (error) {
    console.error('Admin login error:', error);

    res.status(400).json({
      message: error.message || 'Unable to login.'
    });
  }
}


// =====================================================
// STUDENT FORGOT PASSWORD
// =====================================================

export async function studentForgotPassword(req, res) {
  try {
    const data = forgotSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        message: 'No student account found with this email.'
      });
    }

    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash,
        resetCodeExpiresAt: expiresAt
      }
    });

    console.log('\n====================================');
    console.log(' CAMPUSCARE STUDENT PASSWORD RESET');
    console.log('====================================');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Reset Code: ${resetCode}`);
    console.log('Valid for: 10 minutes');
    console.log('====================================\n');

    res.json({
      message: 'Reset code generated successfully.',
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Student forgot password error:', error);

    res.status(400).json({
      message: error.message || 'Unable to process request.'
    });
  }
}


// =====================================================
// ADMIN FORGOT PASSWORD
// =====================================================

export async function adminForgotPassword(req, res) {
  try {
    const data = forgotSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(404).json({
        message: 'No admin account found with this email.'
      });
    }

    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash,
        resetCodeExpiresAt: expiresAt
      }
    });

    console.log('\n====================================');
    console.log(' CAMPUSCARE ADMIN PASSWORD RESET');
    console.log('====================================');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Reset Code: ${resetCode}`);
    console.log('Valid for: 10 minutes');
    console.log('====================================\n');

    res.json({
      message: 'Admin reset code generated successfully.',
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Admin forgot password error:', error);

    res.status(400).json({
      message: error.message || 'Unable to process request.'
    });
  }
}


// =====================================================
// STUDENT RESET PASSWORD
// =====================================================

export async function studentResetPassword(req, res) {
  return resetPasswordForRole(req, res, 'STUDENT');
}


// =====================================================
// ADMIN RESET PASSWORD
// =====================================================

export async function adminResetPassword(req, res) {
  return resetPasswordForRole(req, res, 'ADMIN');
}


// =====================================================
// RESET PASSWORD HELPER
// =====================================================

async function resetPasswordForRole(req, res, expectedRole) {
  try {
    const data = resetSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== expectedRole) {
      return res.status(400).json({
        message: 'Invalid reset request.'
      });
    }

    if (
      !user.resetCodeHash ||
      !user.resetCodeExpiresAt
    ) {
      return res.status(400).json({
        message: 'Reset code is invalid or expired.'
      });
    }

    if (new Date() > user.resetCodeExpiresAt) {
      return res.status(400).json({
        message: 'Reset code has expired. Please request a new code.'
      });
    }

    const incomingCodeHash = crypto
      .createHash('sha256')
      .update(data.code)
      .digest('hex');

    if (incomingCodeHash !== user.resetCodeHash) {
      return res.status(400).json({
        message: 'Incorrect reset code.'
      });
    }

    const passwordHash = await bcrypt.hash(
      data.newPassword,
      12
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCodeHash: null,
        resetCodeExpiresAt: null
      }
    });

    res.json({
      message:
        'Password changed successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);

    res.status(400).json({
      message: error.message || 'Unable to reset password.'
    });
  }
}


// =====================================================
// CURRENT USER
// =====================================================

export async function me(req, res) {
  res.json({
    user: req.user
  });
}