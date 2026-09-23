import { prisma } from '../utils/prisma.js';

export async function createFeedback(req, res) {
  try {
    const { complaintId } = req.params;
    const { rating, comment } = req.body;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Rating must be between 1 and 5.',
      });
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: complaintId,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.',
      });
    }

    if (complaint.studentId !== req.user.id) {
      return res.status(403).json({
        message: 'You can only review your own complaint.',
      });
    }

    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({
        message:
          'Feedback can only be submitted for resolved complaints.',
      });
    }

    const existingFeedback =
      await prisma.complaintFeedback.findUnique({
        where: {
          complaintId,
        },
      });

    if (existingFeedback) {
      return res.status(409).json({
        message: 'Feedback has already been submitted.',
      });
    }

    const feedback =
      await prisma.complaintFeedback.create({
        data: {
          complaintId,
          studentId: req.user.id,
          rating,
          comment: comment?.trim() || null,
        },
      });

    return res.status(201).json({
      message: 'Feedback submitted successfully.',
      feedback,
    });
  } catch (error) {
    console.error('Create feedback error:', error);

    return res.status(500).json({
      message: 'Failed to submit feedback.',
    });
  }
}


export async function getComplaintFeedback(req, res) {
  try {
    const { complaintId } = req.params;

    const feedback =
      await prisma.complaintFeedback.findUnique({
        where: {
          complaintId,
        },
        include: {
          student: {
            select: {
              name: true,
            },
          },
        },
      });

    if (!feedback) {
      return res.status(404).json({
        message: 'Feedback not found.',
      });
    }

    return res.json({
      feedback,
    });
  } catch (error) {
    console.error(
      'Get complaint feedback error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to fetch feedback.',
    });
  }
}