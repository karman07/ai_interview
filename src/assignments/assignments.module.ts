import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Assignment, AssignmentSchema } from './schemas/assignment.schema';
import {
  StudentAssignment,
  StudentAssignmentSchema,
} from './schemas/student-assignment.schema';
import { Class, ClassSchema } from '../classes/schemas/class.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Result, ResultSchema } from '../results/schemas/result.schema';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assignment.name, schema: AssignmentSchema },
      { name: StudentAssignment.name, schema: StudentAssignmentSchema },
      { name: Class.name, schema: ClassSchema },
      { name: User.name, schema: UserSchema },
      { name: Result.name, schema: ResultSchema },
    ]),
  ],
  providers: [AssignmentsService],
  controllers: [AssignmentsController],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
