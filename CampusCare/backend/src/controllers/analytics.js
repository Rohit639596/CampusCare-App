import { prisma } from '../utils/prisma.js';

export async function getAdminAnalytics(req, res) {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        message: 'Admin access required.',
      });
    }

    const [
      total,
      pending,
      inProgress,
      resolved,
      rejected,
    ] = await Promise.all([
      prisma.complaint.count(),

      prisma.complaint.count({
        where: {
          status: 'PENDING',
        },
      }),

      prisma.complaint.count({
        where: {
          status: 'IN_PROGRESS',
        },
      }),

      prisma.complaint.count({
        where: {
          status: 'RESOLVED',
        },
      }),

      prisma.complaint.count({
        where: {
          status: 'REJECTED',
        },
      }),
    ]);


    const categoryData =
      await prisma.complaint.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      });


    const priorityData =
      await prisma.complaint.groupBy({
        by: ['aiPriority'],
        _count: {
          aiPriority: true,
        },
        orderBy: {
          _count: {
            aiPriority: 'desc',
          },
        },
      });


    const feedbackStats =
      await prisma.complaintFeedback.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });


    return res.json({
      overview: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
      },

      categories: categoryData,

      priorities: priorityData,

      feedback: {
        averageRating:
          feedbackStats._avg.rating || 0,

        totalReviews:
          feedbackStats._count.rating || 0,
      },
    });
  } catch (error) {
    console.error(
      'Admin analytics error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to fetch analytics.',
    });
  }
}