import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';

const registerSchema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), password: z.string().min(8).max(72) });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const email = data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email is already registered.' });
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({ data: { name: data.name.trim(), email, passwordHash }, select: { id: true, name: true, email: true, role: true } });
  res.status(201).json({ token: sign(user), user });
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.json({ token: sign(safeUser), user: safeUser });
}

export async function me(req, res) { res.json({ user: req.user }); }
