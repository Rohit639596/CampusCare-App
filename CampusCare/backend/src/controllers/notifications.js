import { prisma } from '../utils/prisma.js';

export async function getMyNotifications(req, res) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    return res.status(500).json({
      message: 'Failed to fetch notifications.',
    });
  }
}


export async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found.',
      });
    }

    const updatedNotification =
      await prisma.notification.update({
        where: {
          id,
        },
        data: {
          isRead: true,
        },
      });

    return res.json({
      message: 'Notification marked as read.',
      notification: updatedNotification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);

    return res.status(500).json({
      message: 'Failed to update notification.',
    });
  }
}


export async function markAllNotificationsAsRead(req, res) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return res.json({
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error(
      'Mark all notifications read error:',
      error
    );

    return res.status(500).json({
      message: 'Failed to update notifications.',
    });
  }
}