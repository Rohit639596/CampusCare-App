import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { uploadImage } from '../utils/cloudinary.js';

const createSchema = z.object({ title: z.string().min(3).max(120), description: z.string().min(10).max(5000), category: z.string().min(2).max(50), location: z.string().max(120).optional() });
const updateSchema = z.object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']), adminNote: z.string().max(1000).optional() });

const includeStudent = { student: { select: { id: true, name: true, email: true } } };

export async function createComplaint(req, res) {
  const data = createSchema.parse(req.body);
  let imageUrl = null;
  if (req.file) imageUrl = await uploadImage(req.file.buffer);
  const complaint = await prisma.complaint.create({ data: { ...data, imageUrl, studentId: req.user.id }, include: includeStudent });
  res.status(201).json({ complaint });
}

export async function listMyComplaints(req, res) {
  const complaints = await prisma.complaint.findMany({ where: { studentId: req.user.id }, orderBy: { createdAt: 'desc' }, include: includeStudent });
  res.json({ complaints });
}

export async function listAllComplaints(req, res) {
  const { status, category, q } = req.query;
  const complaints = await prisma.complaint.findMany({
    where: { ...(status && status !== 'ALL' ? { status } : {}), ...(category && category !== 'ALL' ? { category } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}) },
    orderBy: { createdAt: 'desc' }, include: includeStudent
  });
  res.json({ complaints });
}

export async function getComplaint(req, res) {
  const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id }, include: includeStudent });
  if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
  if (req.user.role !== 'ADMIN' && complaint.studentId !== req.user.id) return res.status(403).json({ message: 'Not authorized.' });
  res.json({ complaint });
}

export async function updateComplaint(req, res) {
  const data = updateSchema.parse(req.body);
  const complaint = await prisma.complaint.update({ where: { id: req.params.id }, data, include: includeStudent });
  res.json({ complaint });
}
