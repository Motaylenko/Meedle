const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const course = await prisma.course.findFirst();
        if (!course) {
            console.log('No courses found');
            return;
        }
        console.log('Prisma test: creating assignment for course', course.id);
        const assignment = await prisma.assignment.create({
            data: {
                courseId: course.id,
                title: 'Test Assignment',
                deadline: new Date(),
                points: 100
            }
        });
        console.log('Success!', assignment);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
