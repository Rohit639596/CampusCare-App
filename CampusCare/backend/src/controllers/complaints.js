import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { uploadImage } from '../utils/cloudinary.js';
import { analyzeComplaint } from '../ai/complaintAnalyzer.js';
import { detectDuplicateComplaint } from '../ai/duplicateDetector.js';

// ============================================================
// CREATE COMPLAINT SCHEMA
// ============================================================

const createSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(5000),
  category: z.string().min(2).max(50),
  location: z.string().max(120).optional(),
  department: z.enum([
    'HOSTEL',
    'ACADEMICS',
    'FEES',
    'LIBRARY',
    'TRANSPORT',
    'INFRASTRUCTURE',
    'IT',
    'OTHER'
  ]).default('OTHER')
});

// ============================================================
// ADMIN UPDATE SCHEMA
// ============================================================

const updateSchema = z.object({
  status: z.enum([
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED'
  ]),

  adminNote: z.string().max(1000).optional()
});


// ============================================================
// STUDENT INCLUDE
// ============================================================

const includeStudent = {
  student: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
};


// ============================================================
// CREATE COMPLAINT
// POST /complaints
// STUDENT
// ============================================================

export async function createComplaint(req, res) {
  try {
    const data = createSchema.parse({
      ...req.body,

      location:
        req.body.location || undefined
    });

    let imageUrl = null;

    // --------------------------------------------------------
    // IMAGE UPLOAD
    // --------------------------------------------------------

    if (req.file) {
      try {
        imageUrl = await uploadImage(req.file.buffer);
      } catch (error) {
        console.error(
          'Image upload error:',
          error.message
        );

        return res.status(500).json({
          message: 'Failed to upload complaint image.'
        });
      }
    }


    // --------------------------------------------------------
    // CREATE COMPLAINT
    // --------------------------------------------------------
    
    console.log('COMPLAINT DATA BEFORE CREATE:', data);
    const complaint = await prisma.complaint.create({
      data: {
        ...data,

        imageUrl,

        studentId: req.user.id
      },

      include: includeStudent
    });


    // --------------------------------------------------------
    // AI COMPLAINT ANALYSIS
    // --------------------------------------------------------

  let aiResult = null;

try {
  aiResult = await analyzeComplaint({
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    location: complaint.location
  });
} catch (error) {
  console.error(
    'AI complaint analysis error:',
    error.message
  );
}


    // --------------------------------------------------------
    // UPDATE AI RESULT IF AVAILABLE
    // --------------------------------------------------------

   if (aiResult) {
  try {
    await prisma.complaint.update({
      where: {
        id: complaint.id
      },

      data: {
        aiCategory: aiResult.category,
        aiPriority: aiResult.priority,
        aiSentiment: aiResult.sentiment,
        aiUrgency: aiResult.urgency,
        aiSummary: aiResult.summary,
        aiRecommendation: aiResult.recommendation
      }
    });
  } catch (error) {
    console.error(
      'AI result save error:',
      error.message
    );
  }
}


    // --------------------------------------------------------
    // DUPLICATE COMPLAINT DETECTION
    // --------------------------------------------------------

    try {
      const duplicateResult =
        await detectDuplicateComplaint({
          complaintId: complaint.id,

          title: complaint.title,

          description: complaint.description,

          category: complaint.category,

          studentId: complaint.studentId
        });

      if (duplicateResult) {
        const updateData = {};

        if (duplicateResult.duplicateComplaintId) {
          updateData.duplicateComplaintId =
            duplicateResult.duplicateComplaintId;
        }

        if (
          duplicateResult.similarity !== undefined &&
          duplicateResult.similarity !== null
        ) {
          updateData.duplicateSimilarity =
            duplicateResult.similarity;
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.complaint.update({
            where: {
              id: complaint.id
            },

            data: updateData
          });
        }
      }
    } catch (error) {
      console.error(
        'Duplicate detection error:',
        error.message
      );
    }


    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    const finalComplaint =
      await prisma.complaint.findUnique({
        where: {
          id: complaint.id
        },

        include: includeStudent
      });

    res.status(201).json({
      message: 'Complaint submitted successfully.',

      complaint: finalComplaint
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid complaint data.',

        errors: error.flatten()
      });
    }

    console.error(
      'Create complaint error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to create complaint.'
    });
  }
}


// ============================================================
// LIST MY COMPLAINTS
// GET /complaints/mine
// STUDENT
// ============================================================

export async function listMyComplaints(req, res) {
  try {
    const complaints =
      await prisma.complaint.findMany({
        where: {
          studentId: req.user.id
        },

        orderBy: {
          createdAt: 'desc'
        }
      });

    res.json({
      complaints
    });

  } catch (error) {
    console.error(
      'Student complaint list error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to fetch your complaints.'
    });
  }
}


// ============================================================
// LIST ALL COMPLAINTS
// GET /complaints
// ADMIN
// ============================================================

