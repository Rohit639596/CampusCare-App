import OpenAI from 'openai';
import { prisma } from '../utils/prisma.js';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return (
    dotProduct /
    (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB))
  );
}

export async function generateEmbedding(text) {
  const response = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL,
    input: text,
  });

  const embedding = response.data?.[0]?.embedding;

  if (!embedding) {
    throw new Error('Failed to generate embedding.');
  }

  return embedding;
}

export async function detectDuplicateComplaint({
  title,
  description,
  category,
  location,
  complaintId,
}) {
  const text = `
Title: ${title}
Description: ${description}
Category: ${category}
Location: ${location || 'Not provided'}
`;

  const newEmbedding = await generateEmbedding(text);

  const existingComplaints = await prisma.complaint.findMany({
    where: {
      id: {
        not: complaintId,
      },
      embedding: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      location: true,
      embedding: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 500,
  });

  let bestMatch = null;

  for (const complaint of existingComplaints) {
    try {
      const existingEmbedding = JSON.parse(complaint.embedding);

      const similarity = cosineSimilarity(
        newEmbedding,
        existingEmbedding
      );

      if (
        !bestMatch ||
        similarity > bestMatch.similarity
      ) {
        bestMatch = {
          complaint,
          similarity,
        };
      }
    } catch (error) {
      console.error(
        `Invalid embedding for complaint ${complaint.id}`
      );
    }
  }

  return {
    embedding: newEmbedding,
    duplicate: bestMatch
      ? {
          complaintId: bestMatch.complaint.id,
          similarity: bestMatch.similarity,
          percentage: Math.round(
            bestMatch.similarity * 100
          ),
        }
      : null,
  };
}