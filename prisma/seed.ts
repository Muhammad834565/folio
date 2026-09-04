import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')
  
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Owner',
      email: 'owner@example.com',
    },
  })
  
  const collaborator = await prisma.user.upsert({
    where: { email: 'collaborator@example.com' },
    update: {},
    create: {
      name: 'Collaborator',
      email: 'collaborator@example.com',
    },
  })

  console.log(`Created users: ${owner.name} (${owner.id}) and ${collaborator.name} (${collaborator.id})`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
