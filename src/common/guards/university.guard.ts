import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class UniversityGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.universityId) {
      throw new ForbiddenException('This feature is only available for university students and teachers.');
    }
    
    return true;
  }
}
