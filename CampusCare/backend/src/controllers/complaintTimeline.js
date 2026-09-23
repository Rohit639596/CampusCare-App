import { prisma } from '../utils/prisma.js';

export async function getComplaintTimeline(req, res) {
  try {
    const { id } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        studentId: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.',
      });
    }

    // Student can only see own complaint
    if (
      req.user.role === 'STUDENT' &&
      complaint.studentId !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You are not allowed to view this complaint.',
      });
    }

    const timeline =
      await prisma.complaintStatusHistory.findMany({
        where: {
          complaintId: id,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          changedBy: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });

    return res.json({
      timeline,
    });
  } catch (error) {
    console.error(
      'Get complaint timeline error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to fetch complaint timeline.',
    });
  }
}