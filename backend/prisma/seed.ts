import { PrismaClient, TransactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Create default badges
  const sharingBadge = await prisma.badge.upsert({
    where: { name: 'First Share' },
    update: {},
    create: {
      name: 'First Share',
      description: 'Share your first code snippet',
      pointValue: 10,
      category: 'sharing',
      color: '#28a745'
    }
  });

  const reviewerBadge = await prisma.badge.upsert({
    where: { name: 'Code Reviewer' },
    update: {},
    create: {
      name: 'Code Reviewer',
      description: 'Write your first code review',
      pointValue: 5,
      category: 'reviewing',
      color: '#17a2b8'
    }
  });

  const communityBadge = await prisma.badge.upsert({
    where: { name: 'Community Member' },
    update: {},
    create: {
      name: 'Community Member',
      description: 'Join the CodeCollab community',
      pointValue: 0,
      category: 'community',
      color: '#6f42c1'
    }
  });

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@codecollab.com' },
    update: {},
    create: {
      email: 'demo@codecollab.com',
      username: 'demo_user',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      bio: 'A demo user for testing CodeCollab features',
      points: 100,
      level: 2
    }
  });

  // Award community badge to demo user
  await prisma.userBadge.upsert({
    where: {
      userId_badgeId: {
        userId: demoUser.id,
        badgeId: communityBadge.id
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      badgeId: communityBadge.id
    }
  });

  // Create a demo snippet
  const demoSnippet = await prisma.snippet.upsert({
    where: { id: 'demo-snippet-001' },
    update: {},
    create: {
      id: 'demo-snippet-001',
      title: 'Hello World in JavaScript',
      description: 'A simple Hello World example in JavaScript',
      content: 'console.log("Hello, CodeCollab!");',
      language: 'javascript',
      tags: ['beginner', 'example', 'javascript'],
      authorId: demoUser.id,
      views: 42,
      likes: 5
    }
  });

  // Create a point transaction for the demo user
  await prisma.pointTransaction.create({
    data: {
      userId: demoUser.id,
      amount: 10,
      reason: 'Welcome bonus for joining CodeCollab',
      type: TransactionType.BONUS
    }
  });

  console.log('Database seeded successfully!');
  console.log(`Created badges: ${sharingBadge.name}, ${reviewerBadge.name}, ${communityBadge.name}`);
  console.log(`Created demo user: ${demoUser.username}`);
  console.log(`Created demo snippet: ${demoSnippet.title}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