export async function listAllComplaints(req, res) {
  try {
    const {
      status,
      department,
      q
    } = req.query;


    const complaints =
      await prisma.complaint.findMany({
      where: {
  ...(status && status !== 'ALL'
    ? {
        status
      }
    : {}),

  department:
    department &&
    department !== 'ALL' &&
    department !== 'HOSTEL'
      ? department
      : {
          not: 'HOSTEL'
        },

  ...(q
    ? {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            location: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      }
    : {})
},

        orderBy: {
          createdAt: 'desc'
        },

        include: includeStudent
      });


    res.json({
      complaints
    });

  } catch (error) {
    console.error(
      'Admin complaint list error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to fetch complaints.'
    });
  }
}


// ============================================================
// GET SINGLE COMPLAINT
// GET /complaints/:id
// COMMON
// ============================================================

export async function getComplaint(req, res) {
  try {
    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: req.params.id
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },

          statusHistory: {
            orderBy: {
              createdAt: 'asc'
            },

            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          },

          escalations: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });


    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }


    // --------------------------------------------------------
    // STUDENT CAN ONLY SEE OWN COMPLAINT
    // --------------------------------------------------------

    if (
      req.user.role === 'STUDENT' &&
      complaint.studentId !== req.user.id
    ) {
      return res.status(403).json({
        message: 'You are not authorized to view this complaint.'
      });
    }


    res.json({
      complaint
    });

  } catch (error) {
    console.error(
      'Get complaint error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to fetch complaint.'
    });
  }
}


// ============================================================
// UPDATE COMPLAINT
// PATCH /complaints/:id
// ADMIN
// ============================================================

export async function updateComplaint(req, res) {
  try {
    const data = updateSchema.parse(req.body);


    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: req.params.id
        }
      });


    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }


    const oldStatus = complaint.status;


    // --------------------------------------------------------
    // UPDATE COMPLAINT
    // --------------------------------------------------------

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaint.id
        },

        data: {
          status: data.status,

          adminNote:
            data.adminNote !== undefined
              ? data.adminNote
              : complaint.adminNote
        },

        include: includeStudent
      });


    // --------------------------------------------------------
    // STATUS HISTORY
    // --------------------------------------------------------

    if (oldStatus !== data.status) {
      try {
        await prisma.complaintStatusHistory.create({
          data: {
            complaintId: complaint.id,

            oldStatus,

            newStatus: data.status,

            changedById: req.user.id
          }
        });
      } catch (error) {
        console.error(
          'Status history error:',
          error.message
        );
      }
    }


    // --------------------------------------------------------
    // NOTIFY STUDENT
    // --------------------------------------------------------

    try {
      await prisma.notification.create({
        data: {
          userId: complaint.studentId,

          complaintId: complaint.id,

          type: 'COMPLAINT_STATUS',

          title: 'Complaint Status Updated',

          message:
            `Your complaint "${complaint.title}" ` +
            `status has been changed to ${data.status}.`
        }
      });
    } catch (error) {
      console.error(
        'Notification error:',
        error.message
      );
    }


    res.json({
      message: 'Complaint updated successfully.',

      complaint: updatedComplaint
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid update data.',

        errors: error.flatten()
      });
    }

    console.error(
      'Update complaint error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to update complaint.'
    });
  }
}


// ============================================================
// WARDEN UPDATE SCHEMA
// ============================================================

const wardenUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED'
  ]),

  adminNote: z.string().max(1000).optional()
});


// ============================================================
// WARDEN ESCALATION SCHEMA
// ============================================================

const wardenEscalateSchema = z.object({
  reason: z.string().min(5).max(1000),

  message: z.string().max(1000).optional()
});


// ============================================================
// LIST WARDEN COMPLAINTS
// GET /complaints/warden
// WARDEN
// ONLY HOSTEL COMPLAINTS
// ============================================================

export async function listWardenComplaints(req, res) {
  try {
    const {
      status,
      q
    } = req.query;


    const complaints =
      await prisma.complaint.findMany({
        where: {
          department: 'HOSTEL',

          ...(status && status !== 'ALL'
            ? {
                status
              }
            : {}),

          ...(q
            ? {
                OR: [
                  {
                    title: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  },

                  {
                    description: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  },

                  {
                    location: {
                      contains: q,
                      mode: 'insensitive'
                    }
                  }
                ]
              }
            : {})
        },

        orderBy: {
          createdAt: 'desc'
        },

        include: includeStudent
      });


    res.json({
      complaints
    });

  } catch (error) {
    console.error(
      'Warden complaint list error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to fetch hostel complaints.'
    });
  }
}


// ============================================================
// GET WARDEN COMPLAINT
// GET /complaints/warden/:id
// WARDEN
// ============================================================

