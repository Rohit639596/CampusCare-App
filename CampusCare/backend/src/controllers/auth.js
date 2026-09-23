import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { sendResetCodeEmail } from '../utils/mailer.js';

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminRegisterSchema = registerSchema.extend({
  adminKey: z.string().min(1),
});

const wardenRegisterSchema = registerSchema.extend({
  wardenKey: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8).max(72),
});

function sign(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2h',
    }
  );
}

function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
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
      where: { email },
    });

    if (exists) {
      return res.status(409).json({
        message: 'Email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'STUDENT',
      },
    });

    const safe = safeUser(user);

    res.status(201).json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Student register error:', error);

    res.status(400).json({
      message: error.message || 'Unable to create student account.',
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
        message: 'Invalid admin registration key.',
      });
    }

    const email = data.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(409).json({
        message: 'Email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'ADMIN',
      },
    });

    const safe = safeUser(user);

    res.status(201).json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Admin register error:', error);

    res.status(400).json({
      message: error.message || 'Unable to create admin account.',
    });
  }
}

// =====================================================
// WARDEN REGISTER
// =====================================================

export async function wardenRegister(req, res) {
  try {
    const data = wardenRegisterSchema.parse(req.body);

    if (
      !process.env.WARDEN_REGISTRATION_KEY ||
      data.wardenKey !== process.env.WARDEN_REGISTRATION_KEY
    ) {
      return res.status(403).json({
        message: 'Invalid warden registration key.',
      });
    }

    const email = data.email.toLowerCase().trim();

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      return res.status(409).json({
        message: 'Email is already registered.',
      });
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12
    );

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'WARDEN',
      },
    });

    const safe = safeUser(user);

    res.status(201).json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Warden register error:', error);

    res.status(400).json({
      message:
        error.message || 'Unable to create warden account.',
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
      where: { email },
    });

    if (
      !user ||
      user.role !== 'STUDENT' ||
      !(await bcrypt.compare(data.password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Invalid student email or password.',
      });
    }

    const safe = safeUser(user);

    res.json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Student login error:', error);

    res.status(400).json({
      message: error.message || 'Unable to login.',
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
      where: { email },
    });

    if (
      !user ||
      user.role !== 'ADMIN' ||
      !(await bcrypt.compare(data.password, user.passwordHash))
    ) {
      return res.status(401).json({
        message: 'Invalid admin email or password.',
      });
    }

    const safe = safeUser(user);

    res.json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Admin login error:', error);

    res.status(400).json({
      message: error.message || 'Unable to login.',
    });
  }
}

// =====================================================
// WARDEN LOGIN
// =====================================================

