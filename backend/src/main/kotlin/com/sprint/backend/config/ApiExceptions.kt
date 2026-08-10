package com.sprint.backend.config

class UnauthorizedException(message: String) : RuntimeException(message)
class ForbiddenException(message: String) : RuntimeException(message)
class ConflictException(message: String) : RuntimeException(message)
class NotFoundException(message: String) : RuntimeException(message)