export async function getWardenComplaint(req, res) {
  try {
    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: req.params.id
        },

        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },

          statusHistory: {
            orderBy: {
              createdAt: 'asc'
            },

            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          },

          escalations: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });


    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }


    // --------------------------------------------------------
    // WARDEN CAN ONLY ACCESS HOSTEL COMPLAINTS
    // --------------------------------------------------------

    if (complaint.department !== 'HOSTEL') {
      return res.status(403).json({
        message:
          'Warden can only access hostel complaints.'
      });
    }


    res.json({
      complaint
    });

  } catch (error) {
    console.error(
      'Warden complaint detail error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to fetch hostel complaint.'
    });
  }
}


// ============================================================
// UPDATE WARDEN COMPLAINT
// PATCH /complaints/warden/:id
// WARDEN
// ============================================================

export async function updateWardenComplaint(req, res) {
  try {
    const data =
      wardenUpdateSchema.parse(req.body);


    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: req.params.id
        }
      });


    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }


    // --------------------------------------------------------
    // ONLY HOSTEL COMPLAINTS
    // --------------------------------------------------------

    if (complaint.department !== 'HOSTEL') {
      return res.status(403).json({
        message:
          'Warden can only update hostel complaints.'
      });
    }


    const oldStatus = complaint.status;


    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaint.id
        },

        data: {
          status: data.status,

          adminNote:
            data.adminNote !== undefined
              ? data.adminNote
              : complaint.adminNote
        },

        include: includeStudent
      });


    // --------------------------------------------------------
    // STATUS HISTORY
    // --------------------------------------------------------

    if (oldStatus !== data.status) {
      try {
        await prisma.complaintStatusHistory.create({
          data: {
            complaintId: complaint.id,

            oldStatus,

            newStatus: data.status,

            changedById: req.user.id
          }
        });
      } catch (error) {
        console.error(
          'Warden status history error:',
          error.message
        );
      }
    }


    // --------------------------------------------------------
    // NOTIFY STUDENT
    // --------------------------------------------------------

    try {
      await prisma.notification.create({
        data: {
          userId: complaint.studentId,

          complaintId: complaint.id,

          type: 'COMPLAINT_STATUS',

          title: 'Complaint Status Updated',

          message:
            `Your hostel complaint "${complaint.title}" ` +
            `status has been changed to ${data.status}.`
        }
      });
    } catch (error) {
      console.error(
        'Warden notification error:',
        error.message
      );
    }


    res.json({
      message:
        'Hostel complaint updated successfully.',

      complaint: updatedComplaint
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid update data.',

        errors: error.flatten()
      });
    }

    console.error(
      'Warden update complaint error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to update hostel complaint.'
    });
  }
}


// ============================================================
// ESCALATE WARDEN COMPLAINT
// POST /complaints/warden/:id/escalate
// WARDEN
// HOSTEL -> HOD
// ============================================================

export async function escalateWardenComplaint(req, res) {
  try {
    const data =
      wardenEscalateSchema.parse(req.body);


    const complaint =
      await prisma.complaint.findUnique({
        where: {
          id: req.params.id
        }
      });


    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }


    // --------------------------------------------------------
    // ONLY HOSTEL COMPLAINTS
    // --------------------------------------------------------

    if (complaint.department !== 'HOSTEL') {
      return res.status(403).json({
        message:
          'Warden can only escalate hostel complaints.'
      });
    }


    // --------------------------------------------------------
    // ALREADY ESCALATED
    // --------------------------------------------------------

    if (complaint.escalationLevel >= 1) {
      return res.status(400).json({
        message:
          'This complaint has already been escalated.'
      });
    }


    const now = new Date();


    // --------------------------------------------------------
    // UPDATE ESCALATION INFORMATION
    // --------------------------------------------------------

    const updatedComplaint =
      await prisma.complaint.update({
        where: {
          id: complaint.id
        },

        data: {
          escalationLevel: 1,

          escalatedAt: now,

          escalationReason: data.reason
        },

        include: includeStudent
      });


    // --------------------------------------------------------
    // CREATE ESCALATION HISTORY
    // --------------------------------------------------------

    await prisma.complaintEscalation.create({
      data: {
        complaintId: complaint.id,

        studentId: complaint.studentId,

        reason: data.reason,

        message:
          data.message || null,

        fromLevel: 0,

        toLevel: 1
      }
    });


    // --------------------------------------------------------
    // NOTIFY STUDENT
    // --------------------------------------------------------

    try {
      await prisma.notification.create({
        data: {
          userId: complaint.studentId,

          complaintId: complaint.id,

          type: 'ESCALATION',

          title: 'Complaint Escalated',

          message:
            `Your hostel complaint "${complaint.title}" ` +
            `has been escalated from Warden to HOD.`
        }
      });
    } catch (error) {
      console.error(
        'Escalation notification error:',
        error.message
      );
    }


    res.json({
      message:
        'Complaint successfully escalated to HOD.',

      complaint: updatedComplaint
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid escalation data.',

        errors: error.flatten()
      });
    }

    console.error(
      'Warden escalation error:',
      error.message
    );

    res.status(500).json({
      message: 'Failed to escalate complaint.'
    });
  }
}