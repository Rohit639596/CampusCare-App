import OpenAI from 'openai';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiResultSchema = z.object({
  category: z.enum([
    'HOSTEL',
    'ACADEMICS',
    'FEES',
    'LIBRARY',
    'TRANSPORT',
    'IT',
    'INFRASTRUCTURE',
    'CLEANLINESS',
    'SECURITY',
    'ADMINISTRATION',
    'OTHER',
  ]),

  priority: z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
  ]),

  sentiment: z.enum([
    'POSITIVE',
    'NEUTRAL',
    'NEGATIVE',
  ]),

  urgency: z.enum([
    'LOW',
    'NORMAL',
    'HIGH',
    'IMMEDIATE',
  ]),

  summary: z.string().min(1).max(1000),

  recommendation: z.string().min(1).max(1500),
});

export async function analyzeComplaint({
  title,
  description,
  category,
  location,
}) {
  const prompt = `
You are CampusCare AI, an intelligent student grievance analysis system.

Analyze the following student complaint and return ONLY valid JSON.

Complaint Title:
${title}

Complaint Description:
${description}

Student Selected Category:
${category}

Location:
${location || 'Not provided'}

Your task is to determine:

1. category:
Choose exactly one:
HOSTEL, ACADEMICS, FEES, LIBRARY, TRANSPORT, IT,
INFRASTRUCTURE, CLEANLINESS, SECURITY, ADMINISTRATION, OTHER

2. priority:
Choose exactly one:
LOW, MEDIUM, HIGH, CRITICAL

3. sentiment:
Choose exactly one:
POSITIVE, NEUTRAL, NEGATIVE

4. urgency:
Choose exactly one:
LOW, NORMAL, HIGH, IMMEDIATE

5. summary:
Give a short and clear summary of the complaint.

6. recommendation:
Give a practical recommendation for the college administrator.
Do not make the final decision for the administrator.

Priority guidelines:
- LOW: Minor issue with little immediate impact.
- MEDIUM: Normal issue that should be handled in a reasonable time.
- HIGH: Serious issue affecting studies, facilities, safety, or many students.
- CRITICAL: Immediate serious risk to student safety, security, health, or major disruption.

Urgency guidelines:
- LOW: Can be handled later.
- NORMAL: Should be handled normally.
- HIGH: Should be addressed soon.
- IMMEDIATE: Requires immediate attention because of serious safety/security or major impact.

Return exactly this JSON structure:

{
  "category": "HOSTEL",
  "priority": "MEDIUM",
  "sentiment": "NEGATIVE",
  "urgency": "HIGH",
  "summary": "Short summary here",
  "recommendation": "Recommended administrative action here"
}
`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL,

    messages: [
      {
        role: 'system',
        content:
          'You are CampusCare AI. Analyze student complaints accurately and return only valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],

    response_format: {
      type: 'json_object',
    },

  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('AI returned an empty response.');
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error('AI returned invalid JSON.');
  }

  const result = aiResultSchema.safeParse(parsed);

  if (!result.success) {
    console.error('Invalid AI result:', result.error.flatten());
    throw new Error('AI returned an invalid complaint analysis.');
  }

  return result.data;
}