export async function wardenLogin(req, res) {
  try {
    const data = loginSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      user.role !== 'WARDEN' ||
      !(await bcrypt.compare(
        data.password,
        user.passwordHash
      ))
    ) {
      return res.status(401).json({
        message: 'Invalid warden email or password.',
      });
    }

    const safe = safeUser(user);

    res.json({
      token: sign(safe),
      user: safe,
    });
  } catch (error) {
    console.error('Warden login error:', error);

    res.status(400).json({
      message: error.message || 'Unable to login.',
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
      where: { email },
    });

    if (!user || user.role !== 'STUDENT') {
      return res.status(404).json({
        message: 'No student account found with this email.',
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash reset code before storing it
    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    // Code valid for 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save hashed code in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash,
        resetCodeExpiresAt: expiresAt,
      },
    });

    // Send code to student's registered email
    try {
      await sendResetCodeEmail({
        to: user.email,
        name: user.name,
        code: resetCode,
        role: 'STUDENT',
      });
    } catch (emailError) {
      console.error(
        'Failed to send student reset email:',
        emailError
      );

      // Remove reset code if email failed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCodeHash: null,
          resetCodeExpiresAt: null,
        },
      });

      return res.status(500).json({
        message:
          'Unable to send verification code. Please try again later.',
      });
    }

    res.json({
      message:
        'Verification code sent to your registered email.',
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      'Student forgot password error:',
      error
    );

    res.status(400).json({
      message:
        error.message || 'Unable to process request.',
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
      where: { email },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(404).json({
        message: 'No admin account found with this email.',
      });
    }

    // Generate 6-digit reset code
    const resetCode = crypto
      .randomInt(100000, 1000000)
      .toString();

    // Hash reset code before storing it
    const resetCodeHash = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');

    // Code valid for 10 minutes
    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    // Save hashed code in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCodeHash,
        resetCodeExpiresAt: expiresAt,
      },
    });

    // Send code to admin's registered email
    try {
      await sendResetCodeEmail({
        to: user.email,
        name: user.name,
        code: resetCode,
        role: 'ADMIN',
      });
    } catch (emailError) {
      console.error(
        'Failed to send admin reset email:',
        emailError
      );

      // Remove reset code if email failed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCodeHash: null,
          resetCodeExpiresAt: null,
        },
      });

      return res.status(500).json({
        message:
          'Unable to send verification code. Please try again later.',
      });
    }

    res.json({
      message:
        'Verification code sent to your registered email.',
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      'Admin forgot password error:',
      error
    );

    res.status(400).json({
      message:
        error.message || 'Unable to process request.',
    });
  }
}

// =====================================================
// WARDEN FORGOT PASSWORD
// =====================================================

export async function wardenForgotPassword(req, res) {
  try {
    const data = forgotSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'WARDEN') {
      return res.status(404).json({
        message: 'No warden account found with this email.',
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
        resetCodeExpiresAt: expiresAt,
      },
    });

    try {
      await sendResetCodeEmail({
        to: user.email,
        name: user.name,
        code: resetCode,
        role: 'WARDEN',
      });
    } catch (emailError) {
      console.error(
        'Failed to send warden reset email:',
        emailError
      );

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetCodeHash: null,
          resetCodeExpiresAt: null,
        },
      });

      return res.status(500).json({
        message:
          'Unable to send verification code. Please try again later.',
      });
    }

    res.json({
      message:
        'Verification code sent to your registered email.',
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      'Warden forgot password error:',
      error
    );

    res.status(400).json({
      message:
        error.message || 'Unable to process request.',
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
// WARDEN RESET PASSWORD
// =====================================================

export async function wardenResetPassword(req, res) {
  return resetPasswordForRole(
    req,
    res,
    'WARDEN'
  );
}

// =====================================================
// RESET PASSWORD HELPER
// =====================================================

async function resetPasswordForRole(
  req,
  res,
  expectedRole
) {
  try {
    const data = resetSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== expectedRole) {
      return res.status(400).json({
        message: 'Invalid reset request.',
      });
    }

    if (
      !user.resetCodeHash ||
      !user.resetCodeExpiresAt
    ) {
      return res.status(400).json({
        message:
          'Reset code is invalid or expired.',
      });
    }

    // Check expiry
    if (new Date() > user.resetCodeExpiresAt) {
      return res.status(400).json({
        message:
          'Reset code has expired. Please request a new code.',
      });
    }

    // Hash code entered by user
    const incomingCodeHash = crypto
      .createHash('sha256')
      .update(data.code)
      .digest('hex');

    // Compare hashes
    if (incomingCodeHash !== user.resetCodeHash) {
      return res.status(400).json({
        message: 'Incorrect reset code.',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(
      data.newPassword,
      12
    );

    // Update password and remove used reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetCodeHash: null,
        resetCodeExpiresAt: null,
      },
    });

    res.json({
      message:
        'Password changed successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error(
      'Reset password error:',
      error
    );

    res.status(400).json({
      message:
        error.message || 'Unable to reset password.',
    });
  }
}

// =====================================================
// CURRENT USER
// =====================================================

export async function me(req, res) {
  res.json({
    user: req.user,
  });
}